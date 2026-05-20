import {
  countNonWhitespaceCharacters,
  countParagraphs,
  countSentences,
  countWords,
  estimateReadingTimeMinutes,
} from '../../utils/text.js';

import type { CountTextMetricsOptions, TextCountMetrics } from './types.js';

/**
 * Counts editorial metrics for a text input.
 *
 * Returns literal character counters plus linguistic counters
 * (words, sentences, paragraphs) and estimated reading time.
 *
 * @param options - Text metrics options.
 * @returns Text metrics used by content and SEO tooling.
 *
 * @example
 * countTextMetrics({
 *   text: 'First sentence.\n\nSecond paragraph with extra context.',
 *   wordsPerMinute: 200,
 * });
 */
export const countTextMetrics = ({
  text,
  wordsPerMinute,
}: CountTextMetricsOptions): TextCountMetrics => {
  const words = countWords(text);

  return {
    characters: text.length,
    charactersWithoutSpaces: countNonWhitespaceCharacters(text),
    words,
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    estimatedReadingTimeMinutes: estimateReadingTimeMinutes(
      words,
      wordsPerMinute,
    ),
  };
};
