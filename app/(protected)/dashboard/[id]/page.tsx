"use client";

import React from "react";
import { notFound } from "next/navigation";
import { JobDescription } from "@prisma/client";

import { getJDById } from "@/lib/jd";
import { JDSummary } from "@/components/jd/jd-summary";
import { CVTable } from "@/components/resume/cv-table";

interface DashboardPageProps {
  params: Promise<{ id: string }>;
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const [jd, setJd] = React.useState<JobDescription | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadJD = async () => {
      try {
        const { id } = await params;
        const jdData = await getJDById(id);
        if (!jdData) {
          notFound();
        }
        setJd(jdData);
      } catch (error) {
        console.error("Failed to load JD:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    loadJD();
  }, [params]);

  const handleJDUpdate = (updatedJD: JobDescription) => {
    setJd(updatedJD);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!jd) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Job Description Summary */}
      <JDSummary jd={jd} onUpdate={handleJDUpdate} />

      {/* Resume Results Table */}
      <CVTable jd={jd} />
    </div>
  );
}
