"use client";

import React, { useState } from "react";
import { JobDescription } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createCVs, scoreCV } from "@/lib/cv";
import { readPdf } from "@/lib/parse-resume-from-pdf/read-pdf";
import { textItemsToText } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/components/ui/link";

interface ResumeInputProps {
  jd: JobDescription;
}

export const ResumeInput = ({ jd }: ResumeInputProps) => {
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

    if (createdCVs) {
      setTimeout(() => {
        createdCVs.forEach((createdCV) =>
          scoreCV({
            jdId: jd.id,
            jdContent: jd.content,
            cvId: createdCV.id,
            cvContent: createdCV.content,
          }).catch((err) => {
            console.error("ScoreCV failed:", err);
          }),
        );
      }, 1000);
    }
  };

  return (
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
      <Card className="size-full border-0 sm:h-fit sm:border">
        <CardHeader className="space-y-6 text-center">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              PDF Resume Parser
            </CardTitle>
            <CardDescription className="text-base">
              Upload CV to analyzing using the{" "}
              <Link href="https://sdk.vercel.ai">AI SDK</Link> and{" "}
              <Link href="https://sdk.vercel.ai/providers/ai-sdk-providers/google-generative-ai">
                Deepseek&apos;s Chat
              </Link>
              .
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitWithFiles} className="space-y-4">
            <div
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-muted-foreground/50`}
            >
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept="application/pdf"
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <FileUp className="mb-2 size-8 text-muted-foreground" />
              <div className="text-center text-sm text-muted-foreground">
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
              className="w-full"
              disabled={files.length === 0 || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Analyzing Resume...</span>
                </span>
              ) : (
                "Parse Resume"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
