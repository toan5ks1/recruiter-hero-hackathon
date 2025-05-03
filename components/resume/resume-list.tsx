import React from "react";
import { JobDescription } from "@prisma/client";

import ResumeOverview from "./resume-overview";

type JDInputProps = {
  jd: JobDescription;
};

const ResumeList = async ({ jd }: JDInputProps) => {
  const res = await fetch(`http://localhost:3000/api/cv/by-jd/${jd.id}`, {
    next: { tags: [`cvs-${jd.id}`] },
  });
  const cvs = await res.json();

  return (
    <div className={"flex flex-col gap-4"}>
      {cvs.map((cv) => {
        return <ResumeOverview key={cv.id} cv={cv} />;
      })}
    </div>
  );
};

export default ResumeList;
