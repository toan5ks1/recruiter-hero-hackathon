import { NextResponse } from "next/server";
import { deepseek } from "@ai-sdk/deepseek";
import { JsonObject } from "@prisma/client/runtime/library";
import { generateObject } from "ai";

import { prisma } from "@/lib/db";
import { resumeScoreSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const { cvId, jdContent, cvContent } = await req.json();

    const result = await generateObject({
      model: deepseek("deepseek-chat"),
      messages: [
        {
          role: "system",
          content: `You are an expert career advisor specialized in resume evaluation. Your task is to:
1. Extract structured resume data according to the required schema
2. Score the resume against the job description objectively
3. Return results in EXACTLY this JSON format:
{
  "resume": {
    "profile": "string or null",
    "skills": ["string"] or null,
    "education": [
      {
        "degree": "string or null",
        "school": "string or null", 
        "startDate": "string or null",
        "endDate": "string or null",
        "description": "string or null"
      }
    ] or null,
    "workExperience": [
      {
        "title": "string or null",
        "company": "string or null",
        "startDate": "string or null", 
        "endDate": "string or null",
        "description": "string or null"
      }
    ] or null,
    "projects": [
      {
        "title": "string or null",
        "description": "string or null",
        "technologies": "string or null"
      }
    ] or null,
    "certifications": [
      {
        "name": "string or null",
        "issuer": "string or null",
        "date": "string or null"
      }
    ] or null,
    "languages": ["string"] or null,
    "contact": {
      "name": "string or null",
      "email": "string or null",
      "phone": "string or null",
      "location": "string or null",
      "linkedin": "string or null"
    } or null
  },
  "score": {
    "totalScore": number (0-100),
    "skillScore": number (0-100),
    "experienceScore": number (0-100),
    "educationScore": number (0-100),
    "languageScore": number (0-100),
    "notes": "string" (optional),
    "reasoning": "string",
    "strengths": ["string"] (optional),
    "weaknesses": ["string"] (optional)
  }
}

### Extraction Rules:
- Omit null/empty fields from the resume structure
- Preserve all original resume content (don't paraphrase)
- Maintain field names exactly as in the schema
- Use null for missing values, not undefined or empty strings
- All arrays should be empty arrays if no data found, not null

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
   - If the JD specifies required languages, evaluate the candidate accordingly. If not specified, assess the candidate's language proficiency based on the language used in their CV

### Output Requirements:
- All score fields must be numbers between 0-100
- "reasoning" must explain score calculations
- "strengths/weaknesses" must be specific and actionable
- Never invent information not in the resume
- Return empty arrays [] instead of null for missing array data

Provide your evaluation in the exact specified JSON format without deviation.`,
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

    return NextResponse.json({ data: result.object });
  } catch (error) {
    console.error("CV scoring error:", error);
    return NextResponse.json(
      {
        error: "Failed to score CV",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
