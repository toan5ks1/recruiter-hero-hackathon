import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

// Vapi webhook event types
interface VapiWebhookEvent {
  type:
    | "call.started"
    | "call.ended"
    | "transcript"
    | "function-call"
    | "assistant-request"
    | "end-of-call-report";
  call?: {
    id: string;
    status: "queued" | "ringing" | "in-progress" | "forwarding" | "ended";
    startedAt?: string;
    endedAt?: string;
    cost?: number;
    costBreakdown?: {
      transport?: number;
      stt?: number;
      llm?: number;
      tts?: number;
      vapi?: number;
    };
    messages?: Array<{
      role: "user" | "assistant" | "system";
      message: string;
      time: number;
      endTime?: number;
      secondsFromStart: number;
    }>;
    transcript?: string;
    recordingUrl?: string;
    summary?: string;
    assistantId?: string;
  };
  message?: {
    type: "assistant" | "user";
    content: string;
    time: number;
    endTime?: number;
    secondsFromStart: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    // Get the webhook signature from headers for verification
    const headersList = headers();
    const signature = headersList.get("x-vapi-signature");

    // TODO: Implement signature verification for production
    // const isValid = verifyVapiSignature(body, signature, process.env.VAPI_WEBHOOK_SECRET);
    // if (!isValid) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    const event: VapiWebhookEvent = await req.json();

    console.log("Vapi webhook received:", event.type, event.call?.id);

    // Find the interview record by Vapi call ID
    let interview: any = null;
    if (event.call?.id) {
      interview = await prisma.aICall.findFirst({
        where: { vapiCallId: event.call.id },
        include: { cv: true },
      });
    }

    switch (event.type) {
      case "call.started":
        if (interview && event.call) {
          await prisma.aICall.update({
            where: { id: interview.id },
            data: {
              vapiCallStatus: event.call.status,
              startedAt: event.call.startedAt
                ? new Date(event.call.startedAt)
                : new Date(),
              status: "ai_call_in_progress",
            },
          });

          // Update CV status
          await prisma.cV.update({
            where: { id: interview.cvId },
            data: {
              status: "ai_call_in_progress",
              callStatus: "in_progress",
            },
          });
        }
        break;

      case "call.ended":
        if (interview && event.call) {
          // Calculate interview duration
          const startTime = interview.startedAt || interview.scheduledAt;
          const endTime = event.call.endedAt
            ? new Date(event.call.endedAt)
            : new Date();
          const actualDuration = Math.round(
            (endTime.getTime() - startTime.getTime()) / 1000 / 60,
          ); // minutes

          await prisma.aICall.update({
            where: { id: interview.id },
            data: {
              vapiCallStatus: event.call.status,
              endedAt: event.call.endedAt
                ? new Date(event.call.endedAt)
                : new Date(),
              status: "completed",
              vapiTranscript: event.call.transcript,
              vapiRecordingUrl: event.call.recordingUrl,
              vapiCost: event.call.cost,
              vapiSummary: event.call.summary,
              duration:
                actualDuration > 0 ? actualDuration : interview.duration, // Use actual or planned duration
            },
          });

          // Update CV status
          await prisma.cV.update({
            where: { id: interview.cvId },
            data: {
              status: "ai_call_completed",
              callStatus: "completed",
              lastCallDate: new Date(),
            },
          });
        }
        break;

      case "transcript":
        // Real-time transcript updates (optional)
        if (interview && event.message) {
          console.log(
            `Transcript update for call ${event.call?.id}:`,
            event.message.content,
          );
          // You could store real-time transcript updates here if needed
        }
        break;

      case "end-of-call-report":
        // Comprehensive call report with analytics
        if (interview && event.call) {
          const reportData = {
            transcript: event.call.transcript,
            summary: event.call.summary,
            cost: event.call.cost,
            costBreakdown: event.call.costBreakdown,
            messages: event.call.messages,
            recordingUrl: event.call.recordingUrl,
          };

          await prisma.aICall.update({
            where: { id: interview.id },
            data: {
              vapiTranscript: event.call.transcript,
              vapiSummary: event.call.summary,
              vapiCost: event.call.cost,
              vapiRecordingUrl: event.call.recordingUrl,
              transcript: {
                messages: event.call.messages,
                fullTranscript: event.call.transcript,
                costBreakdown: event.call.costBreakdown,
              },
            },
          });

          console.log(`Call report processed for interview ${interview.id}`);
        }
        break;

      case "function-call":
        // Handle function calls if you've configured custom functions
        console.log("Function call received:", event);
        break;

      case "assistant-request":
        // Handle assistant requests for dynamic responses
        console.log("Assistant request received:", event);
        break;

      default:
        console.log("Unhandled Vapi event type:", event.type);
    }

    return NextResponse.json({ success: true, processed: event.type });
  } catch (error) {
    console.error("Error processing Vapi webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}

// Optional: Add GET method for webhook verification
export async function GET() {
  return NextResponse.json({ message: "Vapi webhook endpoint is ready" });
}
