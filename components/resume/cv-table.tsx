"use client";

import React, { useCallback, useEffect, useState } from "react";
import { JobDescription } from "@prisma/client";
import {
  Ban,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  MoreHorizontal,
  ScanText,
  Star,
  StarOff,
  Target,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { toggleShortlist, updateCVStatus } from "@/lib/cv-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleInterviewModal } from "@/components/interview/schedule-interview-modal";
import { ResumeScore } from "@/components/resume/resume-score";
import { ResumePreview } from "@/components/resume/resume-view";

interface CV {
  id: string;
  fileName: string;
  content: string;
  jobDescriptionId: string;
  fileUrl: string | null;
  resume: any;
  score: any;
  totalScore: number | null;
  status: string;
  uploadedAt: Date;
  shortlisted: boolean;
  reviewerNote: string | null;
}

interface CVTableProps {
  jd: JobDescription;
}

export const CVTable: React.FC<CVTableProps> = ({ jd }) => {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCV, setSelectedCV] = useState<CV | null>(null);
  const [activeTab, setActiveTab] = useState<string>("score");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [schedulingCvId, setSchedulingCvId] = useState<string | null>(null);

  const fetchCVs = useCallback(async () => {
    try {
      const res = await fetch(`/api/cv/by-jd/${jd.id}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        // Sort CVs by score: highest first, processing CVs at the bottom
        const sortedCvs = data.sort((a: CV, b: CV) => {
          // If both are processing, sort by upload date (newest first)
          if (a.status === "processing" && b.status === "processing") {
            return (
              new Date(b.uploadedAt).getTime() -
              new Date(a.uploadedAt).getTime()
            );
          }
          // If one is processing, put it at the bottom
          if (a.status === "processing") return 1;
          if (b.status === "processing") return -1;
          // Sort by score (highest first)
          const scoreA = a.totalScore || 0;
          const scoreB = b.totalScore || 0;
          return scoreB - scoreA;
        });
        setCvs(sortedCvs);
      }
    } catch (error) {
      console.error("Failed to fetch CVs:", error);
    } finally {
      setLoading(false);
    }
  }, [jd.id]);

  useEffect(() => {
    fetchCVs();
  }, [fetchCVs]);

  // Set up polling to check for status updates
  useEffect(() => {
    const hasProcessingCVs = cvs.some((cv) => cv.status === "processing");

    if (hasProcessingCVs) {
      const interval = setInterval(() => {
        fetchCVs();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [cvs, fetchCVs]);

  // Expose refresh function globally for other components to use
  useEffect(() => {
    const handleRefresh = () => {
      fetchCVs();
    };

    window.addEventListener("refresh-cvs", handleRefresh);

    return () => {
      window.removeEventListener("refresh-cvs", handleRefresh);
    };
  }, [fetchCVs]);

  const getInitials = (filename: string) => {
    const name = filename.replace(/\.[^/.]+$/, "");
    const words = name.split(/[\s_-]+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusBadge = (status: string, shortlisted: boolean) => {
    if (shortlisted) {
      return (
        <Badge className="border-blue-200 bg-blue-100 text-blue-800">
          <Star className="mr-1 h-3 w-3 fill-current" />
          Shortlisted
        </Badge>
      );
    }

    switch (status) {
      case "processing":
        return (
          <Badge variant="secondary" className="animate-pulse">
            Processing
          </Badge>
        );
      case "success":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case "interview_scheduled":
        return (
          <Badge className="border-orange-200 bg-orange-100 text-orange-800">
            <Calendar className="mr-1 h-3 w-3" />
            Interview Scheduled
          </Badge>
        );
      case "interview_completed":
        return (
          <Badge className="border-purple-200 bg-purple-100 text-purple-800">
            <Clock className="mr-1 h-3 w-3" />
            Interview Done
          </Badge>
        );
      case "qualified":
        return (
          <Badge className="border-green-200 bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Qualified
          </Badge>
        );
      case "disqualified":
        return (
          <Badge className="border-red-200 bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Disqualified
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            <Ban className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStatusUpdate = async (cvId: string, newStatus: string) => {
    try {
      await updateCVStatus(cvId, newStatus as any);
      toast.success("CV status updated successfully");
      fetchCVs(); // Refresh the list
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status",
      );
    }
  };

  const handleToggleShortlist = async (
    cvId: string,
    currentShortlisted: boolean,
  ) => {
    try {
      await toggleShortlist(cvId, !currentShortlisted);
      toast.success(
        `CV ${!currentShortlisted ? "added to" : "removed from"} shortlist`,
      );
      fetchCVs(); // Refresh the list
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update shortlist",
      );
    }
  };

  const openDetailsModal = (cv: CV) => {
    setSelectedCV(cv);
    if (cv.score) {
      setActiveTab("score");
    } else if (cv.resume) {
      setActiveTab("resume");
    }
  };

  const openScheduleModal = (cvId: string) => {
    setSchedulingCvId(cvId);
    setScheduleModalOpen(true);
  };

  const handleInterviewScheduled = () => {
    fetchCVs(); // Refresh the list
    setScheduleModalOpen(false);
    setSchedulingCvId(null);
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading resumes...</p>
      </div>
    );
  }

  if (cvs.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No resumes uploaded yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cvs.map((cv) => (
              <TableRow key={cv.id}>
                <TableCell>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                      {getInitials(cv.fileName)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{cv.fileName}</div>
                  {cv.reviewerNote && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MessageSquare className="mr-1 h-3 w-3" />
                      {cv.reviewerNote}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(cv.status, cv.shortlisted)}
                </TableCell>
                <TableCell className="text-right">
                  {cv.totalScore !== null ? (
                    <Badge variant="outline">{cv.totalScore}/100</Badge>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {new Date(cv.uploadedAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => openDetailsModal(cv)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          handleToggleShortlist(cv.id, cv.shortlisted)
                        }
                      >
                        {cv.shortlisted ? (
                          <StarOff className="mr-2 h-4 w-4" />
                        ) : (
                          <Star className="mr-2 h-4 w-4" />
                        )}
                        {cv.shortlisted
                          ? "Remove from Shortlist"
                          : "Add to Shortlist"}
                      </DropdownMenuItem>
                      {cv.shortlisted &&
                        cv.status !== "interview_scheduled" &&
                        cv.status !== "interview_completed" && (
                          <DropdownMenuItem
                            onClick={() => openScheduleModal(cv.id)}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Interview
                          </DropdownMenuItem>
                        )}
                      {cv.status === "success" && (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(cv.id, "qualified")
                            }
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Qualified
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(cv.id, "disqualified")
                            }
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Mark as Disqualified
                          </DropdownMenuItem>
                        </>
                      )}
                      {cv.status === "processing" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(cv.id, "cancelled")}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Cancel Processing
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedCV && (
        <Dialog open={!!selectedCV} onOpenChange={() => setSelectedCV(null)}>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {getInitials(selectedCV.fileName)}
                  </AvatarFallback>
                </Avatar>
                <span>{selectedCV.fileName}</span>
                {selectedCV.totalScore !== null && (
                  <Badge variant="outline">{selectedCV.totalScore}/100</Badge>
                )}
              </DialogTitle>
            </DialogHeader>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="score" disabled={!selectedCV.score}>
                  <CheckCircle className="mr-2 size-4" />
                  Score Analysis
                </TabsTrigger>
                <TabsTrigger value="resume" disabled={!selectedCV.resume}>
                  <Eye className="mr-2 size-4" />
                  Resume Preview
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 h-[calc(90vh-120px)] overflow-y-auto">
                <TabsContent value="score" className="h-full">
                  {selectedCV.score && (
                    <ResumeScore score={selectedCV.score as any} />
                  )}
                </TabsContent>

                <TabsContent value="resume" className="h-full">
                  {selectedCV.resume && (
                    <ResumePreview resume={selectedCV.resume as any} />
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {schedulingCvId && (
        <ScheduleInterviewModal
          cvId={schedulingCvId}
          candidateName={
            cvs.find((cv) => cv.id === schedulingCvId)?.fileName || "Candidate"
          }
          isOpen={scheduleModalOpen}
          onClose={() => {
            setScheduleModalOpen(false);
            setSchedulingCvId(null);
          }}
          onScheduled={handleInterviewScheduled}
        />
      )}
    </>
  );
};
