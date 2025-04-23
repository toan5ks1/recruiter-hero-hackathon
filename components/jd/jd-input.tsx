"use client";

import React, { useEffect, useState } from "react";
import { useJDStore } from "@/stores/jd-store";
import { toast } from "sonner";

import { updateJD } from "@/lib/jd";
import { JDExtended } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type JDInputProps = {
  jd: JDExtended;
};

export const JDInput: React.FC<JDInputProps> = ({ jd }) => {
  const { setSelectedJD } = useJDStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [jdContent, setJdContent] = useState(jd.content);

  useEffect(() => {
    setSelectedJD(jd);
  }, [jd, setSelectedJD]);

  const handleToggleEdit = () => {
    if (isEditMode) {
      setIsUpdating(true);
      toast.promise(
        updateJD(jd.id, { ...jd, content: jdContent }).finally(() => {
          setIsUpdating(false);
          setJdContent(jdContent);
        }),
        {
          loading: "Updating job description...",
          success: () => {
            return "Job description updated successfully!";
          },
          error: (err) => err.message || "Failed to update job description",
        },
      );
    }

    setIsEditMode(!isEditMode);
  };

  const handleDiscard = () => {
    setJdContent(jd.content);
    setIsEditMode(false);
  };

  return (
    <Card className="flex size-full flex-col border-0 sm:border">
      <CardHeader className="space-y-6 text-center">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold">Job Description</CardTitle>
          <CardDescription className="text-base">
            Upload a PDF or input job description
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-4">
        <Textarea
          placeholder="Paste or write the job description here..."
          value={jdContent}
          onChange={(e) => setJdContent(e.target.value)}
          className="min-h-[100px] flex-1 resize-none"
          disabled={isUpdating}
          readOnly={!isEditMode}
        />
        <div className="flex gap-2">
          {isEditMode && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleDiscard}
              disabled={isUpdating}
            >
              Discard
            </Button>
          )}
          <Button
            className="w-full"
            onClick={handleToggleEdit}
            disabled={isUpdating}
          >
            {isEditMode ? "Save" : "Edit"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
