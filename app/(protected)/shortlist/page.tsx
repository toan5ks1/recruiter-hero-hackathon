import { notFound } from "next/navigation";
import { auth } from "@/auth";

import { DashboardHeader } from "@/components/dashboard/header";
import { GlobalShortlistManager } from "@/components/shortlist/global-shortlist-manager";

export default async function GlobalShortlistPage() {
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  return (
    <>
      <DashboardHeader
        heading="Shortlisted Candidates"
        text="Manage all shortlisted candidates across your job descriptions and schedule AI-powered phone interviews"
      />
      <GlobalShortlistManager />
    </>
  );
}
