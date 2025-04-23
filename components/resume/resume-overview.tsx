"use client";

import React, { useState } from "react";
import { CV } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { ScanText, Target } from "lucide-react";

import { capitalizeFirstLetter } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ResumeScore } from "@/components/resume/resume-score";
import { ResumePreview } from "@/components/resume/resume-view";

interface ResumeOverviewProps {
  cv: CV;
}

const ResumeOverview = ({ cv }: ResumeOverviewProps) => {
  const [selectedToggles, setSelectedToggles] = useState<string[]>([]);

  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <h2>{cv.fileName}</h2>
          <ToggleGroup
            type="multiple"
            variant="outline"
            value={selectedToggles}
            onValueChange={(value) => setSelectedToggles(value)}
          >
            <ToggleGroupItem
              value="analyzing"
              aria-label="Toggle analyzing"
              className="gap-1"
            >
              <Target className="size-4" />
              <span className="hidden sm:inline">Show analyzing</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="resume"
              aria-label="Toggle resume"
              className="gap-1"
            >
              <ScanText className="size-4" />
              <span className="hidden sm:inline">Show resume</span>
            </ToggleGroupItem>
          </ToggleGroup>
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
          <Badge>
            Total Score:{" "}
            {((cv.score as JsonObject)?.totalScore as string | undefined) ??
              "N/A"}
            /100
          </Badge>
        </div>
      </div>
      {selectedToggles.includes("analyzing") && cv.score && (
        <ResumeScore score={cv.score as JsonObject} />
      )}
      {selectedToggles.includes("resume") && cv.resume && (
        <ResumePreview resume={cv.resume as JsonObject} />
      )}
    </Card>
  );
};

export default ResumeOverview;
