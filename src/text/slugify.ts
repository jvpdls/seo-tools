import {
  getSlugWords,
  joinSlugWords,
  normalizeWhitespace,
} from '../utils/text.js';

import { getStopwordsForLanguage } from './stopwords.js';

import type { SlugifyOptions, SlugifyResult } from './types.js';

export const prepareTextInput = (text: string): string => {
  return normalizeWhitespace(text);
};

export const createSlug = ({
  text,
  maxWords,
  removeStopwords = false,
  inputLanguage = 'en',
}: SlugifyOptions): SlugifyResult => {
  const originalText = text;
  const words = getSlugWords(prepareTextInput(text));
  const removedStopwords: string[] = [];
  const stopwords = getStopwordsForLanguage(inputLanguage);

  const wordsAfterStopwords = removeStopwords
    ? words.filter((word) => {
        if (stopwords.has(word)) {
          removedStopwords.push(word);

          return false;
        }

        return true;
      })
    : words;

  const limitedWords =
    maxWords === undefined
      ? wordsAfterStopwords
      : wordsAfterStopwords.slice(0, maxWords);

  const warningCodes =
    maxWords !== undefined && wordsAfterStopwords.length > maxWords
      ? (['MAX_WORDS_APPLIED'] as const)
      : [];

  return {
    slug: joinSlugWords(limitedWords),
    originalText,
    wordCount: limitedWords.length,
    removedStopwords,
    warningCodes: [...warningCodes],
  };
};
