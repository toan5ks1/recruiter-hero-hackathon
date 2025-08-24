import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

import { prisma } from "@/lib/db";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: cvId } = params;

    if (!cvId) {
      return NextResponse.json({ error: "CV ID is required" }, { status: 400 });
    }

    // Verify user owns this CV
    const cv = await prisma.cV.findUnique({
      where: { id: cvId },
      include: { jobDescription: true },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    if (cv.jobDescription.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch all interviews for this CV
    const interviews = await prisma.aICall.findMany({
      where: { cvId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        interviewMode: true,
        scheduledAt: true,
        duration: true,
        candidateName: true,
        candidateEmail: true,
        status: true,
        interviewLink: true,
        linkGeneratedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(interviews);
  } catch (error) {
    console.error("Error fetching CV interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 },
    );
  }
}
