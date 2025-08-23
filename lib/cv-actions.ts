"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

import { prisma } from "./db";

export async function updateCVStatus(
  cvId: string,
  status:
    | "processing"
    | "cancelled"
    | "success"
    | "qualified"
    | "disqualified"
    | "interview_scheduled"
    | "interview_completed",
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  try {
    // First verify the user owns this CV through the job description
    const cv = await prisma.cV.findUnique({
      where: { id: cvId },
      include: {
        jobDescription: true,
      },
    });

    if (!cv) {
      throw new Error("CV not found");
    }

    if (cv.jobDescription.userId !== session.user.id) {
      throw new Error("Unauthorized");
    }

    const updatedCV = await prisma.cV.update({
      where: { id: cvId },
      data: { status },
    });

    revalidatePath(`/dashboard/${cv.jobDescriptionId}`);
    return updatedCV;
  } catch (error) {
    console.error("Failed to update CV status:", error);
    throw error;
  }
}

export async function toggleShortlist(cvId: string, shortlisted: boolean) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  try {
    // First verify the user owns this CV through the job description
    const cv = await prisma.cV.findUnique({
      where: { id: cvId },
      include: {
        jobDescription: true,
      },
    });

    if (!cv) {
      throw new Error("CV not found");
    }

    if (cv.jobDescription.userId !== session.user.id) {
      throw new Error("Unauthorized");
    }

    const updatedCV = await prisma.cV.update({
      where: { id: cvId },
      data: { shortlisted },
    });

    revalidatePath(`/dashboard/${cv.jobDescriptionId}`);
    return updatedCV;
  } catch (error) {
    console.error("Failed to update CV shortlist status:", error);
    throw error;
  }
}

export async function updateReviewerNote(cvId: string, note: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  try {
    // First verify the user owns this CV through the job description
    const cv = await prisma.cV.findUnique({
      where: { id: cvId },
      include: {
        jobDescription: true,
      },
    });

    if (!cv) {
      throw new Error("CV not found");
    }

    if (cv.jobDescription.userId !== session.user.id) {
      throw new Error("Unauthorized");
    }

    const updatedCV = await prisma.cV.update({
      where: { id: cvId },
      data: { reviewerNote: note },
    });

    revalidatePath(`/dashboard/${cv.jobDescriptionId}`);
    return updatedCV;
  } catch (error) {
    console.error("Failed to update reviewer note:", error);
    throw error;
  }
}
