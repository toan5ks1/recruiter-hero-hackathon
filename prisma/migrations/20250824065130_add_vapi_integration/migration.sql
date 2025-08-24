-- AlterTable
ALTER TABLE "ai_calls" ADD COLUMN     "vapiAssistantId" TEXT,
ADD COLUMN     "vapiCallId" TEXT,
ADD COLUMN     "vapiCallStatus" TEXT,
ADD COLUMN     "vapiCost" DOUBLE PRECISION,
ADD COLUMN     "vapiRecordingUrl" TEXT,
ADD COLUMN     "vapiSummary" TEXT,
ADD COLUMN     "vapiTranscript" TEXT,
ALTER COLUMN "candidatePhone" DROP NOT NULL;
