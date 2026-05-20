import {
  getSlugWords,
  getStopwordsForLanguage,
  joinSlugWords,
  normalizeWhitespace,
} from '../../utils/text.js';

import type { SlugifyOptions, SlugifyResult } from './types.js';

const prepareTextInput = (text: string): string => {
  return normalizeWhitespace(text);
};

/**
 * Creates an SEO-friendly slug from plain text.
 *
 * The generated slug is normalized to lowercase ASCII tokens separated by `-`.
 * Optionally removes stopwords for `en` or `pt-BR` before truncating by `maxWords`.
 *
 * @param options - Slug generation options.
 * @returns A normalized slug plus metadata about removed stopwords and warnings.
 *
 * @example
 * createSlug({
 *   text: 'How to write a clear project brief for clients',
 *   maxWords: 6,
 *   removeStopwords: true,
 * });
 * // => {
 * //   slug: 'write-clear-project-brief-clients',
 * //   warningCodes: ['MAX_WORDS_APPLIED'],
 * //   ...
 * // }
 */
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
