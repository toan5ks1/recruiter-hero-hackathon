import { randomBytes } from "crypto";

/**
 * Generates a unique, secure interview link
 * Uses a combination of timestamp and random bytes for uniqueness
 */
export function generateInterviewLink(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = randomBytes(16).toString("hex");
  return `${timestamp}-${randomPart}`;
}

/**
 * Validates if an interview link format is correct
 */
export function isValidInterviewLinkFormat(link: string): boolean {
  const linkPattern = /^[a-z0-9]+-[a-f0-9]{32}$/;
  return linkPattern.test(link);
}

/**
 * Generates a shortened display version of the link for UI
 */
export function getShortDisplayLink(fullLink: string): string {
  const parts = fullLink.split("/");
  const linkId = parts[parts.length - 1];
  return `...${linkId.slice(-8)}`;
}

/**
 * Formats the interview date for candidate display
 */
export function formatInterviewDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(date));
}

/**
 * Checks if interview is within the allowed time window
 */
export function isInterviewTimeValid(
  scheduledAt: Date,
  windowMinutes: number = 30,
): boolean {
  const now = new Date();
  const interviewTime = new Date(scheduledAt);
  const timeDiff = Math.abs(now.getTime() - interviewTime.getTime());
  const diffMinutes = timeDiff / (1000 * 60);

  return diffMinutes <= windowMinutes;
}
