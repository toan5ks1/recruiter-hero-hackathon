"use client";

import React, { useState } from "react";
import { Copy, ExternalLink, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface InterviewLinkDisplayProps {
  interviewLink: string;
  candidateName: string;
  candidateEmail?: string;
  scheduledDate: Date;
  interviewMode?: "phone" | "link";
  onClose?: () => void;
}

export const InterviewLinkDisplay: React.FC<InterviewLinkDisplayProps> = ({
  interviewLink,
  candidateName,
  candidateEmail,
  scheduledDate,
  interviewMode = "link",
  onClose,
}) => {
  const [emailSubject, setEmailSubject] = useState(
    `Interview Invitation - ${new Date(scheduledDate).toLocaleDateString()}`,
  );
  const [emailBody, setEmailBody] = useState(
    `Hi ${candidateName},

Your interview has been scheduled for ${new Date(scheduledDate).toLocaleString()}.

Please click the link below to join your AI-powered interview:
${interviewLink}

What to expect:
• This is an AI-powered phone interview
• The AI will ask questions about your experience
• The interview will take approximately 30 minutes
• Please ensure you have a stable internet connection

If you have any questions, please don't hesitate to reach out.

Best regards,
The Recruitment Team`,
  );

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(`${label} copied to clipboard!`);
      })
      .catch(() => {
        toast.error(`Failed to copy ${label.toLowerCase()}`);
      });
  };

  const openInNewTab = () => {
    window.open(interviewLink, "_blank");
  };

  const sendEmail = () => {
    const mailtoLink = `mailto:${candidateEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="space-y-6">
      {/* Interview Link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">
            ✅{" "}
            {interviewMode === "phone"
              ? "Phone Interview Scheduled!"
              : "Interview Link Generated!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="link">Interview Link</Label>
            <div className="mt-1 flex gap-2">
              <Input
                id="link"
                value={interviewLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(interviewLink, "Interview link")}
              >
                <Copy className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={openInNewTab}>
                <ExternalLink className="size-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {/* Interview Details */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-3 font-semibold text-gray-900">
                📋 Interview Details:
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600">
                    {interviewMode === "phone"
                      ? "Scheduled Time:"
                      : "Available From:"}
                  </span>
                  <p className="text-gray-900">
                    {scheduledDate.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Interview Mode:
                  </span>
                  <p className="text-gray-900">
                    {interviewMode === "phone"
                      ? "📞 Phone Call + Link Backup"
                      : "🔗 Flexible Link Access"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Link Expires:
                  </span>
                  <p className="text-gray-900">
                    {new Date(
                      scheduledDate.getTime() + 7 * 24 * 60 * 60 * 1000,
                    ).toLocaleDateString()}
                    <span className="ml-1 text-xs text-gray-500">(7 days)</span>
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Candidate:</span>
                  <p className="text-gray-900">{candidateName}</p>
                </div>
              </div>
            </div>

            {/* Mode-specific information */}
            {interviewMode === "phone" ? (
              <div className="rounded-lg bg-blue-50 p-4">
                <h4 className="mb-2 font-semibold text-blue-900">
                  📞 Phone Interview Details:
                </h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• AI will call candidate at the scheduled time</li>
                  <li>• Link below serves as backup if call fails</li>
                  <li>• Both options expire after 7 days</li>
                  <li>• Candidate will receive call on provided number</li>
                </ul>
              </div>
            ) : (
              <div className="rounded-lg bg-green-50 p-4">
                <h4 className="mb-2 font-semibold text-green-900">
                  🔗 Link Interview Details:
                </h4>
                <ul className="space-y-1 text-sm text-green-800">
                  <li>• Candidate can access anytime until expiry</li>
                  <li>• No specific schedule required - flexible timing</li>
                  <li>• Link expires 7 days after creation</li>
                  <li>• Perfect for candidates in different time zones</li>
                </ul>
              </div>
            )}

            {/* Next Steps */}
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="mb-2 font-semibold text-blue-900">
                🎯 Next Steps:
              </h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>1. Copy the interview link above</li>
                <li>2. Send it to the candidate via email or phone</li>
                {interviewMode === "phone" ? (
                  <>
                    <li>3. AI will call the candidate at the scheduled time</li>
                    <li>4. Candidate can also use the link as backup</li>
                  </>
                ) : (
                  <>
                    <li>3. Candidate can join anytime before link expires</li>
                    <li>4. No specific schedule needed - flexible access</li>
                  </>
                )}
                <li>
                  {interviewMode === "phone" ? "5" : "5"}. Monitor the interview
                  progress in your dashboard
                </li>
              </ul>
            </div>

            {/* Expiry Warning */}
            <div className="rounded border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-800">
                ⏰ <strong>Important:</strong> This interview link will expire
                on{" "}
                <strong>
                  {new Date(
                    scheduledDate.getTime() + 7 * 24 * 60 * 60 * 1000,
                  ).toLocaleDateString()}
                </strong>{" "}
                at{" "}
                <strong>
                  {new Date(
                    scheduledDate.getTime() + 7 * 24 * 60 * 60 * 1000,
                  ).toLocaleTimeString()}
                </strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Template */}
      {candidateEmail && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5" />
              Email Invitation Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="body">Email Body</Label>
              <Textarea
                id="body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={sendEmail} className="flex-1">
                <Mail className="mr-2 size-4" />
                Send Email
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(emailBody, "Email template")}
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
