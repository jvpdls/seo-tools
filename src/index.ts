export {
  countNonWhitespaceCharacters,
  countParagraphs,
  countSentences,
  countWords,
  estimateReadingTimeMinutes,
  getSlugWords,
  joinSlugWords,
  normalizeTextToken,
  normalizeWhitespace,
  removeDiacritics,
} from './utils/text.js';
export { countTextMetrics } from './text/count.js';
export { createSlug, prepareTextInput } from './text/slugify.js';
export type {
  CountTextMetricsOptions,
  SlugifyOptions,
  SlugifyResult,
  SlugifyWarningCode,
  TextCountMetrics,
  TextInputLanguage,
} from './text/types.js';
