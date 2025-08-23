"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

import { prisma } from "./db";

interface CreateInterviewRoundData {
  cvId: string;
  roundType: "phone" | "technical" | "panel" | "final";
  scheduledAt: Date;
  durationMinutes?: number;
  interviewerEmail?: string;
  interviewerName?: string;
  questions?: string[];
}

interface UpdateInterviewRoundData {
  status?: "scheduled" | "completed" | "cancelled" | "rescheduled";
  feedback?: any;
  rating?: number;
  notes?: string;
  scheduledAt?: Date;
}

export async function createInterviewRound(data: CreateInterviewRoundData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  try {
    // Verify user owns this CV
    const cv = await prisma.cV.findUnique({
      where: { id: data.cvId },
      include: { jobDescription: true },
    });

    if (!cv) {
      throw new Error("CV not found");
    }

    if (cv.jobDescription.userId !== session.user.id) {
      throw new Error("Unauthorized");
    }

    const interviewRound = await prisma.interviewRound.create({
      data: {
        cvId: data.cvId,
        roundType: data.roundType,
        scheduledAt: data.scheduledAt,
        durationMinutes: data.durationMinutes || 60,
        interviewerEmail: data.interviewerEmail,
        interviewerName: data.interviewerName,
        questions: data.questions ? { questions: data.questions } : null,
      },
    });

    // Update CV status to reflect interview scheduling
    await prisma.cV.update({
      where: { id: data.cvId },
      data: {
        status: "interview_scheduled",
        interviewStage: data.roundType,
        interviewScheduledAt: data.scheduledAt,
      },
    });

    revalidatePath(`/dashboard/${cv.jobDescriptionId}`);
    return interviewRound;
  } catch (error) {
    console.error("Failed to create interview round:", error);
    throw error;
  }
}

export async function updateInterviewRound(
  roundId: string,
  data: UpdateInterviewRoundData,
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  try {
    // Verify user owns this interview round
    const round = await prisma.interviewRound.findUnique({
      where: { id: roundId },
      include: {
        cv: {
          include: { jobDescription: true },
        },
      },
    });

    if (!round) {
      throw new Error("Interview round not found");
    }

    if (round.cv.jobDescription.userId !== session.user.id) {
      throw new Error("Unauthorized");
    }

    const updatedRound = await prisma.interviewRound.update({
      where: { id: roundId },
      data,
    });

    // Update CV status if interview is completed
    if (data.status === "completed") {
      await prisma.cV.update({
        where: { id: round.cvId },
        data: {
          status: "interview_completed",
          interviewNotes: data.notes,
          interviewFeedback: data.feedback,
        },
      });
    }

    revalidatePath(`/dashboard/${round.cv.jobDescriptionId}`);
    return updatedRound;
  } catch (error) {
    console.error("Failed to update interview round:", error);
    throw error;
  }
}

export async function getInterviewRounds(cvId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  try {
    // Verify user owns this CV
    const cv = await prisma.cV.findUnique({
      where: { id: cvId },
      include: { jobDescription: true },
    });

    if (!cv) {
      throw new Error("CV not found");
    }

    if (cv.jobDescription.userId !== session.user.id) {
      throw new Error("Unauthorized");
    }

    const rounds = await prisma.interviewRound.findMany({
      where: { cvId },
      orderBy: { createdAt: "desc" },
    });

    return rounds;
  } catch (error) {
    console.error("Failed to get interview rounds:", error);
    throw error;
  }
}

export async function deleteInterviewRound(roundId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  try {
    // Verify user owns this interview round
    const round = await prisma.interviewRound.findUnique({
      where: { id: roundId },
      include: {
        cv: {
          include: { jobDescription: true },
        },
      },
    });

    if (!round) {
      throw new Error("Interview round not found");
    }

    if (round.cv.jobDescription.userId !== session.user.id) {
      throw new Error("Unauthorized");
    }

    await prisma.interviewRound.delete({
      where: { id: roundId },
    });

    // Check if there are any remaining scheduled interviews
    const remainingRounds = await prisma.interviewRound.findMany({
      where: { cvId: round.cvId },
    });

    // Update CV status if no more interviews
    if (remainingRounds.length === 0) {
      await prisma.cV.update({
        where: { id: round.cvId },
        data: {
          status: "shortlisted",
          interviewStage: null,
          interviewScheduledAt: null,
        },
      });
    }

    revalidatePath(`/dashboard/${round.cv.jobDescriptionId}`);
  } catch (error) {
    console.error("Failed to delete interview round:", error);
    throw error;
  }
}
