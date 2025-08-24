import { env } from "@/env.mjs";

// Types
export interface VapiAssistant {
  id: string;
  name: string;
  model: {
    provider: string;
    model: string;
    messages: Array<{
      role: string;
      content: string;
    }>;
    temperature?: number;
    maxTokens?: number;
  };
  voice: {
    provider: string;
    voiceId: string;
  };
  firstMessage?: string;
  transcriber?: {
    provider: string;
    model: string;
    language?: string;
  };
}

export interface VapiCall {
  id: string;
  status: "queued" | "ringing" | "in-progress" | "forwarding" | "ended";
  assistantId: string;
  customer?: {
    number?: string;
    name?: string;
    email?: string;
  };
  phoneNumberId?: string;
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
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  endedAt?: string;
}

export interface CreateAssistantRequest {
  name: string;
  instructions: string;
  firstMessage?: string;
  voice?: {
    provider?: string;
    voiceId?: string;
  };
  model?: {
    provider?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  transcriber?: {
    provider?: string;
    model?: string;
    language?: string;
  };
}

export interface CreateCallRequest {
  assistantId: string;
  customer?: {
    number?: string;
    name?: string;
    email?: string;
  };
  phoneNumberId?: string;
  assistantOverrides?: Partial<VapiAssistant>;
}

// Server-side Vapi client using the server SDK
export class VapiServerClient {
  private apiKey: string;
  private baseUrl = "https://api.vapi.ai";

  constructor() {
    this.apiKey = env.VAPI_API_KEY;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Vapi API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Create a new assistant
  async createAssistant(data: CreateAssistantRequest): Promise<VapiAssistant> {
    const assistantData = {
      name: data.name,
      model: {
        provider: data.model?.provider || "openai",
        model: data.model?.model || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: data.instructions,
          },
        ],
        temperature: data.model?.temperature || 0.7,
        maxTokens: data.model?.maxTokens || 500,
      },
      voice: {
        provider: data.voice?.provider || "11labs",
        voiceId: data.voice?.voiceId || "sarah",
      },
      firstMessage:
        data.firstMessage || "Hello! I'm ready to start the interview.",
      transcriber: {
        provider: data.transcriber?.provider || "deepgram",
        model: data.transcriber?.model || "nova-2",
        language: data.transcriber?.language || "en",
      },
    };

    return this.request("/assistant", {
      method: "POST",
      body: JSON.stringify(assistantData),
    });
  }

  // Create a phone call
  async createCall(data: CreateCallRequest): Promise<VapiCall> {
    const callData = {
      assistant: data.assistantOverrides
        ? {
            ...data.assistantOverrides,
          }
        : {
            assistantId: data.assistantId,
          },
      customer: data.customer,
      phoneNumberId: data.phoneNumberId || env.VAPI_PHONE_NUMBER_ID,
    };

    return this.request("/call", {
      method: "POST",
      body: JSON.stringify(callData),
    });
  }

  // Get call details
  async getCall(callId: string): Promise<VapiCall> {
    return this.request(`/call/${callId}`);
  }

  // List calls
  async listCalls(limit: number = 100): Promise<VapiCall[]> {
    return this.request(`/call?limit=${limit}`);
  }

  // Get assistant
  async getAssistant(assistantId: string): Promise<VapiAssistant> {
    return this.request(`/assistant/${assistantId}`);
  }

  // List assistants
  async listAssistants(limit: number = 100): Promise<VapiAssistant[]> {
    return this.request(`/assistant?limit=${limit}`);
  }

  // Update assistant
  async updateAssistant(
    assistantId: string,
    data: Partial<CreateAssistantRequest>,
  ): Promise<VapiAssistant> {
    return this.request(`/assistant/${assistantId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Delete assistant
  async deleteAssistant(assistantId: string): Promise<void> {
    await this.request(`/assistant/${assistantId}`, {
      method: "DELETE",
    });
  }
}

// Singleton instance for server-side operations
export const vapiServerClient = new VapiServerClient();

// Helper function to create interview assistant
export async function createInterviewAssistant(
  jobTitle: string,
  jobDescription: string,
  candidateName: string,
  questions?: string[],
): Promise<VapiAssistant> {
  const instructions = `You are an AI interviewer conducting a professional job interview for the position: ${jobTitle}.

Candidate Information:
- Name: ${candidateName}
- Position: ${jobTitle}

Job Description:
${jobDescription}

Interview Guidelines:
1. Be professional, friendly, and encouraging
2. Ask one question at a time and wait for complete answers
3. Follow up with clarifying questions when needed
4. Keep the interview conversational and natural
5. Take notes on the candidate's responses for evaluation
6. The interview should last approximately 15-30 minutes

${
  questions && questions.length > 0
    ? `
Interview Questions to Ask:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

You can ask additional follow-up questions based on the candidate's responses.
`
    : `
Interview Topics to Cover:
- Background and experience
- Technical skills relevant to the role
- Problem-solving abilities
- Cultural fit and motivation
- Questions the candidate has about the role/company
`
}

Start the interview by greeting the candidate warmly and explaining the interview process.`;

  const firstMessage = `Hello ${candidateName}! Thank you for taking the time to interview with us today for the ${jobTitle} position. I'm an AI interviewer, and I'll be conducting this interview. 

The interview will take about 15-30 minutes, and I'll be asking you questions about your background, experience, and fit for this role. Please feel free to take your time with your answers, and don't hesitate to ask if you need me to repeat or clarify any questions.

Are you ready to begin?`;

  // Ensure name is under 40 characters for VAPI requirement
  const shortJobTitle =
    jobTitle.length > 15 ? jobTitle.substring(0, 15) + "..." : jobTitle;
  const shortCandidateName =
    candidateName.length > 15
      ? candidateName.substring(0, 15) + "..."
      : candidateName;
  const assistantName = `${shortJobTitle} - ${shortCandidateName}`.substring(
    0,
    39,
  );

  return vapiServerClient.createAssistant({
    name: assistantName,
    instructions,
    firstMessage,
    voice: {
      provider: "11labs",
      voiceId: "sarah", // Professional female voice
    },
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 200, // Keep responses concise
    },
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en",
    },
  });
}

// Helper function to generate interview summary
export function generateInterviewPrompt(
  jobTitle: string,
  jobDescription: string,
  candidateName: string,
  questions?: string[],
): string {
  return `You are conducting a professional job interview for ${candidateName} applying for the ${jobTitle} position.

Job Description: ${jobDescription}

Interview Questions:
${questions?.map((q, i) => `${i + 1}. ${q}`).join("\n") || "Ask relevant questions based on the job description and candidate background."}

Conduct the interview professionally, ask follow-up questions, and provide a positive candidate experience.`;
}
