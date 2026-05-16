import {
  countNonWhitespaceCharacters,
  countParagraphs,
  countSentences,
  countWords,
  estimateReadingTimeMinutes,
} from '../utils/text.js';

import type { CountTextMetricsOptions, TextCountMetrics } from './types.js';

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
