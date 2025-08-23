/*
  Warnings:

  - You are about to drop the column `educationScore` on the `cvs` table. All the data in the column will be lost.
  - You are about to drop the column `experienceScore` on the `cvs` table. All the data in the column will be lost.
  - You are about to drop the column `languageScore` on the `cvs` table. All the data in the column will be lost.
  - You are about to drop the column `parsedResume` on the `cvs` table. All the data in the column will be lost.
  - You are about to drop the column `parsedScore` on the `cvs` table. All the data in the column will be lost.
  - You are about to drop the column `skillScore` on the `cvs` table. All the data in the column will be lost.
  - Added the required column `content` to the `cvs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileName` to the `cvs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resume` to the `cvs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `cvs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cvs" DROP COLUMN "educationScore",
DROP COLUMN "experienceScore",
DROP COLUMN "languageScore",
DROP COLUMN "parsedResume",
DROP COLUMN "parsedScore",
DROP COLUMN "skillScore",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "interviewFeedback" JSONB,
ADD COLUMN     "interviewNotes" TEXT,
ADD COLUMN     "interviewQuestions" JSONB,
ADD COLUMN     "interviewScheduledAt" TIMESTAMP(3),
ADD COLUMN     "interviewStage" TEXT,
ADD COLUMN     "resume" JSONB NOT NULL,
ADD COLUMN     "score" JSONB NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'created',
ALTER COLUMN "fileUrl" DROP NOT NULL;

-- CreateTable
CREATE TABLE "interview_rounds" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "roundType" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "interviewerEmail" TEXT,
    "interviewerName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "questions" JSONB,
    "feedback" JSONB,
    "rating" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_rounds_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "interview_rounds" ADD CONSTRAINT "interview_rounds_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
