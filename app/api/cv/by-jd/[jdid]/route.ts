import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jdid: string }> },
) {
  const { jdid } = await params;

  const cvs = await prisma.cV.findMany({
    where: { jobDescriptionId: jdid },
    include: {
      aiCalls: {
        select: {
          id: true,
          status: true,
          score: true,
          endedAt: true,
          scheduledAt: true,
        },
        orderBy: {
          scheduledAt: "desc",
        },
        take: 1, // Get the latest interview only
      },
    },
  });

  // Transform data to include interview status
  const transformedCvs = cvs.map((cv) => {
    const latestInterview = cv.aiCalls[0];

    return {
      ...cv,
      latestInterviewStatus: latestInterview?.status,
      latestInterviewScore: latestInterview?.score,
      hasCompletedInterview:
        latestInterview?.status === "completed" &&
        latestInterview?.endedAt !== null,
      aiCalls: undefined, // Remove the aiCalls from the response
    };
  });

  return NextResponse.json(transformedCvs);
}
