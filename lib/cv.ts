"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { deepseek } from "@ai-sdk/deepseek";
import { JsonObject } from "@prisma/client/runtime/library";
import { generateObject } from "ai";

import { resumeScoreSchema } from "@/lib/schemas";

import { prisma } from "./db";

export async function createCV({
  jdId,
  fileName,
  content,
}: {
  jdId: string;
  fileName: string;
  content: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const createdCV = await prisma.cV.create({
    data: {
      jobDescriptionId: jdId,
      fileName: fileName,
      content: content,
      resume: {},
      score: {},
    },
  });

  revalidatePath(`/dashboard/${jdId}`);

  return createdCV;
}

export async function scoreCV({
  cvId,
  jdId,
  jdContent,
  cvContent,
}: {
  cvId: string;
  jdId: string;
  cvContent: string;
  jdContent: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  await prisma.cV.update({
    where: { id: cvId },
    data: {
      status: "processing",
    },
  });

  revalidatePath(`/dashboard/${jdId}`);

  const result = await generateObject({
    model: deepseek("deepseek-chat"),
    messages: [
      {
        role: "system",
        content: `You are an expert career advisor specialized in resume evaluation. Your task is to:
1. Extract structured resume data according to the required schema
2. Score the resume against the job description objectively
3. Return results in EXACTLY this format:
{
  "resume": { /* structured resume data */ },
  "score": { /* structured score data */ }
}

### Extraction Rules:
- Omit null/empty fields from the resume structure
- Preserve all original resume content (don't paraphrase)
- Maintain field names exactly as in the schema

### Scoring Guidelines:
1. Skills (30% weight):
   - Match between resume skills and JD requirements
   - Include both hard and soft skills

2. Experience (40% weight):
   - Relevance of past roles to JD
   - Years of experience in required areas
   - Notable achievements matching JD needs

3. Education (20% weight):
   - Degree relevance to JD
   - Prestige/recognition of institutions
   - Special certifications mentioned in JD

4. Languages (10% weight):
   - If the JD specifies required languages, evaluate the candidate accordingly. If not specified, assess the candidate’s language proficiency based on the language used in their CV

### Output Requirements:
- education, workExperience, projects, certifications must be arrays 
- If a field is not found, return null or an empty array
- All scores must be integers between 0-100
- "reasoning" must explain score calculations
- "strengths/weaknesses" must be specific and actionable
- Never invent information not in the resume

Provide your evaluation in the exact specified format without deviation.`,
      },
      {
        role: "user",
        content: [
          { type: "text", text: `JOB DESCRIPTION:\n ${jdContent}` },
          {
            type: "text",
            text: `
CANDIDATE RESUME:\n${cvContent}`,
          },
        ],
      },
    ],
    schema: resumeScoreSchema,
  });

  await prisma.cV.update({
    where: { id: cvId },
    data: {
      resume: result.object.resume as JsonObject,
      score: result.object.score as JsonObject,
      totalScore: result.object.score.totalScore,
      status: "success",
    },
  });
}
