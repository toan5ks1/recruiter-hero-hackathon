import { NextResponse } from "next/server";
import { auth } from "@/auth";

import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all shortlisted CVs for the user's job descriptions
    const shortlistedCVs = await prisma.cV.findMany({
      where: {
        shortlisted: true,
        jobDescription: {
          userId: session.user.id,
        },
      },
      include: {
        jobDescription: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [
        { totalScore: "desc" }, // Sort by score first (highest first)
        { uploadedAt: "desc" }, // Then by upload date (newest first)
      ],
    });

    return NextResponse.json(shortlistedCVs);
  } catch (error) {
    console.error("Error fetching shortlisted CVs:", error);
    return NextResponse.json(
      { error: "Failed to fetch shortlisted CVs" },
      { status: 500 },
    );
  }
}
