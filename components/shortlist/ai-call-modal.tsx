"use client";

import React, { useEffect, useState } from "react";
import { JobDescription } from "@prisma/client";
import { format } from "date-fns";
import {
  Bot,
  Calendar,
  Clock,
  Copy,
  ExternalLink,
  Link,
  Mic,
  Pause,
  Phone,
  Play,
  Settings,
  Square,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { InterviewLinkDisplay } from "@/components/interview/interview-link-display";

interface CV {
  id: string;
  fileName: string;
  resume: any;
  score: any;
  totalScore: number | null;
}

interface AICallModalProps {
  cv: CV;
  jd: JobDescription;
  isOpen: boolean;
  onClose: () => void;
  onCallScheduled: () => void;
}

const aiVoices = [
  {
    id: "sarah",
    name: "Sarah",
    description: "Professional, warm female voice",
  },
  { id: "james", name: "James", description: "Confident, friendly male voice" },
  { id: "maya", name: "Maya", description: "Energetic, clear female voice" },
  { id: "alex", name: "Alex", description: "Calm, articulate male voice" },
];

const callDurations = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
];

// Extract candidate info from CV resume data
const extractCandidateInfo = (cv: CV) => {
  if (cv.resume && typeof cv.resume === "object") {
    const resume = cv.resume as any;
    return {
      name: resume.profile?.name || resume.name || "",
      email: resume.profile?.email || resume.email || "",
      phone: resume.profile?.phone || resume.phone || "",
    };
  }
  return { name: "", email: "", phone: "" };
};

export const AICallModal: React.FC<AICallModalProps> = ({
  cv,
  jd,
  isOpen,
  onClose,
  onCallScheduled,
}) => {
  const [activeTab, setActiveTab] = useState("schedule");
  const candidateInfo = extractCandidateInfo(cv);

  const [formData, setFormData] = useState({
    interviewMode: "link" as "phone" | "link",
    scheduledDate: undefined as Date | undefined,
    scheduledTime: "10:00",
    duration: "30",
    candidatePhone: candidateInfo.phone,
    candidateName: candidateInfo.name,
    candidateEmail: candidateInfo.email,
    aiVoice: "sarah",
    customInstructions: "",
    useGeneratedQuestions: true,
  });
  const [isScheduling, setIsScheduling] = useState(false);
  const [callStatus, setCallStatus] = useState<
    "idle" | "connecting" | "active" | "ended"
  >("idle");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [scheduledInterview, setScheduledInterview] = useState<{
    id: string;
    interviewLink: string;
    scheduledAt: Date;
  } | null>(null);
  const [existingInterviews, setExistingInterviews] = useState<any[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);

  // Reset state when modal opens and optionally load existing interviews
  useEffect(() => {
    if (isOpen) {
      console.log("Modal opening, resetting state for CV:", cv.fileName);

      // Always reset to initial state for new interview creation
      setActiveTab("schedule");
      setIsScheduling(false);
      setCallStatus("idle");
      setGeneratedLink(null);
      setScheduledInterview(null);

      // Re-extract candidate info in case CV data changed
      const freshCandidateInfo = extractCandidateInfo(cv);
      setFormData({
        interviewMode: "link",
        scheduledDate: undefined,
        scheduledTime: "10:00",
        duration: "30",
        candidatePhone: freshCandidateInfo.phone,
        candidateName: freshCandidateInfo.name,
        candidateEmail: freshCandidateInfo.email,
        aiVoice: "sarah",
        customInstructions: "",
        useGeneratedQuestions: true,
      });

      // Load existing interviews for this CV
      loadExistingInterviews();
    }
  }, [isOpen, cv]);

  // Load existing interviews for this CV
  const loadExistingInterviews = async () => {
    setLoadingInterviews(true);
    try {
      const response = await fetch(`/api/cv/${cv.id}/interviews`);
      if (response.ok) {
        const interviews = await response.json();
        setExistingInterviews(interviews);
        console.log("Loaded existing interviews:", interviews);
      }
    } catch (error) {
      console.error("Failed to load existing interviews:", error);
    } finally {
      setLoadingInterviews(false);
    }
  };

  // Auto-generate interview questions based on JD and CV
  const generateQuestions = () => {
    const questions = [
      `Tell me about your experience with ${jd.title.toLowerCase()}.`,
      "What interests you most about this position?",
      "Describe a challenging project you've worked on recently.",
      "How do you handle working under pressure?",
      "What are your salary expectations?",
      "When would you be available to start?",
    ];
    return questions;
  };

  const handleScheduleCall = async () => {
    setIsScheduling(true);
    try {
      if (!formData.candidateName) {
        throw new Error("Candidate name is required");
      }

      if (formData.interviewMode === "phone" && !formData.candidatePhone) {
        throw new Error("Phone number is required for phone interviews");
      }

      let scheduledDateTime: Date;

      if (formData.interviewMode === "link") {
        // For link mode, no specific time needed - immediate access
        scheduledDateTime = new Date();
      } else {
        // For phone mode, scheduled time is required
        if (!formData.scheduledDate) {
          throw new Error("Scheduled date is required for phone interviews");
        }
        const [hours, minutes] = formData.scheduledTime.split(":").map(Number);
        scheduledDateTime = new Date(formData.scheduledDate);
        scheduledDateTime.setHours(hours, minutes, 0, 0);
      }

      // API call to create interview with link generation
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvId: cv.id,
          interviewMode: formData.interviewMode,
          scheduledAt: scheduledDateTime,
          duration: parseInt(formData.duration),
          candidatePhone: formData.candidatePhone,
          candidateName: formData.candidateName,
          candidateEmail: formData.candidateEmail,
          aiVoice: formData.aiVoice,
          customInstructions: formData.customInstructions,
          questions: formData.useGeneratedQuestions ? generateQuestions() : [],
        }),
      });

      if (!response.ok) throw new Error("Failed to schedule AI interview");

      const result = await response.json();
      console.log("Interview created successfully:", result);
      setGeneratedLink(result.fullInterviewLink);
      setScheduledInterview({
        id: result.id,
        interviewLink: result.fullInterviewLink,
        scheduledAt: scheduledDateTime,
      });

      // Refresh the existing interviews list
      loadExistingInterviews();

      // Ensure state is set before switching tabs
      setTimeout(() => {
        setActiveTab("link");
      }, 100);

      if (formData.interviewMode === "link") {
        toast.success("Interview link generated! Candidate can join anytime.");
      } else {
        toast.success("Phone interview scheduled successfully!");
      }
      // Don't close modal immediately - let user see the link first
      // onCallScheduled will be called when they close the modal
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to schedule AI interview",
      );
    } finally {
      setIsScheduling(false);
    }
  };

  const handleStartCall = async () => {
    if (!scheduledInterview?.id) {
      toast.error(
        "No scheduled interview found. Please schedule an interview first.",
      );
      return;
    }

    setCallStatus("connecting");
    try {
      const response = await fetch(
        `/api/interviews/id/${scheduledInterview.id}/start-call`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start call");
      }

      if (data.success) {
        setCallStatus("active");
        toast.success(data.message || "Phone call initiated successfully");

        // Refresh interview data to show updated status
        loadExistingInterviews();
      }
    } catch (error) {
      console.error("Error starting call:", error);
      setCallStatus("idle");
      toast.error(
        error instanceof Error ? error.message : "Failed to start phone call",
      );
    }
  };

  const handleEndCall = () => {
    setCallStatus("ended");
    setActiveTab("results");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        console.log("Dialog onOpenChange:", open);
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            AI Phone Interview - {cv.fileName}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="schedule">
              <Calendar className="mr-2 size-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger
              value="link"
              disabled={!scheduledInterview && existingInterviews.length === 0}
            >
              <Link className="mr-2 size-4" />
              Interview Links
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="mr-2 size-4" />
              Configure
            </TabsTrigger>
            <TabsTrigger value="live" disabled={callStatus === "idle"}>
              <Phone className="mr-2 size-4" />
              Live Call
            </TabsTrigger>
            <TabsTrigger value="results" disabled={callStatus !== "ended"}>
              <Mic className="mr-2 size-4" />
              Results
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 h-[calc(90vh-160px)] overflow-y-auto">
            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {formData.interviewMode === "phone"
                      ? "Schedule AI Phone Interview"
                      : "Generate AI Interview Link"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Interview Mode Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      Interview Mode
                    </Label>
                    <RadioGroup
                      value={formData.interviewMode}
                      onValueChange={(value: "phone" | "link") =>
                        setFormData({ ...formData, interviewMode: value })
                      }
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2 rounded-lg border p-4">
                        <RadioGroupItem value="link" id="link" />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="link" className="font-medium">
                            🔗 Interview Link
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Generate a link that candidate can access anytime
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 rounded-lg border p-4">
                        <RadioGroupItem value="phone" id="phone" />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="phone" className="font-medium">
                            📞 Scheduled Phone Call
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            AI will call candidate at scheduled time
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Date/Time Selection (conditional) */}
                  {formData.interviewMode === "phone" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Interview Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.scheduledDate &&
                                  "text-muted-foreground",
                              )}
                            >
                              <Calendar className="mr-2 size-4" />
                              {formData.scheduledDate ? (
                                format(formData.scheduledDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={formData.scheduledDate}
                              onSelect={(date) =>
                                setFormData({
                                  ...formData,
                                  scheduledDate: date,
                                })
                              }
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="time">Interview Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={formData.scheduledTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              scheduledTime: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Select
                        value={formData.duration}
                        onValueChange={(value) =>
                          setFormData({ ...formData, duration: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {callDurations.map((duration) => (
                            <SelectItem
                              key={duration.value}
                              value={duration.value}
                            >
                              {duration.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Candidate Phone{" "}
                        {formData.interviewMode === "phone"
                          ? "*"
                          : "(Optional)"}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.candidatePhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            candidatePhone: e.target.value,
                          })
                        }
                        required={formData.interviewMode === "phone"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="candidateName">Candidate Name *</Label>
                      <Input
                        id="candidateName"
                        type="text"
                        placeholder="Enter candidate's full name"
                        value={formData.candidateName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            candidateName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="candidateEmail">
                        Candidate Email (Optional)
                      </Label>
                      <Input
                        id="candidateEmail"
                        type="email"
                        placeholder="candidate@example.com"
                        value={formData.candidateEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            candidateEmail: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleScheduleCall}
                    disabled={isScheduling}
                    className="w-full"
                  >
                    {isScheduling
                      ? "Processing..."
                      : formData.interviewMode === "phone"
                        ? "Schedule Phone Interview"
                        : "Generate Interview Link"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="link" className="space-y-6">
              {/* Newly created interview in this session */}
              {scheduledInterview && (
                <div>
                  <InterviewLinkDisplay
                    interviewLink={scheduledInterview.interviewLink}
                    candidateName={formData.candidateName}
                    candidateEmail={formData.candidateEmail}
                    scheduledDate={scheduledInterview.scheduledAt}
                    interviewMode={formData.interviewMode}
                    onClose={() => {
                      onCallScheduled(); // Refresh data and close modal
                    }}
                  />
                </div>
              )}

              {/* Existing interviews for this CV */}
              {existingInterviews.length > 0 && (
                <div>
                  {scheduledInterview && <div className="border-t pt-6" />}
                  <h3 className="mb-4 text-lg font-semibold">
                    Previous Interview Links
                  </h3>
                  <div className="space-y-4">
                    {existingInterviews.map((interview) => {
                      const scheduledDate = new Date(interview.scheduledAt);
                      const expiryDate = new Date(
                        scheduledDate.getTime() + 7 * 24 * 60 * 60 * 1000,
                      ); // 7 days after scheduled
                      const isExpired = new Date() > expiryDate;
                      const isScheduledSoon =
                        interview.interviewMode === "phone" &&
                        Math.abs(
                          new Date().getTime() - scheduledDate.getTime(),
                        ) <
                          2 * 60 * 60 * 1000; // Within 2 hours

                      return (
                        <div
                          key={interview.id}
                          className="rounded-lg border p-4"
                        >
                          {/* Header with type and status */}
                          <div className="mb-3 flex items-start justify-between">
                            <div>
                              <span className="text-sm font-medium">
                                {interview.interviewMode === "phone"
                                  ? "📞"
                                  : "🔗"}{" "}
                                {interview.interviewMode === "phone"
                                  ? "Phone Interview"
                                  : "Link Interview"}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                Created{" "}
                                {new Date(
                                  interview.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {isExpired && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Expired
                                </Badge>
                              )}
                              {isScheduledSoon && (
                                <Badge
                                  variant="default"
                                  className="animate-pulse text-xs"
                                >
                                  Soon
                                </Badge>
                              )}
                              <Badge
                                variant={
                                  interview.status === "scheduled"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {interview.status}
                              </Badge>
                            </div>
                          </div>

                          {/* Interview Details Grid */}
                          <div className="mb-3 grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="font-medium text-gray-600">
                                {interview.interviewMode === "phone"
                                  ? "Scheduled Time:"
                                  : "Available From:"}
                              </span>
                              <p className="text-gray-900">
                                {scheduledDate.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">
                                Duration:
                              </span>
                              <p className="text-gray-900">
                                {interview.duration} minutes
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">
                                Candidate:
                              </span>
                              <p className="text-gray-900">
                                {interview.candidateName || "N/A"}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">
                                {interview.interviewMode === "phone"
                                  ? "Backup Link Expires:"
                                  : "Link Expires:"}
                              </span>
                              <p
                                className={`${isExpired ? "font-medium text-red-600" : "text-gray-900"}`}
                              >
                                {expiryDate.toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Interview Mode Specific Info */}
                          {interview.interviewMode === "phone" ? (
                            <div className="mb-3 rounded bg-blue-50 p-2 text-xs">
                              <p className="font-medium text-blue-900">
                                📞 Phone Interview Details:
                              </p>
                              <p className="text-blue-800">
                                • AI will call candidate at scheduled time
                              </p>
                              <p className="text-blue-800">
                                • Link below serves as backup access method
                              </p>
                              <p className="text-blue-800">
                                • Both options expire after 7 days
                              </p>
                            </div>
                          ) : (
                            <div className="mb-3 rounded bg-green-50 p-2 text-xs">
                              <p className="font-medium text-green-900">
                                🔗 Link Interview Details:
                              </p>
                              <p className="text-green-800">
                                • Candidate can access anytime until expiry
                              </p>
                              <p className="text-green-800">
                                • No specific schedule required
                              </p>
                              <p className="text-green-800">
                                • Link expires 7 days after creation
                              </p>
                            </div>
                          )}

                          {/* Interview Link */}
                          {interview.interviewLink && (
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">
                                Interview Link {isExpired && "(⚠️ Expired)"}
                              </Label>
                              <div className="flex gap-2">
                                <Input
                                  value={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/interview/${interview.interviewLink}`}
                                  readOnly
                                  className={`font-mono text-xs ${isExpired ? "bg-red-50 text-red-600" : ""}`}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isExpired}
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/interview/${interview.interviewLink}`,
                                    );
                                    toast.success("Interview link copied!");
                                  }}
                                >
                                  <Copy className="size-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isExpired}
                                  onClick={() => {
                                    window.open(
                                      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/interview/${interview.interviewLink}`,
                                      "_blank",
                                    );
                                  }}
                                >
                                  <ExternalLink className="size-4" />
                                </Button>

                                {/* Phone Call Button for Phone Interviews */}
                                {interview.interviewMode === "phone" &&
                                  interview.candidatePhone && (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      disabled={
                                        isExpired ||
                                        interview.vapiCallStatus ===
                                          "in-progress"
                                      }
                                      onClick={async () => {
                                        try {
                                          const response = await fetch(
                                            `/api/interviews/id/${interview.id}/start-call`,
                                            {
                                              method: "POST",
                                              headers: {
                                                "Content-Type":
                                                  "application/json",
                                              },
                                            },
                                          );
                                          const data = await response.json();

                                          if (response.ok && data.success) {
                                            toast.success(
                                              "Phone call initiated!",
                                            );
                                            loadExistingInterviews(); // Refresh the data
                                          } else {
                                            toast.error(
                                              data.error ||
                                                "Failed to start call",
                                            );
                                          }
                                        } catch (error) {
                                          toast.error(
                                            "Failed to start phone call",
                                          );
                                        }
                                      }}
                                    >
                                      <Phone className="size-4" />
                                    </Button>
                                  )}
                              </div>

                              {/* Expiry Warning */}
                              {!isExpired && (
                                <p className="text-xs text-gray-500">
                                  ⏰ This link will expire on{" "}
                                  {expiryDate.toLocaleDateString()} at{" "}
                                  {expiryDate.toLocaleTimeString()}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No interviews at all */}
              {!scheduledInterview &&
                existingInterviews.length === 0 &&
                !loadingInterviews && (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">
                      No interview links yet. Create your first interview in the
                      Schedule tab.
                    </p>
                  </div>
                )}

              {/* Loading state */}
              {loadingInterviews && (
                <div className="p-8 text-center">
                  <p className="text-gray-500">
                    Loading existing interviews...
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="config" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>AI Voice</Label>
                    <Select
                      value={formData.aiVoice}
                      onValueChange={(value) =>
                        setFormData({ ...formData, aiVoice: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aiVoices.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            <div>
                              <div className="font-medium">{voice.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {voice.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Interview Questions</Label>
                    <div className="space-y-2">
                      {generateQuestions().map((question, index) => (
                        <div key={index} className="rounded border p-2 text-sm">
                          {index + 1}. {question}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Custom Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Add any specific instructions for the AI interviewer..."
                      value={formData.customInstructions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customInstructions: e.target.value,
                        })
                      }
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="live" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Live AI Interview</span>
                    <Badge
                      className={cn(
                        callStatus === "connecting" &&
                          "bg-yellow-100 text-yellow-800",
                        callStatus === "active" &&
                          "bg-green-100 text-green-800",
                      )}
                    >
                      {callStatus === "connecting" && "Connecting..."}
                      {callStatus === "active" && "Live"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4 text-center">
                    {callStatus === "idle" && (
                      <>
                        <div className="text-muted-foreground">
                          Ready to start AI phone interview
                        </div>
                        <Button onClick={handleStartCall} size="lg">
                          <Phone className="mr-2 size-4" />
                          Start Call
                        </Button>
                      </>
                    )}

                    {callStatus === "connecting" && (
                      <div className="space-y-4">
                        <div className="mx-auto flex size-16 animate-pulse items-center justify-center rounded-full bg-yellow-100">
                          <Phone className="size-8 text-yellow-600" />
                        </div>
                        <div>Connecting to candidate...</div>
                      </div>
                    )}

                    {callStatus === "active" && (
                      <div className="space-y-4">
                        <div className="mx-auto flex size-20 animate-pulse items-center justify-center rounded-full bg-green-100">
                          <Mic className="size-10 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">Call in progress</div>
                          <div className="text-sm text-muted-foreground">
                            Duration: 00:02:35
                          </div>
                        </div>
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="sm">
                            <Pause className="size-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Volume2 className="size-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleEndCall}
                          >
                            <Square className="size-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground">
                    Call results will appear here after the interview is
                    completed.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
