export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingWarningCode =
  | 'MISSING_H1'
  | 'MULTIPLE_H1'
  | 'SKIPPED_HEADING_LEVEL';

export type AnalyzeHeadingsOptions = {
  html: string;
};

export type HeadingItem = {
  level: HeadingLevel;
  text: string;
};

export type HeadingsAnalysis = {
  hasH1: boolean;
  h1Count: number;
  hasMultipleH1: boolean;
  hasSkippedLevels: boolean;
  headings: HeadingItem[];
  warningCodes: HeadingWarningCode[];
};
