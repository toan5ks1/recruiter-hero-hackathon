import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

import { prisma } from "@/lib/db";
import { generateInterviewLink } from "@/lib/interview-utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      cvId,
      interviewMode,
      scheduledAt,
      duration,
      candidatePhone,
      candidateName,
      candidateEmail,
      aiVoice,
      customInstructions,
      questions,
    } = await req.json();

    // Validate required fields
    if (!cvId || !scheduledAt || !candidateName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate phone number for phone interviews
    if (interviewMode === "phone" && !candidatePhone) {
      return NextResponse.json(
        { error: "Phone number is required for phone interviews" },
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

    // Generate unique interview link
    const interviewLink = generateInterviewLink();

    // Create AI call record with interview link
    const aiCall = await prisma.aICall.create({
      data: {
        cvId,
        interviewMode: interviewMode || "link",
        scheduledAt: new Date(scheduledAt),
        duration: parseInt(duration),
        candidatePhone,
        candidateName,
        candidateEmail,
        aiVoice,
        customInstructions,
        questions: questions ? { questions } : null,
        status: "scheduled",
        createdBy: session.user.id,
        interviewLink,
        linkGeneratedAt: new Date(),
      },
    });

    // Update CV status
    await prisma.cV.update({
      where: { id: cvId },
      data: {
        status:
          interviewMode === "phone" ? "ai_call_scheduled" : "ai_call_ready",
        lastCallDate: new Date(),
        callStatus: "scheduled",
      },
    });

    // Return the full interview link URL
    const fullInterviewLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/interview/${interviewLink}`;

    return NextResponse.json({
      ...aiCall,
      fullInterviewLink,
    });
  } catch (error) {
    console.error("Error creating interview:", error);
    return NextResponse.json(
      { error: "Failed to create interview" },
      { status: 500 },
    );
  }
}
