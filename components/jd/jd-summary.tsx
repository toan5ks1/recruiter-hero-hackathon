"use client";

import React, { useState } from "react";
import Link from "next/link";
import { JobDescription } from "@prisma/client";
import { Edit3, ExternalLink, FileText, Star, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JDEditModal } from "@/components/jd/jd-edit-modal";
import { ResumeInputModal } from "@/components/resume/resume-input-modal";

interface JDSummaryProps {
  jd: JobDescription;
  onUpdate?: (updatedJD: JobDescription) => void;
}

export const JDSummary: React.FC<JDSummaryProps> = ({ jd, onUpdate }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{jd.title}</CardTitle>
                <p className="text-sm text-muted-foreground">Job Description</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUploadModalOpen(true)}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Resumes
              </Button>
              <Link href={`/shortlist?job=${jd.id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Star className="h-4 w-4" />
                  View Shortlist
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-1 text-sm">
            <span className="text-muted-foreground">Last Updated: </span>
            <span className="font-medium">
              {new Date(jd.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>

      <ResumeInputModal
        jd={jd}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <JDEditModal
        jd={jd}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={onUpdate}
      />
    </>
  );
};
