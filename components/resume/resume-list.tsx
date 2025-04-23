"use client";

import React from "react";
import { useJDStore } from "@/stores/jd-store";

import ResumeOverview from "./resume-overview";

const ResumeList = () => {
  const { selectedJD } = useJDStore();
  return (
    <div className={"flex flex-col gap-4"}>
      {selectedJD?.cvs.map((cv) => {
        return <ResumeOverview key={cv.id} cv={cv} />;
      })}
    </div>
  );
};

export default ResumeList;
