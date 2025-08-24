import { FeatureLdg, InfoLdg, TestimonialType } from "types";

export const infos: InfoLdg[] = [
  {
    title: "AI-Powered Recruitment",
    description:
      "Transform your hiring process with intelligent CV screening, automated shortlisting, and AI-driven voice interviews. Find the perfect candidates faster and more efficiently than ever before.",
    image: "/_static/illustrations/work-from-home.jpg",
    list: [
      {
        title: "Smart Screening",
        description:
          "AI automatically analyzes and scores CVs against job descriptions.",
        icon: "search",
      },
      {
        title: "Voice Interviews",
        description:
          "Conduct natural voice interviews powered by advanced AI technology.",
        icon: "messages",
      },
      {
        title: "Intelligent Matching",
        description:
          "Our AI finds the best candidates by understanding skills and requirements.",
        icon: "search",
      },
    ],
  },
  {
    title: "Streamlined Workflow",
    description:
      "Seamlessly manage your entire recruitment pipeline from CV upload to final interviews. Collaborate with your team and make data-driven hiring decisions with comprehensive analytics.",
    image: "/_static/illustrations/work-from-home.jpg",
    list: [
      {
        title: "Team Collaboration",
        description:
          "Work together with your recruitment team to evaluate candidates.",
        icon: "user",
      },
      {
        title: "Real-time Analytics",
        description:
          "Track recruitment metrics and optimize your hiring process.",
        icon: "lineChart",
      },
      {
        title: "Automated Pipeline",
        description:
          "Streamline from application to interview with intelligent automation.",
        icon: "settings",
      },
    ],
  },
];

export const features: FeatureLdg[] = [
  {
    title: "Resume Upload & Analysis",
    description:
      "Upload CVs in multiple formats and get instant AI-powered analysis with skill matching and compatibility scores.",
    link: "/dashboard",
    icon: "post",
  },
  {
    title: "Job Description Matching",
    description:
      "Create detailed job descriptions and let AI automatically match the best candidates based on requirements.",
    link: "/dashboard",
    icon: "search",
  },
  {
    title: "AI Voice Interviews",
    description:
      "Conduct natural, conversational interviews using advanced AI voice technology with real-time transcription.",
    link: "/dashboard",
    icon: "messages",
  },
  {
    title: "Smart Shortlisting",
    description:
      "AI automatically creates shortlists of top candidates, saving hours of manual screening time.",
    link: "/shortlist",
    icon: "star",
  },
  {
    title: "Interview Analytics",
    description:
      "Get detailed insights on candidate performance with comprehensive interview analytics and scoring.",
    link: "/dashboard/charts",
    icon: "lineChart",
  },
  {
    title: "Team Collaboration",
    description:
      "Collaborate with your recruitment team, share candidate evaluations, and make collective hiring decisions.",
    link: "/dashboard",
    icon: "user",
  },
];

export const testimonials: TestimonialType[] = [
  {
    name: "Sarah Chen",
    job: "HR Director at TechCorp",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    review:
      "Resume Hero has completely transformed our hiring process. The AI-powered CV screening saves us 80% of our time, and the voice interviews provide insights we never had before. We've reduced our time-to-hire from 6 weeks to 2 weeks!",
  },
  {
    name: "Marcus Johnson",
    job: "Talent Acquisition Manager",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    review:
      "The smart shortlisting feature is incredible. It consistently identifies candidates we would have missed in manual screening. Our quality of hires has improved significantly since using Resume Hero.",
  },
  {
    name: "Lisa Rodriguez",
    job: "Recruitment Team Lead",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    review:
      "The AI voice interviews are game-changing. Candidates love the convenience, and we get consistent, bias-free evaluations. The real-time transcription and analytics help us make better hiring decisions.",
  },
  {
    name: "James Thompson",
    job: "Head of People Operations",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    review:
      "Resume Hero's team collaboration features allow our distributed hiring team to work seamlessly together. The candidate scoring system ensures we're all evaluating on the same criteria.",
  },
  {
    name: "Amanda Davis",
    job: "Senior Recruiter",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    review:
      "I was skeptical about AI interviews at first, but the natural conversation flow and intelligent questions have impressed both our team and candidates. It's like having an expert interviewer available 24/7.",
  },
  {
    name: "David Park",
    job: "VP of Human Resources",
    image: "https://randomuser.me/api/portraits/men/6.jpg",
    review:
      "The analytics dashboard gives us insights into our hiring patterns we never had before. We can now optimize our job descriptions and interview processes based on real data. ROI has been outstanding.",
  },
  {
    name: "Rachel Kim",
    job: "Talent Sourcing Specialist",
    image: "https://randomuser.me/api/portraits/women/7.jpg",
    review:
      "Resume Hero's job description matching is incredibly accurate. It understands not just keywords but the actual skills and experience needed. Our candidate quality has never been better.",
  },
];
