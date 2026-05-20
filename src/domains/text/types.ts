export type TextInputLanguage = 'en' | 'pt-BR';

export type SlugifyWarningCode = 'MAX_WORDS_APPLIED';

export type SlugifyOptions = {
  text: string;
  maxWords?: number;
  removeStopwords?: boolean;
  inputLanguage?: TextInputLanguage;
};

export type SlugifyResult = {
  slug: string;
  originalText: string;
  wordCount: number;
  removedStopwords: string[];
  warningCodes: SlugifyWarningCode[];
};

export type CountTextMetricsOptions = {
  text: string;
  wordsPerMinute?: number;
};

export type TextCountMetrics = {
  characters: number;
  charactersWithoutSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  estimatedReadingTimeMinutes: number;
};

export type KeywordDensityWarningCode =
  | 'KEYWORD_NOT_FOUND'
  | 'DENSITY_TOO_LOW'
  | 'DENSITY_TOO_HIGH';

export type KeywordDensityThresholds = {
  minDensity?: number;
  maxDensity?: number;
};

export type AnalyzeKeywordDensityOptions = {
  text: string;
  keywords: string[];
  inputLanguage?: TextInputLanguage;
  stripHtml?: boolean;
  thresholds?: KeywordDensityThresholds;
};

export type KeywordDensityMetrics = {
  keyword: string;
  occurrences: number;
  density: number;
  warningCodes: KeywordDensityWarningCode[];
};

export type KeywordDensityAnalysisWarningCode = 'EMPTY_INPUT' | 'NO_KEYWORDS';

export type AnalyzeKeywordDensityResult = {
  totalWords: number;
  keywords: KeywordDensityMetrics[];
  warningCodes: KeywordDensityAnalysisWarningCode[];
};
