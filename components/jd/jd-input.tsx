import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type JDInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
};

export const JDInput: React.FC<JDInputProps> = ({
  value,
  onChange,
  onSubmit,
  isSubmitting = false,
}) => {
  return (
    <Card className="flex size-full flex-col border-0 sm:border">
      <CardHeader className="space-y-6 text-center">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold">Job Description</CardTitle>
          <CardDescription className="text-base">
            Upload a PDF or input job description
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-4">
        <Textarea
          placeholder="Paste or write the job description here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[160px] flex-1 resize-none"
          disabled={isSubmitting}
        />
      </CardContent>
    </Card>
  );
};
