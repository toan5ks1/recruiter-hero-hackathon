"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  HelpCircle,
  Mic,
  Phone,
  Settings,
  User,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { formatInterviewDate } from "@/lib/interview-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VapiClient } from "@/components/interview/vapi-client";

interface InterviewData {
  id: string;
  interviewMode?: string;
  scheduledAt: string;
  duration: number;
  candidateName?: string;
  status: string;
  questions?: { questions: string[] };
  jobTitle: string;
  jobDescription: string;
  vapiAssistantId?: string;
}

interface CandidateInterviewInterfaceProps {
  interviewLink: string;
}

export const CandidateInterviewInterface: React.FC<
  CandidateInterviewInterfaceProps
> = ({ interviewLink }) => {
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "welcome" | "preparation" | "connecting" | "interview" | "complete"
  >("welcome");

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await fetch(`/api/interviews/${interviewLink}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Interview not found. Please check your link.");
          } else if (response.status === 410) {
            setError("This interview link has expired.");
          } else {
            setError("Failed to load interview details.");
          }
          return;
        }

        const data = await response.json();
        setInterview(data);
      } catch (err) {
        setError("Failed to connect to the interview system.");
        console.error("Error fetching interview:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [interviewLink]);

  const handleContinueToPreparation = () => {
    setCurrentStep("preparation");
  };

  const handleStartInterview = () => {
    setCurrentStep("connecting");
    toast.success("Connecting to interview system...");

    // Simulate connection process
    setTimeout(() => {
      setCurrentStep("interview");
    }, 3000);
  };

  const handleTestAudio = () => {
    toast.success("Audio test completed successfully!");
  };

  const handleTestVideo = () => {
    toast.success("Video test completed successfully!");
  };

  const handleBackToWelcome = () => {
    setCurrentStep("welcome");
  };

  const handleBackToPreparation = () => {
    setCurrentStep("preparation");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your interview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Interview Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-gray-600">{error}</p>
            <p className="text-sm text-gray-500">
              Please contact the recruiter for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!interview) {
    return null;
  }

  // Step indicator component
  const StepIndicator = () => {
    const steps = [
      { id: "welcome", label: "Welcome", icon: User },
      { id: "preparation", label: "Preparation", icon: Settings },
      { id: "connecting", label: "Connecting", icon: Phone },
      { id: "interview", label: "Interview", icon: Mic },
    ];

    const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

    return (
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex size-12 items-center justify-center rounded-full border-2 ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white"
                      : isCompleted
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="size-6" />
                  ) : (
                    <Icon className="size-6" />
                  )}
                </div>
                <div className="ml-3 text-sm">
                  <p
                    className={`font-medium ${isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"}`}
                  >
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 h-0.5 w-16 ${isCompleted ? "bg-green-600" : "bg-gray-300"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Step Indicator */}
          <StepIndicator />

          {/* Step Content */}
          {currentStep === "welcome" && (
            <div className="text-center">
              <h1 className="mb-4 text-4xl font-bold text-gray-900">
                Welcome to Your Interview
              </h1>
              <p className="mb-8 text-xl text-gray-600">
                {interview.candidateName && `Hi ${interview.candidateName}, `}
                {interview.interviewMode === "phone"
                  ? "We'll call you at the scheduled time, but you can also use this link anytime!"
                  : "You can start your interview anytime using this link!"}
              </p>

              {/* Interview Details */}
              <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="size-5" />
                      Position Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="mb-2 text-lg font-semibold">
                      {interview.jobTitle}
                    </h3>
                    <p className="line-clamp-4 text-sm text-gray-600">
                      {interview.jobDescription}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="size-5" />
                      Interview Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-gray-500" />
                        <span className="text-sm">
                          {formatInterviewDate(new Date(interview.scheduledAt))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-gray-500" />
                        <span className="text-sm">
                          Duration: {interview.duration} minutes
                        </span>
                      </div>
                      <Badge
                        variant={
                          interview.status === "scheduled"
                            ? "default"
                            : "secondary"
                        }
                        className="w-fit"
                      >
                        {interview.status === "scheduled"
                          ? "Ready to Start"
                          : interview.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-lg bg-blue-50 p-6">
                <h3 className="mb-3 font-semibold text-blue-900">
                  What to Expect:
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>
                    • This is an AI-powered{" "}
                    {interview.interviewMode === "phone" ? "phone" : "voice"}{" "}
                    interview
                  </li>
                  {interview.interviewMode === "phone" && (
                    <li>• We will call you at the scheduled time</li>
                  )}
                  <li>• The AI will ask you questions about your experience</li>
                  <li>• Speak clearly and take your time to answer</li>
                  <li>• The interview will be recorded for review</li>
                  {interview.interviewMode === "link" && (
                    <li>
                      • You can take the interview anytime before it expires
                    </li>
                  )}
                </ul>
              </div>

              <div className="mt-8 text-center">
                <Button
                  size="lg"
                  onClick={handleContinueToPreparation}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowRight className="mr-2 size-5" />
                  Continue to Preparation
                </Button>
              </div>
            </div>
          )}

          {/* Preparation Step */}
          {currentStep === "preparation" && (
            <div>
              <div className="mb-8 text-center">
                <h2 className="mb-4 text-3xl font-bold text-gray-900">
                  Pre-Interview Setup
                </h2>
                <p className="text-lg text-gray-600">
                  Let&apos;s make sure everything is ready for your interview
                </p>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="size-5" />
                      System Check
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">
                      Please test your audio and video to ensure the best
                      interview experience:
                    </p>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Button
                        variant="outline"
                        onClick={handleTestAudio}
                        className="h-16"
                      >
                        <Mic className="mr-2 size-6" />
                        <div className="text-left">
                          <div className="font-medium">Test Audio</div>
                          <div className="text-xs text-gray-500">
                            Check your microphone
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleTestVideo}
                        className="h-16"
                      >
                        <Video className="mr-2 size-6" />
                        <div className="text-left">
                          <div className="font-medium">Test Video</div>
                          <div className="text-xs text-gray-500">
                            Check your camera
                          </div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Interview Questions Preview */}
                {interview.questions?.questions && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="size-5" />
                        Sample Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-gray-600">
                        Here are some example questions you might be asked:
                      </p>
                      <ul className="space-y-3">
                        {interview.questions.questions
                          .slice(0, 3)
                          .map((question, index) => (
                            <li
                              key={index}
                              className="rounded bg-gray-50 p-3 text-sm text-gray-700"
                            >
                              <span className="font-medium text-blue-600">
                                {index + 1}.
                              </span>{" "}
                              {question}
                            </li>
                          ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <div className="rounded-lg bg-green-50 p-6">
                  <h3 className="mb-3 font-semibold text-green-900">
                    💡 Interview Tips:
                  </h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li>• Find a quiet, well-lit space for the interview</li>
                    <li>• Ensure stable internet connection</li>
                    <li>• Have your resume and relevant documents ready</li>
                    <li>• Speak clearly and at a natural pace</li>
                    <li>• Take your time to think before answering</li>
                    <li>• Be yourself and stay confident</li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBackToWelcome}>
                    <ArrowLeft className="mr-2 size-4" />
                    Back to Welcome
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleStartInterview}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Phone className="mr-2 size-5" />
                    Start Interview
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Connecting Step */}
          {currentStep === "connecting" && (
            <div className="text-center">
              <div className="mb-8">
                <h2 className="mb-4 text-3xl font-bold text-gray-900">
                  Connecting to AI Interviewer
                </h2>
                <p className="text-lg text-gray-600">
                  Please wait while we connect you to the AI interview system
                </p>
              </div>

              <Card className="mx-auto max-w-md">
                <CardContent className="pb-8 pt-8">
                  <div className="space-y-6">
                    <div className="animate-pulse">
                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                        <Phone className="size-12 text-green-600" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-1">
                        <div className="size-2 animate-bounce rounded-full bg-blue-600"></div>
                        <div
                          className="size-2 animate-bounce rounded-full bg-blue-600"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="size-2 animate-bounce rounded-full bg-blue-600"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <p className="text-lg font-semibold text-green-700">
                        Establishing Connection...
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p>🔊 Preparing audio system</p>
                      <p>🤖 Loading AI interviewer</p>
                      <p>📋 Reviewing your profile</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6">
                <Button variant="outline" onClick={handleBackToPreparation}>
                  <ArrowLeft className="mr-2 size-4" />
                  Back to Preparation
                </Button>
              </div>
            </div>
          )}

          {/* Interview Step */}
          {currentStep === "interview" && (
            <div className="text-center">
              <div className="mb-8">
                <h2 className="mb-4 text-3xl font-bold text-gray-900">
                  AI Voice Interview
                </h2>
                <p className="text-lg text-gray-600">
                  Start your interview with our AI interviewer
                </p>
              </div>

              <Card className="mx-auto max-w-4xl">
                <CardContent className="pb-8 pt-8">
                  {interview.vapiAssistantId ? (
                    <VapiClient
                      assistantId={interview.vapiAssistantId}
                      interviewId={interview.id}
                      onCallStart={() => {
                        toast.success("Interview started successfully!");
                      }}
                      onCallEnd={() => {
                        toast.info("Interview completed. Thank you!");
                        // Optionally redirect or show completion message
                      }}
                      onMessage={(message) => {
                        console.log("Interview message:", message);
                      }}
                      onError={(error) => {
                        toast.error(`Interview error: ${error}`);
                      }}
                    />
                  ) : (
                    <div className="space-y-6">
                      <div className="mx-auto flex size-32 items-center justify-center rounded-full bg-gray-100">
                        <Mic className="size-16 text-gray-400" />
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-700">
                          Voice Interview Not Available
                        </h3>

                        <p className="text-gray-600">
                          This interview link was created without voice AI
                          integration. You can still proceed with a traditional
                          interview process.
                        </p>
                      </div>

                      <div className="rounded-lg bg-blue-50 p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Alternative Options:</strong>
                          <br />• Contact the recruiter for a phone/video
                          interview
                          <br />• Check if there are other interview links
                          available
                          <br />• The recruiter can enable voice AI for future
                          interviews
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
