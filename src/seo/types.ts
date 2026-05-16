export type SnippetStatus = 'short' | 'ok' | 'long';

export type SnippetOverallStatus = 'ok' | 'needs_improvement';

export type SnippetWarningCode =
  | 'TITLE_TOO_SHORT'
  | 'TITLE_TOO_LONG'
  | 'DESCRIPTION_TOO_SHORT'
  | 'DESCRIPTION_TOO_LONG';

export type AnalyzeSeoSnippetOptions = {
  title: string;
  description: string;
  keyword?: string;
};

export type SnippetPartAnalysis = {
  characters: number;
  status: SnippetStatus;
  hasKeyword: boolean;
  warningCodes: SnippetWarningCode[];
};

export type SeoSnippetAnalysis = {
  title: SnippetPartAnalysis;
  description: SnippetPartAnalysis;
  overallStatus: SnippetOverallStatus;
};
