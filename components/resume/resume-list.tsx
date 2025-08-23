"use client";

import React, { useCallback, useEffect, useState } from "react";
import { JobDescription } from "@prisma/client";
import { FileText } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import ResumeOverview from "./resume-overview";

type JDInputProps = {
  jd: JobDescription;
};

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

const ResumeList = ({ jd }: JDInputProps) => {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCVs = useCallback(async () => {
    try {
      const res = await fetch(`/api/cv/by-jd/${jd.id}`, {
        cache: "no-store", // Always fetch fresh data
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
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [cvs, fetchCVs]);

  // Expose refresh function globally for other components to use
  useEffect(() => {
    const handleRefresh = () => {
      fetchCVs();
    };

    // Listen for custom refresh events
    window.addEventListener("refresh-cvs", handleRefresh);

    return () => {
      window.removeEventListener("refresh-cvs", handleRefresh);
    };
  }, [fetchCVs]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="py-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Loading resumes...
          </p>
        </div>
      </div>
    );
  }

  if (cvs.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No resumes uploaded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {cvs.map((cv) => {
        return <ResumeOverview key={cv.id} cv={cv} />;
      })}
    </div>
  );
};

export default ResumeList;
