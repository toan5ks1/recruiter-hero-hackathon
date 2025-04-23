import { notFound } from "next/navigation";

import { getJDById } from "@/lib/jd";
import { JDInput } from "@/components/jd/jd-input";
import { ResumeInput } from "@/components/resume/resume-input";
import ResumeOverview from "@/components/resume/resume-overview";

export default async function DashboardPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;
  const jd = await getJDById(id);

  if (!jd) {
    notFound();
  }

  return (
    <div className="flex flex-col justify-center gap-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <JDInput jd={jd} />
        <ResumeInput jd={jd} />
      </div>

      <div className={"flex flex-col gap-4"}>
        {jd.cvs.map((cv) => {
          return <ResumeOverview key={cv.id} cv={cv} />;
        })}
      </div>
    </div>
  );
}
