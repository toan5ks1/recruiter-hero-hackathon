import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      cvId,
      scheduledAt,
      duration,
      candidatePhone,
      aiVoice,
      customInstructions,
      questions,
    } = await req.json();

    // Validate required fields
    if (!cvId || !scheduledAt || !candidatePhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
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

    // Create AI call record
    const aiCall = await prisma.aICall.create({
      data: {
        cvId,
        scheduledAt: new Date(scheduledAt),
        duration,
        candidatePhone,
        aiVoice,
        customInstructions,
        questions: { questions },
        status: "scheduled",
        createdBy: session.user.id,
      },
    });

    // Update CV status
    await prisma.cV.update({
      where: { id: cvId },
      data: {
        status: "ai_call_scheduled",
        lastCallDate: new Date(),
        callStatus: "scheduled",
      },
    });

    return NextResponse.json(aiCall);
  } catch (error) {
    console.error("Error scheduling AI call:", error);
    return NextResponse.json(
      { error: "Failed to schedule AI call" },
      { status: 500 },
    );
  }
}
