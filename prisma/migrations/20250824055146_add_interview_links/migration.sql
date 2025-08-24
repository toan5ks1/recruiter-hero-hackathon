/*
  Warnings:

  - A unique constraint covering the columns `[interviewLink]` on the table `ai_calls` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ai_calls" ADD COLUMN     "candidateEmail" TEXT,
ADD COLUMN     "candidateName" TEXT,
ADD COLUMN     "interviewLink" TEXT,
ADD COLUMN     "linkGeneratedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "ai_calls_interviewLink_key" ON "ai_calls"("interviewLink");
