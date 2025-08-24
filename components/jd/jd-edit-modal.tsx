"use client";

import React, { useState } from "react";
import { JobDescription } from "@prisma/client";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { updateJD } from "@/lib/jd";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface JDEditModalProps {
  jd: JobDescription;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedJD: JobDescription) => void;
}

export const JDEditModal: React.FC<JDEditModalProps> = ({
  jd,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [title, setTitle] = useState(jd.title);
  const [content, setContent] = useState(jd.content);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedJD = await updateJD(jd.id, { title, content });
      toast.success("Job description updated successfully!");
      onUpdate?.(updatedJD);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update job description",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle(jd.title);
      setContent(jd.content);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Edit Job Description
            </DialogTitle>
          </div>
          <p className="text-muted-foreground">
            Update the job title and description content below.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Job Description</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the job description details..."
                className="min-h-[400px] resize-none"
                disabled={isLoading}
                required
              />
              <p className="text-sm text-muted-foreground">
                {content.length} characters
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Job Description"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
