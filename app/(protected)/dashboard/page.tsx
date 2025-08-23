import { getUserJDs } from "@/lib/jd";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { JDList } from "@/components/jd/jd-list";

export const metadata = constructMetadata({
  title: "Dashboard – Resume Analyzer",
  description: "Manage your job descriptions and analyze resumes.",
});

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const jds = await getUserJDs();

  return (
    <>
      <DashboardHeader
        heading="Dashboard"
        text={`Welcome back, ${user?.name || user?.email}! Manage your job descriptions and analyze resumes.`}
      />
      <JDList jds={jds} />
    </>
  );
}
