"use client";

import React, { useState } from "react";
import { Bold, Italic, ScanText, Target } from "lucide-react";

import { ScoreResultExtended } from "@/lib/types";
import { capitalizeFirstLetter } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ResumeScore } from "@/components/resume/resume-score";
import { ResumePreview } from "@/components/resume/resume-view";

interface ResumeOverviewProps {
  name: string;
  result: ScoreResultExtended;
}

const ResumeOverview = ({ name, result }: ResumeOverviewProps) => {
  const [selectedToggles, setSelectedToggles] = useState<string[]>([]);

  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <h2>{name}</h2>
          <ToggleGroup
            type="multiple"
            variant="outline"
            value={selectedToggles}
            onValueChange={(value) => setSelectedToggles(value)}
          >
            <ToggleGroupItem value="analyzing" aria-label="Toggle analyzing">
              <Target className="size-4" />
              <span className="hidden sm:inline">Show analyzing</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="resume" aria-label="Toggle resume">
              <ScanText className="size-4" />
              <span className="hidden sm:inline">Show resume</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="flex items-center gap-1">
            {capitalizeFirstLetter(result.status)}
            <div
              className={`size-2 rounded-full ${
                result.status === "processing"
                  ? "animate-pulse bg-yellow-500"
                  : result.status === "success"
                    ? "bg-green-500"
                    : "bg-red-500"
              }`}
            />
          </Badge>
          <Badge>
            Total Score: {result.data?.score.totalScore ?? "N/A"} / 100
          </Badge>
        </div>
      </div>
      {selectedToggles.includes("analyzing") && result?.data?.score && (
        <ResumeScore score={result?.data.score} />
      )}
      {selectedToggles.includes("resume") && result?.data?.resume && (
        <ResumePreview resume={result?.data.resume} />
      )}
    </Card>
  );
};

export default ResumeOverview;
