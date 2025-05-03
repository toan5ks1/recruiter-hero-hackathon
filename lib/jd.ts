"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

import {
  createJobDescriptionSchema,
  updateJobDescriptionSchema,
} from "@/lib/validations/jd";

import { prisma } from "./db";

export async function getAllJD() {
  try {
    const jobs = await prisma.jobDescription.findMany();
    return jobs;
  } catch (error) {
    console.error("Error fetching job descriptions:", error);
    throw new Error("Failed to load job descriptions");
  }
}

export const getJDById = async (id: string) => {
  try {
    const jd = await prisma.jobDescription.findUnique({
      where: { id },
    });

    return jd;
  } catch {
    return null;
  }
};

export async function createJD(formData: { title: string; content: string }) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const parsed = createJobDescriptionSchema.safeParse(formData);

  if (!parsed.success) {
    throw new Error(JSON.stringify(parsed.error.flatten()));
  }

  const jd = await prisma.jobDescription.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      userId: session.user.id,
    },
  });

  redirect(`/dashboard/${jd.id}`);
}

export async function updateJD(
  id: string,
  data: { title: string; content: string },
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const parsed = updateJobDescriptionSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error(JSON.stringify(parsed.error.flatten()));
  }

  const existingJD = await prisma.jobDescription.findUnique({
    where: { id },
  });

  if (!existingJD) {
    throw new Error("Job Description not found");
  }

  if (existingJD.userId !== session.user.id) {
    throw new Error("Unauthorized to update this Job Description");
  }

  const updatedJD = await prisma.jobDescription.update({
    where: { id },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
    },
  });

  revalidatePath(`/dashboard/${id}`);

  return updatedJD;
}
