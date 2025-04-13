"use client";

import { useState } from "react";

import { ResultsList } from "@/lib/types";
import { cn } from "@/lib/utils";
import { JDInput } from "@/components/jd/jd-input";
import { ResumeInput } from "@/components/resume/resume-input";
import ResumeOverview from "@/components/resume/resume-overview";

export default function DashboardPage() {
  const [jd, setJd] = useState("");
  const [results, setResults] = useState<ResultsList>({});

  return (
    <div className="flex flex-col justify-center gap-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <JDInput value={jd} onChange={setJd} />
        <ResumeInput setResults={setResults} jd={jd} />
      </div>

      <div
        className={cn("flex flex-col gap-4", {
          "flex-1": Object.keys(results).length > 0,
        })}
      >
        {Object.entries(results).map(([key, result]) => {
          return <ResumeOverview key={key} name={key} result={result} />;
        })}
      </div>
    </div>
  );
}
