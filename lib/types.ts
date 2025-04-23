import { CV } from "@prisma/client";

import { ScoreResult } from "@/lib/schemas";

export interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  hasEOL: boolean;
}
export type TextItems = TextItem[];

export type Line = TextItem[];
export type Lines = Line[];

export interface TextScore {
  text: string;
  score: number;
  match: boolean;
}
export type TextScores = TextScore[];

export type ScoreResultStatus = "idle" | "processing" | "success" | "error";

export interface ScoreResultExtended extends CV {
  status: string | null;
}

export interface ResultsList {
  [key: string]: ScoreResultExtended;
}
