"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { JobDescription } from "@prisma/client";
import {
  Bot,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  MessageSquare,
  Phone,
  PhoneCall,
  Search,
  Star,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { AICallModal } from "./ai-call-modal";

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
  // AI Call fields
  lastCallDate?: Date;
  callStatus?: "pending" | "scheduled" | "in_progress" | "completed" | "failed";
  callResult?: "qualified" | "rejected" | "needs_review";
  aiCallNotes?: string;
  // Job Description info
  jobDescription: JobDescription;
}

export const GlobalShortlistManager: React.FC = () => {
  const searchParams = useSearchParams();
  const jobFromUrl = searchParams.get("job");

  const [shortlistedCVs, setShortlistedCVs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobFilter, setJobFilter] = useState<string>(jobFromUrl || "all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [callFilter, setCallFilter] = useState<string>("all");
  const [selectedCV, setSelectedCV] = useState<CV | null>(null);
  const [showAICallModal, setShowAICallModal] = useState(false);
  const [availableJobs, setAvailableJobs] = useState<
    Array<{ id: string; title: string }>
  >([]);

  const getInitials = (filename: string) => {
    const name = filename.replace(/\.[^/.]+$/, "");
    const words = name.split(/[\s_-]+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const fetchShortlistedCVs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cv/shortlisted", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setShortlistedCVs(data);

        // Extract unique job descriptions for filter
        const jobs = Array.from(
          new Map(
            data.map((cv: CV) => [cv.jobDescription.id, cv.jobDescription]),
          ).values(),
        );
        setAvailableJobs(jobs as { id: string; title: string }[]);
      }
    } catch (error) {
      console.error("Failed to fetch shortlisted CVs:", error);
      toast.error("Failed to load shortlisted candidates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShortlistedCVs();
  }, [fetchShortlistedCVs]);

  const filteredCVs = shortlistedCVs.filter((cv) => {
    const matchesSearch =
      cv.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cv.jobDescription.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = jobFilter === "all" || cv.jobDescriptionId === jobFilter;
    const matchesStatus = statusFilter === "all" || cv.status === statusFilter;
    const matchesCall =
      callFilter === "all" ||
      (callFilter === "no_call" && !cv.lastCallDate) ||
      (callFilter === "called" && cv.lastCallDate);

    return matchesSearch && matchesJob && matchesStatus && matchesCall;
  });

  const handleAICall = (cv: CV) => {
    console.log("Opening AI Call Modal for CV:", cv.fileName);
    setSelectedCV(cv);
    setShowAICallModal(true);
  };

  const getCallStatusBadge = (cv: CV) => {
    if (!cv.lastCallDate) {
      return (
        <Badge variant="outline" className="text-gray-600">
          <Phone className="mr-1 h-3 w-3" />
          No Call
        </Badge>
      );
    }

    switch (cv.callStatus) {
      case "scheduled":
        return (
          <Badge className="border-blue-200 bg-blue-100 text-blue-800">
            <Calendar className="mr-1 h-3 w-3" />
            Scheduled
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="border-yellow-200 bg-yellow-100 text-yellow-800">
            <PhoneCall className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge className="border-green-200 bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge className="border-red-200 bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  const getResultBadge = (result?: string) => {
    switch (result) {
      case "qualified":
        return (
          <Badge className="border-green-200 bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Qualified
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="border-red-200 bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      case "needs_review":
        return (
          <Badge className="border-orange-200 bg-orange-100 text-orange-800">
            <MessageSquare className="mr-1 h-3 w-3" />
            Needs Review
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="py-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Loading shortlisted candidates...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Shortlisted
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shortlistedCVs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Called</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shortlistedCVs.filter((cv) => cv.lastCallDate).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                shortlistedCVs.filter((cv) => cv.callResult === "qualified")
                  .length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Calls</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shortlistedCVs.filter((cv) => !cv.lastCallDate).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates or jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {availableJobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Completed</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
              </SelectContent>
            </Select>

            <Select value={callFilter} onValueChange={setCallFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by call status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Candidates</SelectItem>
                <SelectItem value="no_call">Not Called</SelectItem>
                <SelectItem value="called">Called</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                setSearchTerm("");
                setJobFilter("all");
                setStatusFilter("all");
                setCallFilter("all");
              }}
              variant="outline"
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Shortlisted Candidates ({filteredCVs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCVs.length === 0 ? (
            <div className="py-8 text-center">
              <User className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                No shortlisted candidates found.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Avatar</TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Job Position</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Call Status</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Last Call</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCVs.map((cv) => (
                    <TableRow key={cv.id}>
                      <TableCell>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                            {getInitials(cv.fileName)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {cv.fileName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {cv.jobDescription.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {cv.totalScore !== null ? (
                          <Badge variant="secondary">{cv.totalScore}/100</Badge>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>{getCallStatusBadge(cv)}</TableCell>
                      <TableCell>{getResultBadge(cv.callResult)}</TableCell>
                      <TableCell>
                        {cv.lastCallDate
                          ? new Date(cv.lastCallDate).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <Bot className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAICall(cv)}>
                              <Bot className="mr-2 h-4 w-4" />
                              AI Phone Interview
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              View Call Notes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" />
                              Schedule Follow-up
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Call Modal */}
      {selectedCV && (
        <AICallModal
          key={selectedCV.id} // Add key to force re-render for different CVs
          cv={selectedCV}
          jd={selectedCV.jobDescription}
          isOpen={showAICallModal}
          onClose={() => {
            console.log("Closing AI Call Modal");
            setShowAICallModal(false);
            setSelectedCV(null);
          }}
          onCallScheduled={() => {
            console.log("AI Call scheduled, refreshing data");
            fetchShortlistedCVs();
            setShowAICallModal(false);
            setSelectedCV(null);
          }}
        />
      )}
    </div>
  );
};
