import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

interface RouteParams {
  params: {
    link: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { link } = params;

    if (!link) {
      return NextResponse.json(
        { error: "Interview link is required" },
        { status: 400 },
      );
    }

    // Find interview by link
    const interview = await prisma.aICall.findUnique({
      where: { interviewLink: link },
      include: {
        cv: {
          include: {
            jobDescription: {
              select: {
                id: true,
                title: true,
                content: true,
              },
            },
          },
        },
      },
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 },
      );
    }

    // Check if interview is still valid (not expired)
    const now = new Date();
    const interviewDate = new Date(interview.scheduledAt);
    const expiryDate = new Date(interviewDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours after scheduled time

    if (now > expiryDate && interview.status === "scheduled") {
      return NextResponse.json(
        { error: "Interview link has expired" },
        { status: 410 }, // Gone
      );
    }

    // Return interview details for candidate view
    return NextResponse.json({
      id: interview.id,
      interviewMode: interview.interviewMode,
      scheduledAt: interview.scheduledAt,
      duration: interview.duration,
      candidateName: interview.candidateName,
      status: interview.status,
      questions: interview.questions,
      jobTitle: interview.cv.jobDescription.title,
      jobDescription: interview.cv.jobDescription.content,
      // Don't expose sensitive information
    });
  } catch (error) {
    console.error("Error retrieving interview by link:", error);
    return NextResponse.json(
      { error: "Failed to retrieve interview" },
      { status: 500 },
    );
  }
}
