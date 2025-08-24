import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

import { prisma } from "@/lib/db";
import { vapiServerClient } from "@/lib/vapi";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interviewId = params.id;

    // Find the interview record
    const interview = await prisma.aICall.findUnique({
      where: { id: interviewId },
      include: {
        cv: {
          include: { jobDescription: true },
        },
      },
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 },
      );
    }

    // Verify user owns this interview
    if (interview.cv.jobDescription.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if interview has Vapi assistant
    if (!interview.vapiAssistantId) {
      return NextResponse.json(
        { error: "No Vapi assistant configured for this interview" },
        { status: 400 },
      );
    }

    // For phone calls, initiate outbound call
    if (interview.interviewMode === "phone" && interview.candidatePhone) {
      try {
        const vapiCall = await vapiServerClient.createCall({
          assistantId: interview.vapiAssistantId,
          customer: {
            number: interview.candidatePhone,
            name: interview.candidateName || undefined,
            email: interview.candidateEmail || undefined,
          },
        });

        // Update interview record with Vapi call details
        const updatedInterview = await prisma.aICall.update({
          where: { id: interviewId },
          data: {
            vapiCallId: vapiCall.id,
            vapiCallStatus: vapiCall.status,
            status: "ai_call_in_progress",
            startedAt: new Date(),
          },
        });

        // Update CV status
        await prisma.cV.update({
          where: { id: interview.cvId },
          data: {
            status: "ai_call_in_progress",
            callStatus: "in_progress",
          },
        });

        return NextResponse.json({
          success: true,
          vapiCallId: vapiCall.id,
          status: vapiCall.status,
          message: "Phone call initiated successfully",
        });
      } catch (error) {
        console.error("Error starting phone call:", error);
        return NextResponse.json(
          { error: "Failed to initiate phone call" },
          { status: 500 },
        );
      }
    }

    // For link interviews, just return the assistant ID for web SDK
    return NextResponse.json({
      success: true,
      assistantId: interview.vapiAssistantId,
      interviewMode: interview.interviewMode,
      message: "Interview ready for web connection",
    });
  } catch (error) {
    console.error("Error starting interview call:", error);
    return NextResponse.json(
      { error: "Failed to start interview call" },
      { status: 500 },
    );
  }
}
