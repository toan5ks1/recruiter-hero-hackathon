import { notFound } from "next/navigation";

import { CandidateInterviewInterface } from "@/components/interview/candidate-interface";

interface InterviewPageProps {
  params: {
    link: string;
  };
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { link } = params;

  if (!link) {
    notFound();
  }

  return <CandidateInterviewInterface interviewLink={link} />;
}
