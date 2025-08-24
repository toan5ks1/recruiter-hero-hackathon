-- AlterTable
ALTER TABLE "cvs" ADD COLUMN     "aiCallNotes" TEXT,
ADD COLUMN     "callResult" TEXT,
ADD COLUMN     "callStatus" TEXT,
ADD COLUMN     "lastCallDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ai_calls" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER NOT NULL,
    "candidatePhone" TEXT NOT NULL,
    "aiVoice" TEXT NOT NULL DEFAULT 'sarah',
    "customInstructions" TEXT,
    "questions" JSONB,
    "transcript" JSONB,
    "aiAnalysis" JSONB,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "result" TEXT,
    "score" INTEGER,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_calls_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ai_calls" ADD CONSTRAINT "ai_calls_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
