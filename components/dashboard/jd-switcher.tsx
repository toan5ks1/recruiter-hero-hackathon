"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useJDStore } from "@/stores/jd-store";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { getAllJD } from "@/lib/jd";
import { cn } from "@/lib/utils";
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
};

export default function JDSwitcherClient() {
  const { selectedJD } = useJDStore();
  const [open, setOpen] = useState(false);
  const [jds, setJds] = useState<JDType[]>([]);
  const [loading, setLoading] = useState(true);
  const { setShowCreateJDModal, CreateJDModal } = useCreateJDModal();

  useEffect(() => {
    getAllJD()
      .then((data) => {
        setJds(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <JDSwitcherPlaceholder />;

  if (!jds || jds.length === 0) {
    return (
      <>
        <Button
          variant="outline"
          className="relative flex h-9 w-full items-center justify-center gap-2 p-2"
          onClick={() => setShowCreateJDModal(true)}
        >
          <Plus className="size-4" />
          <span className="flex-1 truncate text-center">New Project</span>
        </Button>
        <CreateJDModal />
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={open ? "secondary" : "outline"}
          className="flex h-8 w-full justify-between px-2"
          onClick={() => setOpen(!open)}
        >
          <span className="w-full truncate text-left text-sm font-medium">
            {selectedJD?.title}
          </span>
          <ChevronsUpDown className="ml-2 size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="max-w-60 p-2">
        <div className="flex flex-col gap-1">
          {jds.map((jd) => (
            <Link
              key={jd.id}
              href={`/dashboard/${jd.id}`}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "relative flex h-9 items-center gap-3 p-3 text-sm text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setOpen(false)}
            >
              <span className="flex-1 truncate">{jd.title}</span>
              {selectedJD?.id === jd.id && (
                <Check className="absolute right-3 size-4 text-foreground" />
              )}
            </Link>
          ))}
          <Button
            variant="outline"
            className="relative flex h-9 items-center justify-center gap-2 p-2"
            onClick={() => setShowCreateJDModal(true)}
          >
            <Plus size={18} className="absolute left-2.5 top-2" />
            <span className="flex-1 truncate text-center">New JD</span>
          </Button>
        </div>
        <CreateJDModal />
      </PopoverContent>
    </Popover>
  );
}

function JDSwitcherPlaceholder() {
  return (
    <div className="flex animate-pulse items-center space-x-1.5 rounded-lg px-1.5 py-2 sm:w-60">
      <div className="h-8 w-36 animate-pulse rounded-md bg-muted xl:w-[180px]" />
    </div>
  );
}
