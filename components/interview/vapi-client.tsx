"use client";

import React, { useCallback, useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";
import { Bot, Mic, MicOff, Phone, PhoneOff, User } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface VapiClientProps {
  assistantId: string;
  interviewId: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: string) => void;
}

export const VapiClient: React.FC<VapiClientProps> = ({
  assistantId,
  interviewId,
  onCallStart,
  onCallEnd,
  onMessage,
  onError,
}) => {
  const [vapi, setVapi] = useState<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<
    "idle" | "connecting" | "connected" | "ended"
  >("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [isVapiLoaded, setIsVapiLoaded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<"user" | "ai" | "none">("none");
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [currentMessage, setCurrentMessage] = useState<string>("");

  // Initialize VAPI
  useEffect(() => {
    const initializeVapi = async () => {
      try {
        const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

        if (!publicKey) {
          throw new Error("VAPI public key not configured");
        }

        console.log(
          "Initializing Vapi with public key:",
          publicKey.substring(0, 8) + "...",
        );

        const vapiInstance = new Vapi(publicKey);
        setVapi(vapiInstance);
        setIsVapiLoaded(true);

        // Setup event listeners
        vapiInstance.on("call-start", () => {
          console.log("Vapi call started");
          setIsCallActive(true);
          setCallStatus("connected");
          onCallStart?.();
          toast.success("Interview started");
        });

        vapiInstance.on("call-end", () => {
          console.log("Vapi call ended");
          setIsCallActive(false);
          setCallStatus("ended");
          onCallEnd?.();
          toast.info("Interview ended");
        });

        vapiInstance.on("message", (message: any) => {
          console.log("Vapi message:", message);

          // Handle different message types
          if (message.type === "transcript") {
            if (message.transcriptType === "partial") {
              // Real-time transcript updates
              setTranscript((prev) => {
                const lines = prev.split("\n");
                if (message.role === "user") {
                  lines[lines.length - 1] = `You: ${message.transcript}`;
                } else {
                  lines.push(`AI: ${message.transcript}`);
                  setIsSpeaking("ai");
                  setCurrentMessage(message.transcript);
                }
                return lines.join("\n");
              });
            } else if (message.transcriptType === "final") {
              // Final transcript
              setTranscript((prev) => {
                const lines = prev.split("\n");
                if (message.role === "user") {
                  lines[lines.length - 1] = `You: ${message.transcript}`;
                } else {
                  lines.push(`AI: ${message.transcript}`);
                  setIsSpeaking("none");
                  setCurrentMessage("");
                }
                return lines.join("\n");
              });
            }
          }

          // Call the onMessage callback if provided
          onMessage?.(message);
        });

        vapiInstance.on("error", (error: any) => {
          console.error("Vapi error:", error);
          setCallStatus("idle");
          setIsCallActive(false);
          toast.error("Voice interview error");
          onError?.(error.message || "Voice interface error");
        });

        vapiInstance.on("speech-start", () => {
          console.log("User started speaking");
          setIsSpeaking("user");
        });

        vapiInstance.on("speech-end", () => {
          console.log("User stopped speaking");
          setIsSpeaking("none");
        });

        vapiInstance.on("volume-level", (volume: number) => {
          setVolumeLevel(volume);
        });

        console.log("Vapi initialized successfully");
      } catch (error) {
        console.error("Error initializing Vapi:", error);
        onError?.(`Failed to initialize voice interface: ${error.message}`);
        toast.error("Failed to load voice interface");
      }
    };

    initializeVapi();

    // Cleanup
    return () => {
      if (vapi) {
        try {
          vapi.stop();
        } catch (error) {
          console.error("Error stopping Vapi:", error);
        }
      }
    };
  }, [onCallStart, onCallEnd, onMessage, onError]);

  const startCall = useCallback(async () => {
    if (!vapi || !assistantId) {
      toast.error("Voice interface not ready");
      return;
    }

    try {
      setCallStatus("connecting");
      console.log("Starting Vapi call with assistant:", assistantId);
      console.log("Vapi instance:", vapi);

      // According to VAPI TypeScript definitions:
      // start(assistant?: CreateAssistantDTO | string, assistantOverrides?: AssistantOverrides, ...)
      const result = await vapi.start(assistantId);
      console.log("Vapi start result:", result);
    } catch (error) {
      console.error("Error starting call:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...(error.response && { response: error.response }),
      });
      setCallStatus("idle");
      toast.error(`Failed to start interview: ${error.message}`);
      onError?.(`Failed to start voice interview: ${error.message}`);
    }
  }, [vapi, assistantId, onError]);

  const endCall = useCallback(() => {
    if (vapi && isCallActive) {
      try {
        vapi.stop();
        setCallStatus("ended");
        setIsCallActive(false);
      } catch (error) {
        console.error("Error ending call:", error);
      }
    }
  }, [vapi, isCallActive]);

  const toggleMute = useCallback(() => {
    if (vapi && isCallActive) {
      try {
        if (isMuted) {
          vapi.setMuted(false);
          setIsMuted(false);
          toast.info("Microphone unmuted");
        } else {
          vapi.setMuted(true);
          setIsMuted(true);
          toast.info("Microphone muted");
        }
      } catch (error) {
        console.error("Error toggling mute:", error);
      }
    }
  }, [vapi, isCallActive, isMuted]);

  if (!isVapiLoaded) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border p-8">
        <div className="size-16 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p className="text-gray-600">Loading voice interface...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Call Status Bar */}
      <div className="flex items-center justify-center space-x-4">
        <Badge
          variant={
            callStatus === "connected"
              ? "default"
              : callStatus === "connecting"
                ? "secondary"
                : "outline"
          }
          className="text-sm"
        >
          {callStatus === "idle" && "Ready"}
          {callStatus === "connecting" && "Connecting..."}
          {callStatus === "connected" && "Connected"}
          {callStatus === "ended" && "Ended"}
        </Badge>
      </div>

      {/* Avatar Call Interface */}
      {callStatus === "connected" && (
        <div className="relative">
          {/* Main Call Area */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-8">
            <div className="flex items-center justify-between">
              {/* AI Avatar */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <Avatar
                    className={`h-24 w-24 ring-4 transition-all duration-300 ${
                      isSpeaking === "ai"
                        ? "shadow-lg shadow-blue-200 ring-blue-500 ring-opacity-75"
                        : "ring-gray-300"
                    }`}
                  >
                    <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Bot className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  {isSpeaking === "ai" && (
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 animate-pulse items-center justify-center rounded-full bg-blue-500">
                      <Mic className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">AI Interviewer</p>
                  <p className="mx-auto w-20 text-sm text-gray-600">
                    {isSpeaking === "ai" ? "Speaking..." : "Listening"}
                  </p>
                </div>
              </div>

              {/* Volume Visualization */}
              <div className="flex flex-col items-center space-y-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      className={`w-2 rounded-full transition-all duration-150 ${
                        volumeLevel * 100 > bar * 20
                          ? "h-8 bg-green-500"
                          : "h-4 bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">Volume</p>
              </div>

              {/* User Avatar */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <Avatar
                    className={`h-24 w-24 ring-4 transition-all duration-300 ${
                      isSpeaking === "user"
                        ? "shadow-lg shadow-green-200 ring-green-500 ring-opacity-75"
                        : "ring-gray-300"
                    }`}
                  >
                    <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b412?w=150&h=150&fit=crop&crop=face" />
                    <AvatarFallback className="bg-green-100 text-green-600">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  {isSpeaking === "user" && (
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 animate-pulse items-center justify-center rounded-full bg-green-500">
                      <Mic className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {isMuted && (
                    <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                      <MicOff className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">You</p>
                  <p className="mx-auto w-20 text-sm text-gray-600">
                    {isMuted
                      ? "Muted"
                      : isSpeaking === "user"
                        ? "Speaking..."
                        : "Listening"}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Message Display - Always reserve space */}
            <div className="mt-6 flex min-h-[60px] items-center justify-center rounded-lg bg-white/70 p-4 backdrop-blur-sm">
              {currentMessage ? (
                <p className="text-center italic text-gray-800">
                  &quot;{currentMessage}&quot;
                </p>
              ) : (
                <p className="text-center text-sm text-gray-400">
                  AI responses will appear here...
                </p>
              )}
            </div>
          </div>

          {/* Call Controls */}
          <div className="mt-6 flex justify-center space-x-4">
            <Button
              onClick={toggleMute}
              variant={isMuted ? "destructive" : "outline"}
              size="lg"
              className="flex items-center space-x-2 rounded-full px-6"
            >
              {isMuted ? (
                <MicOff className="size-5" />
              ) : (
                <Mic className="size-5" />
              )}
              <span>{isMuted ? "Unmute" : "Mute"}</span>
            </Button>

            <Button
              onClick={endCall}
              variant="destructive"
              size="lg"
              className="flex items-center space-x-2 rounded-full px-6"
            >
              <PhoneOff className="size-5" />
              <span>End Interview</span>
            </Button>
          </div>
        </div>
      )}

      {/* Pre-Call Interface */}
      {!isCallActive && (
        <div className="space-y-6 text-center">
          <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="mb-6 flex justify-center space-x-8">
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-20 w-20 ring-4 ring-gray-300">
                  <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <Bot className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium text-gray-700">AI Interviewer</p>
              </div>
              <div className="flex items-center">
                <div className="h-px w-16 bg-gray-400"></div>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-20 w-20 ring-4 ring-gray-300">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b412?w=150&h=150&fit=crop&crop=face" />
                  <AvatarFallback className="bg-green-100 text-green-600">
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium text-gray-700">You</p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={startCall}
                disabled={callStatus === "connecting"}
                size="lg"
                className="flex items-center space-x-2 rounded-full px-8 py-3 text-lg"
              >
                <Phone className="size-6" />
                <span>
                  {callStatus === "connecting"
                    ? "Connecting..."
                    : "Start Interview"}
                </span>
              </Button>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>Make sure your microphone is enabled and working properly.</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions for different states */}
      {callStatus === "connected" && (
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <p className="font-medium text-blue-800">
            You are now connected to the AI interviewer.
          </p>
          <p className="mt-1 text-sm text-blue-600">
            Speak clearly and wait for the AI to respond before continuing.
          </p>
        </div>
      )}

      {callStatus === "ended" && (
        <div className="rounded-lg bg-green-50 p-4 text-center">
          <p className="font-medium text-green-800">The interview has ended.</p>
          <p className="mt-1 text-sm text-green-600">
            Thank you for participating! Your responses have been recorded.
          </p>
        </div>
      )}

      {/* Live Transcript - Always reserve space when connected */}
      {callStatus === "connected" && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center space-x-2 font-semibold text-gray-800">
            <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
            <span>Live Transcript</span>
          </h3>
          <div className="max-h-48 min-h-24 space-y-2 overflow-y-auto">
            {transcript ? (
              transcript
                .split("\n")
                .filter((line) => line.trim())
                .map((line, index) => {
                  const isUser = line.startsWith("You:");
                  const isAI = line.startsWith("AI:");
                  const content = line.replace(/^(You:|AI:)\s*/, "");

                  if (!content.trim()) return null;

                  return (
                    <div
                      key={index}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                          isUser
                            ? "bg-green-500 text-white"
                            : isAI
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {content}
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="flex h-24 items-center justify-center text-gray-400">
                <p className="text-sm">Conversation will appear here...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
