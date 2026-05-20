export type SnippetStatus = 'short' | 'ok' | 'long';

export type SnippetOverallStatus = 'ok' | 'needs_improvement';

export type SnippetWarningCode =
  | 'TITLE_TOO_SHORT'
  | 'TITLE_TOO_LONG'
  | 'TITLE_MISSING_KEYWORD'
  | 'DESCRIPTION_TOO_SHORT'
  | 'DESCRIPTION_TOO_LONG'
  | 'DESCRIPTION_MISSING_KEYWORD';

export type AnalyzeSerpSnippetOptions = {
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

export type SerpSnippetAnalysis = {
  title: SnippetPartAnalysis;
  description: SnippetPartAnalysis;
  overallStatus: SnippetOverallStatus;
};

export type PageTitleWarningCode =
  | 'TITLE_TOO_SHORT'
  | 'TITLE_TOO_LONG'
  | 'TITLE_TRUNCATED';

export type BuildPageTitleOptions = {
  pageTitle: string;
  brand?: string;
  separator?: string;
  brandPosition?: 'suffix' | 'prefix';
  maxLength?: number;
};

export type BuildPageTitleResult = {
  title: string;
  characters: number;
  warningCodes: PageTitleWarningCode[];
};
