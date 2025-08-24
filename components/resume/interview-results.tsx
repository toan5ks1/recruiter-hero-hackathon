"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Bot, Calendar, Clock, FileText, Star, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface InterviewData {
  id: string;
  scheduledAt: string;
  endedAt?: string;
  status: string;
  result?: string;
  score?: number;
  aiAnalysis?: {
    overall_score: number;
    strengths: string[];
    areas_for_improvement: string[];
    recommendations: string[];
    conversation_quality: {
      engagement: string;
      clarity: string;
      professionalism: string;
    };
    detailed_analysis?: any;
  };
  transcript?: {
    transcript: string;
  };
  duration?: number;
  candidateName?: string;
  candidateEmail?: string;
  interviewMode?: string;
}

interface InterviewResultsProps {
  cvId: string;
}

export const InterviewResults: React.FC<InterviewResultsProps> = ({ cvId }) => {
  const [interviews, setInterviews] = useState<InterviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cv/${cvId}/interviews`);

      if (response.ok) {
        const data = await response.json();
        setInterviews(data);
      } else {
        setError("Failed to load interview results");
      }
    } catch (err) {
      setError("Failed to load interview results");
      console.error("Error fetching interviews:", err);
    } finally {
      setLoading(false);
    }
  }, [cvId]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Loading interviews...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-sm text-red-600">{error}</p>
          <Button variant="outline" onClick={fetchInterviews} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Bot className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            No interviews conducted yet
          </p>
          <p className="text-xs text-gray-500">
            Schedule an AI interview to see results here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {interviews.map((interview) => (
        <Card key={interview.id} className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <span>AI Voice Interview</span>
                  {interview.score !== undefined && (
                    <Badge variant="outline" className="ml-2">
                      {interview.score}/100
                    </Badge>
                  )}
                </CardTitle>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(interview.scheduledAt).toLocaleDateString()}
                    </span>
                  </div>
                  {interview.endedAt && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(interview.endedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  <Badge
                    variant={
                      interview.status === "completed"
                        ? "default"
                        : interview.status === "in_progress"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {interview.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* AI Analysis Results */}
            {interview.aiAnalysis ? (
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-xl font-bold text-blue-600">
                      {interview.aiAnalysis.overall_score}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800">
                    Overall Performance
                  </p>
                  <p className="text-sm text-gray-600">Out of 100</p>
                </div>

                <Separator />

                {/* Strengths */}
                <div>
                  <h4 className="mb-3 flex items-center space-x-2 font-semibold text-green-700">
                    <TrendingUp className="h-4 w-4" />
                    <span>Strengths</span>
                  </h4>
                  <ul className="space-y-2">
                    {interview.aiAnalysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-700">
                          {strength}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div>
                  <h4 className="mb-3 flex items-center space-x-2 font-semibold text-orange-700">
                    <Star className="h-4 w-4" />
                    <span>Areas for Improvement</span>
                  </h4>
                  <ul className="space-y-2">
                    {interview.aiAnalysis.areas_for_improvement.map(
                      (area, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="mt-1.5 h-2 w-2 rounded-full bg-orange-500"></div>
                          <span className="text-sm text-gray-700">{area}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                {/* Conversation Quality */}
                {interview.aiAnalysis.conversation_quality && (
                  <div>
                    <h4 className="mb-3 font-semibold text-purple-700">
                      Conversation Quality
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg bg-gray-50 p-3 text-center">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Engagement
                        </p>
                        <p className="mt-1 font-semibold text-gray-800">
                          {interview.aiAnalysis.conversation_quality.engagement}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3 text-center">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Clarity
                        </p>
                        <p className="mt-1 font-semibold text-gray-800">
                          {interview.aiAnalysis.conversation_quality.clarity}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3 text-center">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Professionalism
                        </p>
                        <p className="mt-1 font-semibold text-gray-800">
                          {
                            interview.aiAnalysis.conversation_quality
                              .professionalism
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div>
                  <h4 className="mb-3 font-semibold text-blue-700">
                    Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {interview.aiAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Transcript Preview */}
                {interview.transcript && (
                  <div>
                    <h4 className="mb-3 flex items-center space-x-2 font-semibold text-gray-700">
                      <FileText className="h-4 w-4" />
                      <span>Interview Transcript</span>
                    </h4>
                    <div className="max-h-32 overflow-y-auto rounded-lg bg-gray-50 p-3">
                      <p className="whitespace-pre-wrap text-sm text-gray-700">
                        {interview.transcript.transcript
                          .split("\n")
                          .slice(0, 5)
                          .join("\n")}
                        {interview.transcript.transcript.split("\n").length >
                          5 && "\n..."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : interview.status === "completed" ? (
              <div className="py-8 text-center">
                <p className="text-gray-600">
                  Interview completed but analysis not available
                </p>
                <p className="text-sm text-gray-500">
                  The interview may have been too short for analysis
                </p>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-600">
                  Interview{" "}
                  {interview.status === "scheduled"
                    ? "scheduled"
                    : "in progress"}
                </p>
                <p className="text-sm text-gray-500">
                  Results will appear here once the interview is completed
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
