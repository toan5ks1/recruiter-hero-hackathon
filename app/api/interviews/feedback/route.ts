import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transcript, interviewId, assistantId } = await req.json();

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 },
      );
    }

    // Analyze the transcript and generate comprehensive feedback
    const feedback = await generateAdvancedFeedback(transcript);

    // Save feedback to database and update interview status
    if (interviewId) {
      try {
        await prisma.aICall.update({
          where: { id: interviewId },
          data: {
            aiAnalysis: feedback,
            score: feedback.overall_score,
            status: "completed",
            result: "success",
            transcript: { transcript },
            endedAt: new Date(),
          },
        });
        console.log("Feedback saved to database for interview:", interviewId);
      } catch (error) {
        console.error("Error saving feedback to database:", error);
        // Don't fail the request if database save fails
      }
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 },
    );
  }
}

async function generateAdvancedFeedback(transcript: string) {
  // Parse transcript to get user and AI responses
  const lines = transcript.split("\n").filter((line) => line.trim());
  const userResponses = lines
    .filter((line) => line.startsWith("You:"))
    .map((line) => line.replace("You:", "").trim());
  const aiQuestions = lines
    .filter((line) => line.startsWith("AI:"))
    .map((line) => line.replace("AI:", "").trim());

  // Calculate basic metrics
  const totalResponses = userResponses.length;
  const totalWords = userResponses.join(" ").split(" ").length;
  const avgResponseLength =
    totalResponses > 0 ? Math.round(totalWords / totalResponses) : 0;

  // Analyze response quality
  const responseAnalysis = analyzeResponseQuality(userResponses);
  const communicationStyle = analyzeCommunicationStyle(userResponses);
  const topicCoverage = analyzeTopicCoverage(aiQuestions, userResponses);

  // Calculate overall score based on multiple factors
  const overallScore = calculateOverallScore({
    responseCount: totalResponses,
    avgLength: avgResponseLength,
    responseQuality: responseAnalysis,
    communication: communicationStyle,
    coverage: topicCoverage,
  });

  return {
    overall_score: overallScore,
    strengths: generateStrengths(
      responseAnalysis,
      communicationStyle,
      topicCoverage,
    ),
    areas_for_improvement: generateImprovements(
      responseAnalysis,
      communicationStyle,
      topicCoverage,
    ),
    recommendations: generateRecommendations(
      responseAnalysis,
      communicationStyle,
    ),
    conversation_quality: {
      engagement: getEngagementLevel(totalResponses, avgResponseLength),
      clarity: getClarityLevel(responseAnalysis),
      professionalism: getProfessionalismLevel(communicationStyle),
    },
    detailed_analysis: {
      response_count: totalResponses,
      average_response_length: avgResponseLength,
      total_words: totalWords,
      communication_style: communicationStyle,
      topic_coverage: topicCoverage,
    },
  };
}

function analyzeResponseQuality(responses: string[]) {
  let detailScore = 0;
  let exampleCount = 0;
  let specificityScore = 0;

  responses.forEach((response) => {
    const words = response.split(" ").length;
    if (words > 20) detailScore += 1;

    // Check for examples and specifics
    if (
      response.toLowerCase().includes("example") ||
      response.toLowerCase().includes("for instance") ||
      response.toLowerCase().includes("specifically")
    ) {
      exampleCount += 1;
    }

    // Check for specific details (numbers, names, technologies, etc.)
    if (
      /\b\d+\b/.test(response) ||
      /[A-Z][a-z]+/.test(response) ||
      response.includes("%") ||
      response.includes("$")
    ) {
      specificityScore += 1;
    }
  });

  return {
    detail_level: detailScore / responses.length,
    uses_examples: exampleCount > 0,
    specificity: specificityScore / responses.length,
  };
}

function analyzeCommunicationStyle(responses: string[]) {
  let professionalTerms = 0;
  let positiveLanguage = 0;
  let structuredResponses = 0;

  const professionalWords = [
    "experience",
    "skills",
    "expertise",
    "accomplished",
    "achieved",
    "contributed",
    "developed",
    "managed",
    "led",
    "collaborated",
  ];
  const positiveWords = [
    "excited",
    "passionate",
    "enthusiastic",
    "confident",
    "successful",
    "excellent",
    "outstanding",
    "effective",
  ];
  const structuralWords = [
    "first",
    "second",
    "additionally",
    "furthermore",
    "in conclusion",
    "to summarize",
  ];

  responses.forEach((response) => {
    const lowerResponse = response.toLowerCase();

    professionalWords.forEach((word) => {
      if (lowerResponse.includes(word)) professionalTerms += 1;
    });

    positiveWords.forEach((word) => {
      if (lowerResponse.includes(word)) positiveLanguage += 1;
    });

    structuralWords.forEach((word) => {
      if (lowerResponse.includes(word)) structuredResponses += 1;
    });
  });

  return {
    professionalism: professionalTerms / responses.length,
    positivity: positiveLanguage / responses.length,
    structure: structuredResponses / responses.length,
  };
}

function analyzeTopicCoverage(questions: string[], responses: string[]) {
  const topics = {
    experience: 0,
    skills: 0,
    motivation: 0,
    challenges: 0,
    goals: 0,
    teamwork: 0,
  };

  questions.forEach((question, index) => {
    const lowerQuestion = question.toLowerCase();
    const response = responses[index] || "";
    const lowerResponse = response.toLowerCase();

    if (
      lowerQuestion.includes("experience") ||
      lowerQuestion.includes("background")
    ) {
      topics.experience += response.length > 50 ? 1 : 0.5;
    }
    if (lowerQuestion.includes("skill") || lowerQuestion.includes("ability")) {
      topics.skills += response.length > 30 ? 1 : 0.5;
    }
    if (
      lowerQuestion.includes("why") ||
      lowerQuestion.includes("interest") ||
      lowerQuestion.includes("motivation")
    ) {
      topics.motivation += response.length > 40 ? 1 : 0.5;
    }
    if (
      lowerQuestion.includes("challenge") ||
      lowerQuestion.includes("difficult") ||
      lowerQuestion.includes("problem")
    ) {
      topics.challenges += response.length > 60 ? 1 : 0.5;
    }
    if (
      lowerQuestion.includes("goal") ||
      lowerQuestion.includes("future") ||
      lowerQuestion.includes("plan")
    ) {
      topics.goals += response.length > 30 ? 1 : 0.5;
    }
    if (
      lowerQuestion.includes("team") ||
      lowerQuestion.includes("collaborate") ||
      lowerQuestion.includes("work with")
    ) {
      topics.teamwork += response.length > 40 ? 1 : 0.5;
    }
  });

  return topics;
}

function calculateOverallScore(analysis: any) {
  let score = 60; // Base score

  // Response quantity and quality (30 points)
  score += Math.min(analysis.responseCount * 4, 20); // Up to 20 points for participation
  score += Math.min(analysis.avgLength * 0.5, 10); // Up to 10 points for detail

  // Response quality (25 points)
  score += analysis.responseQuality.detail_level * 10;
  score += analysis.responseQuality.uses_examples ? 10 : 0;
  score += analysis.responseQuality.specificity * 5;

  // Communication style (15 points)
  score += analysis.communication.professionalism * 8;
  score += analysis.communication.positivity * 4;
  score += analysis.communication.structure * 3;

  return Math.min(Math.round(score), 100);
}

function generateStrengths(
  responseAnalysis: any,
  communicationStyle: any,
  topicCoverage: any,
): string[] {
  const strengths: string[] = [];

  if (responseAnalysis.detail_level > 0.7) {
    strengths.push("Provides detailed and comprehensive responses");
  }
  if (responseAnalysis.uses_examples) {
    strengths.push("Effectively uses examples to illustrate points");
  }
  if (communicationStyle.professionalism > 0.5) {
    strengths.push("Demonstrates professional communication skills");
  }
  if (communicationStyle.positivity > 0.3) {
    strengths.push("Shows enthusiasm and positive attitude");
  }
  if (communicationStyle.structure > 0.2) {
    strengths.push("Organizes responses in a clear, structured manner");
  }

  return strengths.length > 0
    ? strengths
    : ["Shows good basic communication skills"];
}

function generateImprovements(
  responseAnalysis: any,
  communicationStyle: any,
  topicCoverage: any,
): string[] {
  const improvements: string[] = [];

  if (responseAnalysis.detail_level < 0.5) {
    improvements.push("Provide more detailed responses with specific examples");
  }
  if (!responseAnalysis.uses_examples) {
    improvements.push("Include specific examples to support your answers");
  }
  if (communicationStyle.professionalism < 0.3) {
    improvements.push(
      "Use more professional terminology and industry-specific language",
    );
  }
  if (communicationStyle.structure < 0.1) {
    improvements.push("Structure responses using frameworks like STAR method");
  }
  if (responseAnalysis.specificity < 0.3) {
    improvements.push(
      "Include more quantifiable achievements and specific details",
    );
  }

  return improvements.length > 0
    ? improvements
    : ["Continue practicing to build confidence"];
}

function generateRecommendations(
  responseAnalysis: any,
  communicationStyle: any,
) {
  return [
    "Practice the STAR method (Situation, Task, Action, Result) for behavioral questions",
    "Prepare specific examples from your experience for common interview topics",
    "Research the company and role thoroughly to show genuine interest",
    "Practice articulating your achievements with quantifiable results",
    "Work on maintaining confidence and enthusiasm throughout the interview",
  ];
}

function getEngagementLevel(responseCount: number, avgLength: number) {
  if (responseCount >= 6 && avgLength >= 25) return "High";
  if (responseCount >= 4 && avgLength >= 15) return "Medium";
  return "Low";
}

function getClarityLevel(responseAnalysis: any) {
  if (responseAnalysis.detail_level > 0.6 && responseAnalysis.specificity > 0.4)
    return "Excellent";
  if (responseAnalysis.detail_level > 0.4) return "Good";
  return "Needs improvement";
}

function getProfessionalismLevel(communicationStyle: any) {
  if (communicationStyle.professionalism > 0.5) return "High";
  if (communicationStyle.professionalism > 0.2) return "Good";
  return "Developing";
}
