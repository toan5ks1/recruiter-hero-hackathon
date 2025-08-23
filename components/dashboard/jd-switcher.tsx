"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertCircle,
  Check,
  ChevronsUpDown,
  FileText,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { getUserJDs } from "@/lib/jd";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useCreateJDModal } from "../jd/jd-modal";

type JDType = {
  id: string;
  title: string;
  createdAt: Date;
  _count?: {
    cvs: number;
  };
};

export default function JDSwitcherClient() {
  const pathname = usePathname();
  const [selectedJD, setSelectedJD] = useState<JDType | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [jds, setJds] = useState<JDType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setShowCreateJDModal, CreateJDModal } = useCreateJDModal();

  const fetchJDs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserJDs();
      setJds(data || []);
    } catch (err) {
      console.error("Error fetching JDs:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load job descriptions",
      );
      setJds([]);
      toast.error("Failed to load job descriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  // Separate effect for setting selected JD when pathname or jds change
  useEffect(() => {
    if (jds.length > 0) {
      const currentJDId = pathname.split("/").pop();
      const currentJD = jds.find((jd) => jd?.id === currentJDId);
      setSelectedJD(currentJD);
    }
  }, [pathname, jds]);

  // Initial data fetch
  useEffect(() => {
    fetchJDs();
  }, [fetchJDs]);

  // Retry function
  const handleRetry = () => {
    fetchJDs();
  };

  if (loading) return <JDSwitcherPlaceholder />;

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          className="relative flex h-9 w-full items-center justify-center gap-2 border-destructive/50 p-2 text-destructive"
          onClick={handleRetry}
        >
          <AlertCircle className="size-4" />
          <span className="flex-1 truncate text-center text-sm">
            Error - Click to retry
          </span>
        </Button>
        <CreateJDModal />
      </div>
    );
  }

  if (!jds || jds.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          className="relative flex h-9 w-full items-center justify-center gap-2 border-dashed p-2"
          onClick={() => setShowCreateJDModal(true)}
        >
          <Plus className="size-4" />
          <span className="flex-1 truncate text-center">
            Create Job Description
          </span>
        </Button>
        <CreateJDModal />
      </div>
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={open ? "secondary" : "outline"}
            className="flex h-9 w-full max-w-full justify-between px-3 py-2"
            onClick={() => setOpen(!open)}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <FileText className="size-4 flex-shrink-0 text-muted-foreground" />
              <span className="truncate text-left text-sm font-medium">
                {selectedJD?.title || "Select Job"}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 size-4 flex-shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 p-2">
          <div className="flex flex-col gap-1">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Job Descriptions ({jds.length})
            </div>

            {jds.map((jd) => (
              <Link
                key={jd.id}
                href={`/dashboard/${jd.id}`}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "relative flex h-auto items-center gap-3 p-3 text-sm text-muted-foreground hover:text-foreground",
                  selectedJD?.id === jd.id && "bg-secondary text-foreground",
                )}
                onClick={() => setOpen(false)}
              >
                <FileText className="size-4 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{jd.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {jd._count?.cvs || 0} resumes •{" "}
                    {new Date(jd.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {selectedJD?.id === jd.id && (
                  <Check className="size-4 flex-shrink-0 text-foreground" />
                )}
              </Link>
            ))}

            <div className="mt-1 border-t pt-1">
              <Button
                variant="outline"
                className="h-9 w-full justify-center gap-2 border-dashed"
                onClick={() => {
                  setOpen(false);
                  setShowCreateJDModal(true);
                }}
              >
                <Plus className="size-4" />
                <span>Create New Job Description</span>
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <CreateJDModal />
    </>
  );
}

function JDSwitcherPlaceholder() {
  return (
    <div className="flex h-9 w-full items-center justify-between rounded-md border px-1.5 py-2 sm:w-60">
      <div className="flex flex-1 items-center gap-2">
        <div className="size-4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
