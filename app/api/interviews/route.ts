import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";
import { generateInterviewLink } from "@/lib/interview-utils";
import { createInterviewAssistant } from "@/lib/vapi";

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

    // Create Vapi assistant for this interview
    let vapiAssistantId: string | null = null;

    // Check if Vapi is configured
    console.log("🔍 Checking VAPI configuration...");
    console.log("VAPI_API_KEY present:", !!env.VAPI_API_KEY);
    console.log(
      "NEXT_PUBLIC_VAPI_PUBLIC_KEY present:",
      !!env.NEXT_PUBLIC_VAPI_PUBLIC_KEY,
    );

    if (env.VAPI_API_KEY && env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
      try {
        console.log("🚀 Creating Vapi assistant for interview...");
        console.log("Job Title:", cv.jobDescription.title);
        console.log("Candidate Name:", candidateName);

        const assistant = await createInterviewAssistant(
          cv.jobDescription.title,
          cv.jobDescription.content,
          candidateName,
          questions?.questions || [],
        );

        vapiAssistantId = assistant.id;
        console.log(
          `✅ Successfully created Vapi assistant: ${vapiAssistantId}`,
        );
      } catch (error) {
        console.error("❌ Error creating Vapi assistant:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
        console.warn(
          "Continuing without Vapi integration - assistant creation failed",
        );
        // Continue without Vapi integration if assistant creation fails
      }
    } else {
      console.warn(
        "❌ Vapi not configured - interviews will work without voice functionality.",
      );
      console.warn(`VAPI_API_KEY: ${env.VAPI_API_KEY ? "SET" : "MISSING"}`);
      console.warn(
        `NEXT_PUBLIC_VAPI_PUBLIC_KEY: ${env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ? "SET" : "MISSING"}`,
      );
    }

    // Create AI call record with interview link and Vapi assistant
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
        questions: questions ? { questions } : undefined,
        status: "scheduled",
        createdBy: session.user.id,
        interviewLink,
        linkGeneratedAt: new Date(),
        vapiAssistantId,
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
    const fullInterviewLink = `${env.NEXT_PUBLIC_APP_URL}/interview/${interviewLink}`;

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
