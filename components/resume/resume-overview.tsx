"use client";

import React, { useState } from "react";
import { CV } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { ScanText, Target, X } from "lucide-react";

import { capitalizeFirstLetter } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeScore } from "@/components/resume/resume-score";
import { ResumePreview } from "@/components/resume/resume-view";

interface ResumeOverviewProps {
  cv: CV;
}

const ResumeOverview = ({ cv }: ResumeOverviewProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("score");

  const handleOpenModal = () => {
    // Set the first available tab
    if (cv.score) {
      setActiveTab("score");
    } else if (cv.resume) {
      setActiveTab("resume");
    }
    setIsModalOpen(true);
  };

  // Generate initials from filename
  const getInitials = (filename: string) => {
    const name = filename.replace(/\.[^/.]+$/, ""); // Remove file extension
    const words = name.split(/[\s_-]+/); // Split by spaces, underscores, or hyphens
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <Card className="flex flex-col gap-4 p-4">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                {getInitials(cv.fileName)}
              </AvatarFallback>
            </Avatar>
            <h2 className="font-semibold">{cv.fileName}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenModal}
              className="gap-1"
              disabled={!cv.score && !cv.resume}
            >
              <ScanText className="size-4" />
              <span className="hidden sm:inline">Details</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="flex items-center gap-1">
              {capitalizeFirstLetter(cv.status)}
              <div
                className={`size-2 rounded-full ${
                  cv.status === "processing"
                    ? "animate-pulse bg-yellow-500"
                    : cv.status === "success"
                      ? "bg-green-500"
                      : "bg-red-500"
                }`}
              />
            </Badge>
            <Badge variant="secondary">
              Total Score:{" "}
              {((cv.score as JsonObject)?.totalScore as string | undefined) ??
                "N/A"}
              /100
            </Badge>
          </div>
        </div>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {getInitials(cv.fileName)}
                </AvatarFallback>
              </Avatar>
              <span>{cv.fileName}</span>
              <Badge variant="outline">
                {((cv.score as JsonObject)?.totalScore as string | undefined) ??
                  "N/A"}
                /100
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="score" disabled={!cv.score}>
                <Target className="mr-2 size-4" />
                Score Analysis
              </TabsTrigger>
              <TabsTrigger value="resume" disabled={!cv.resume}>
                <ScanText className="mr-2 size-4" />
                Resume Preview
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 h-[calc(90vh-120px)] overflow-y-auto">
              <TabsContent value="score" className="h-full">
                {cv.score && <ResumeScore score={cv.score as any} />}
              </TabsContent>

              <TabsContent value="resume" className="h-full">
                {cv.resume && <ResumePreview resume={cv.resume as any} />}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResumeOverview;
