"use client";

import React, { useState } from "react";
import { JobDescription } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { FileUp, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { createCVs } from "@/lib/cv";
import { readPdf } from "@/lib/parse-resume-from-pdf/read-pdf";
import { textItemsToText } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@/components/ui/link";

interface ResumeInputModalProps {
  jd: JobDescription;
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeInputModal: React.FC<ResumeInputModalProps> = ({
  jd,
  isOpen,
  onClose,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari && isDragging) {
      toast.error(
        "Safari does not support drag & drop. Please use the file picker.",
      );
      return;
    }

    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf" && file.size <= 5 * 1024 * 1024,
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Only PDF files under 5MB are allowed.");
    }

    setFiles(validFiles);
  };

  const handleSubmitWithFiles = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const rawTextItems = await Promise.all(
      files.map(async (file) => {
        const dataUrl = URL.createObjectURL(file);
        try {
          const textItems = await readPdf(dataUrl);
          return {
            fileName: file.name,
            content: textItemsToText(textItems),
          };
        } finally {
          URL.revokeObjectURL(dataUrl);
        }
      }),
    );

    const createCVParams = rawTextItems.map(({ fileName, content }) => ({
      fileName,
      content,
    }));

    const createdCVs = await createCVs({
      jdId: jd.id,
      cvs: createCVParams,
    });

    setFiles([]);
    setIsLoading(false);
    onClose();

    // Trigger refresh of CV list
    window.dispatchEvent(new CustomEvent("refresh-cvs"));

    if (createdCVs) {
      createdCVs.forEach((createdCV) =>
        fetch("/api/cv/score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jdId: jd.id,
            jdContent: jd.content,
            cvId: createdCV.id,
            cvContent: createdCV.content,
          }),
        })
          .then(() => {
            // Trigger another refresh after scoring is complete
            window.dispatchEvent(new CustomEvent("refresh-cvs"));
          })
          .catch((err) => {
            console.error("ScoreCV failed:", err);
          }),
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Upload Resumes
            </DialogTitle>
          </div>
          <p className="text-muted-foreground">
            Upload CVs to analyze against the job description using{" "}
            <Link href="https://sdk.vercel.ai">AI SDK</Link> and{" "}
            <Link href="https://sdk.vercel.ai/providers/ai-sdk-providers/google-generative-ai">
              Deepseek&apos;s Chat
            </Link>
          </p>
        </DialogHeader>

        <div
          className="flex w-full justify-center"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragExit={() => setIsDragging(false)}
          onDragEnd={() => setIsDragging(false)}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileChange({
              target: { files: e.dataTransfer.files },
            } as React.ChangeEvent<HTMLInputElement>);
          }}
        >
          <AnimatePresence>
            {isDragging && (
              <motion.div
                className="pointer-events-none fixed z-10 flex h-dvh w-dvw flex-col items-center justify-center gap-1 bg-zinc-100/90 dark:bg-zinc-900/90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div>Drag and drop files here</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  {"(PDFs only)"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmitWithFiles} className="w-full space-y-4">
            <div
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 p-12 transition-colors hover:border-muted-foreground/50 hover:bg-muted/5`}
            >
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept="application/pdf"
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <FileUp className="mb-4 size-12 text-muted-foreground" />
              <div className="text-center text-base text-muted-foreground">
                {files.length > 0 ? (
                  files.map((file) => {
                    return (
                      <p
                        key={file.name}
                        className="font-medium text-foreground"
                      >
                        {file.name}
                      </p>
                    );
                  })
                ) : (
                  <span>Drop your PDF here or click to browse.</span>
                )}
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full text-lg font-semibold"
              disabled={files.length === 0 || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="size-5 animate-spin" />
                  <span>Analyzing Resumes...</span>
                </span>
              ) : (
                "Analyze Resumes"
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
