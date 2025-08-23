import React from "react";
import { Separator } from "@radix-ui/react-separator";

import { Score } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ResumeScore = ({ score }: { score: Score }) => {
  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>Score Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Section */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium text-muted-foreground">
              Total Score
            </div>
            <div className="text-2xl font-bold">{score.totalScore} / 100</div>
          </div>
          {score.skillScore !== undefined && (
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">
                Skills
              </div>
              <div className="text-xl font-semibold">{score.skillScore}</div>
            </div>
          )}
          {score.experienceScore !== undefined && (
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">
                Experience
              </div>
              <div className="text-xl font-semibold">
                {score.experienceScore}
              </div>
            </div>
          )}
          {score.educationScore !== undefined && (
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">
                Education
              </div>
              <div className="text-xl font-semibold">
                {score.educationScore}
              </div>
            </div>
          )}
          {score.languageScore !== undefined && (
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">
                Languages
              </div>
              <div className="text-xl font-semibold">{score.languageScore}</div>
            </div>
          )}
        </div>

        {score.reasoning && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Reasoning</h3>
            <p className="text-sm leading-relaxed">{score.reasoning}</p>
          </div>
        )}

        {score.strengths?.length ? (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-green-700">Strengths</h3>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {score.strengths.map((item, i) => (
                <li key={i} className="text-green-600">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {score.weaknesses?.length ? (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-red-700">
              Areas for Improvement
            </h3>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {score.weaknesses.map((item, i) => (
                <li key={i} className="text-red-600">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {score.notes && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Additional Notes</h3>
            <p className="text-sm leading-relaxed">{score.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
