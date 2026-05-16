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
