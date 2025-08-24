import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id } = await context.params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all AI calls (interviews) for this CV
    const interviews = await prisma.aICall.findMany({
      where: {
        cvId: id,
      },
      orderBy: {
        scheduledAt: "desc",
      },
      select: {
        id: true,
        scheduledAt: true,
        endedAt: true,
        status: true,
        result: true,
        score: true,
        aiAnalysis: true,
        transcript: true,
        duration: true,
        candidateName: true,
        candidateEmail: true,
        interviewMode: true,
        vapiCallStatus: true,
        vapiTranscript: true,
        vapiSummary: true,
        vapiCost: true,
      },
    });

    // Transform the data to match the frontend interface
    const transformedInterviews = interviews.map((interview) => ({
      id: interview.id,
      scheduledAt: interview.scheduledAt.toISOString(),
      endedAt: interview.endedAt?.toISOString(),
      status: interview.status || "scheduled",
      result: interview.result,
      score: interview.score,
      aiAnalysis: interview.aiAnalysis,
      transcript:
        interview.transcript ||
        (interview.vapiTranscript
          ? { transcript: interview.vapiTranscript }
          : null),
      duration: interview.duration,
      candidateName: interview.candidateName,
      candidateEmail: interview.candidateEmail,
      interviewMode: interview.interviewMode,
      vapiCallStatus: interview.vapiCallStatus,
    }));

    return NextResponse.json(transformedInterviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 },
    );
  }
}
