import { z } from "zod";

export const questionSchema = z.object({
  question: z.string(),
  options: z
    .array(z.string())
    .length(4)
    .describe(
      "Four possible answers to the question. Only one should be correct. They should all be of equal lengths.",
    ),
  answer: z
    .enum(["A", "B", "C", "D"])
    .describe(
      "The correct answer, where A is the first option, B is the second, and so on.",
    ),
});

export type Question = z.infer<typeof questionSchema>;

export const questionsSchema = z.array(questionSchema).length(4);

const nullableString = z.string().nullable().optional();

export const resumeSchema = z.object({
  profile: nullableString,
  skills: z.array(z.string()).nullable().optional(),
  education: z
    .array(
      z.object({
        degree: nullableString,
        school: nullableString,
        startDate: nullableString,
        endDate: nullableString,
        description: nullableString,
      }),
    )
    .nullable()
    .optional(),
  workExperience: z
    .array(
      z.object({
        title: nullableString,
        company: nullableString,
        startDate: nullableString,
        endDate: nullableString,
        description: nullableString,
      }),
    )
    .nullable()
    .optional(),
  projects: z
    .array(
      z.object({
        title: nullableString,
        description: nullableString,
        technologies: nullableString,
      }),
    )
    .nullable()
    .optional(),
  certifications: z
    .array(
      z.object({
        name: nullableString,
        issuer: nullableString,
        date: nullableString,
      }),
    )
    .nullable()
    .optional(),
  languages: z.array(z.string()).nullable().optional(),
  contact: z
    .object({
      name: nullableString,
      email: nullableString,
      phone: nullableString,
      location: nullableString,
      linkedin: nullableString,
    })
    .nullable()
    .optional(),
});

export type Resume = z.infer<typeof resumeSchema>;

export const scoreResultSchema = z.object({
  totalScore: z.number().min(0).max(100),
  skillScore: z.number().min(0).max(100),
  experienceScore: z.number().min(0).max(100),
  educationScore: z.number().min(0).max(100),
  languageScore: z.number().min(0).max(100),
  notes: z.string().optional(),
  reasoning: z.string(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
});

export type Score = z.infer<typeof scoreResultSchema>;

export const resumeScoreSchema = z.object({
  resume: resumeSchema,
  score: scoreResultSchema,
});

export const resumeScoreResultSchema = z.object({
  fileName: z.string(),
  data: resumeScoreSchema,
});
