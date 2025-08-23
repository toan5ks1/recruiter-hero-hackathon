"use client";

import React, { useState } from "react";
import { Calendar, Clock, Mail, MessageSquare, User } from "lucide-react";
import { toast } from "sonner";

import { createInterviewRound } from "@/lib/interview-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ScheduleInterviewModalProps {
  cvId: string;
  candidateName: string;
  isOpen: boolean;
  onClose: () => void;
  onScheduled?: () => void;
}

const interviewTypes = [
  { value: "phone", label: "Phone Screen", duration: 30 },
  { value: "technical", label: "Technical Interview", duration: 90 },
  { value: "panel", label: "Panel Interview", duration: 60 },
  { value: "final", label: "Final Interview", duration: 45 },
];

const defaultQuestions = {
  phone: [
    "Tell me about yourself and your experience",
    "Why are you interested in this position?",
    "What are your salary expectations?",
    "When would you be available to start?",
  ],
  technical: [
    "Explain your approach to [specific technical challenge]",
    "Walk me through a complex project you've worked on",
    "How do you handle debugging and troubleshooting?",
    "What's your experience with [relevant technology]?",
  ],
  panel: [
    "Describe your leadership style",
    "How do you handle conflicts in a team?",
    "Tell us about a time you overcame a significant challenge",
    "Where do you see yourself in 5 years?",
  ],
  final: [
    "Why should we hire you over other candidates?",
    "What questions do you have about the company/role?",
    "How would you handle [specific scenario relevant to role]?",
    "What are your thoughts on our company culture?",
  ],
};

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  cvId,
  candidateName,
  isOpen,
  onClose,
  onScheduled,
}) => {
  const [formData, setFormData] = useState({
    roundType: "" as "phone" | "technical" | "panel" | "final" | "",
    scheduledAt: "",
    durationMinutes: 60,
    interviewerName: "",
    interviewerEmail: "",
    questions: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeChange = (
    type: "phone" | "technical" | "panel" | "final",
  ) => {
    const selectedType = interviewTypes.find((t) => t.value === type);
    setFormData({
      ...formData,
      roundType: type,
      durationMinutes: selectedType?.duration || 60,
      questions: defaultQuestions[type] || [],
    });
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, ""],
    });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.roundType || !formData.scheduledAt) {
        throw new Error("Please fill in all required fields");
      }

      await createInterviewRound({
        cvId,
        roundType: formData.roundType,
        scheduledAt: new Date(formData.scheduledAt),
        durationMinutes: formData.durationMinutes,
        interviewerName: formData.interviewerName || undefined,
        interviewerEmail: formData.interviewerEmail || undefined,
        questions: formData.questions.filter((q) => q.trim() !== ""),
      });

      toast.success("Interview scheduled successfully!");
      onScheduled?.();
      onClose();

      // Reset form
      setFormData({
        roundType: "",
        scheduledAt: "",
        durationMinutes: 60,
        interviewerName: "",
        interviewerEmail: "",
        questions: [],
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to schedule interview",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Interview - {candidateName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roundType">Interview Type</Label>
              <Select onValueChange={handleTypeChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select interview type" />
                </SelectTrigger>
                <SelectContent>
                  {interviewTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} ({type.duration} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Date & Time</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledAt: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interviewerName">Interviewer Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="interviewerName"
                  placeholder="John Doe"
                  className="pl-9"
                  value={formData.interviewerName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interviewerName: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewerEmail">Interviewer Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="interviewerEmail"
                  type="email"
                  placeholder="john@company.com"
                  className="pl-9"
                  value={formData.interviewerEmail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interviewerEmail: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="duration"
                type="number"
                min="15"
                max="180"
                step="15"
                className="pl-9"
                value={formData.durationMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durationMinutes: parseInt(e.target.value) || 60,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Interview Questions</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQuestion}
              >
                Add Question
              </Button>
            </div>
            <div className="space-y-2">
              {formData.questions.map((question, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    placeholder={`Question ${index + 1}`}
                    value={question}
                    onChange={(e) =>
                      handleQuestionChange(index, e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Interview"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
