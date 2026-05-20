import { getPlainTextFromHtml } from '../../utils/html.js';
import {
  getSlugWords,
  normalizeTextToken,
  tokenizeWords,
} from '../../utils/text.js';

import type {
  AnalyzeKeywordDensityOptions,
  AnalyzeKeywordDensityResult,
  KeywordDensityAnalysisWarningCode,
  KeywordDensityMetrics,
  KeywordDensityThresholds,
  KeywordDensityWarningCode,
} from './types.js';

const DEFAULT_MIN_DENSITY = 0.5;
const DEFAULT_MAX_DENSITY = 3;

const roundDensity = (density: number): number => {
  return Math.round(density * 100) / 100;
};

const getKeywordTokens = (keyword: string): string[] => {
  return getSlugWords(keyword);
};

const countKeywordOccurrences = (text: string, keyword: string): number => {
  const textTokens = tokenizeWords(text).map((token) => normalizeTextToken(token));
  const keywordTokens = getKeywordTokens(keyword);

  if (keywordTokens.length === 0) {
    return 0;
  }

  if (keywordTokens.length === 1) {
    return textTokens.filter((token) => token === keywordTokens[0]).length;
  }

  let occurrences = 0;

  for (let index = 0; index <= textTokens.length - keywordTokens.length; index += 1) {
    const isPhraseMatch = keywordTokens.every(
      (keywordToken, tokenIndex) => textTokens[index + tokenIndex] === keywordToken,
    );

    if (isPhraseMatch) {
      occurrences += 1;
    }
  }

  return occurrences;
};

const getDensityPercentage = (
  occurrences: number,
  totalWords: number,
): number => {
  if (totalWords === 0) {
    return 0;
  }

  return roundDensity((occurrences / totalWords) * 100);
};

const getKeywordWarningCodes = ({
  occurrences,
  density,
  thresholds,
}: {
  occurrences: number;
  density: number;
  thresholds: Required<KeywordDensityThresholds>;
}): KeywordDensityWarningCode[] => {
  const warningCodes: KeywordDensityWarningCode[] = [];

  if (occurrences === 0) {
    warningCodes.push('KEYWORD_NOT_FOUND');
    return warningCodes;
  }

  if (density < thresholds.minDensity) {
    warningCodes.push('DENSITY_TOO_LOW');
  }

  if (density > thresholds.maxDensity) {
    warningCodes.push('DENSITY_TOO_HIGH');
  }

  return warningCodes;
};

/**
 * Analyzes keyword density for one or more keywords in a text.
 *
 * Matching is case- and accent-insensitive, supports multi-word phrases,
 * and can optionally strip HTML before tokenization.
 *
 * Default thresholds:
 * - `minDensity`: `0.5`
 * - `maxDensity`: `3`
 *
 * @param options - Keyword density options and thresholds.
 * @returns Density metrics per keyword and analysis-level warning codes.
 *
 * @example
 * analyzeKeywordDensity({
 *   text: '<p>Project brief scope and timeline.</p>',
 *   keywords: ['project brief', 'scope'],
 *   stripHtml: true,
 * });
 */
export const analyzeKeywordDensity = ({
  text,
  keywords,
  stripHtml = false,
  thresholds,
}: AnalyzeKeywordDensityOptions): AnalyzeKeywordDensityResult => {
  const warningCodes: KeywordDensityAnalysisWarningCode[] = [];
  const resolvedThresholds: Required<KeywordDensityThresholds> = {
    minDensity: thresholds?.minDensity ?? DEFAULT_MIN_DENSITY,
    maxDensity: thresholds?.maxDensity ?? DEFAULT_MAX_DENSITY,
  };

  const normalizedText = stripHtml ? getPlainTextFromHtml(text) : text.trim();
  const uniqueKeywords = [...new Set(keywords.map((keyword) => keyword.trim()).filter(Boolean))];

  if (normalizedText.length === 0) {
    warningCodes.push('EMPTY_INPUT');

    return {
      totalWords: 0,
      keywords: [],
      warningCodes,
    };
  }

  if (uniqueKeywords.length === 0) {
    warningCodes.push('NO_KEYWORDS');

    return {
      totalWords: tokenizeWords(normalizedText).length,
      keywords: [],
      warningCodes,
    };
  }

  const totalWords = tokenizeWords(normalizedText).length;

  const keywordMetrics: KeywordDensityMetrics[] = uniqueKeywords.map((keyword) => {
    const occurrences = countKeywordOccurrences(normalizedText, keyword);
    const density = getDensityPercentage(occurrences, totalWords);

    return {
      keyword,
      occurrences,
      density,
      warningCodes: getKeywordWarningCodes({
        occurrences,
        density,
        thresholds: resolvedThresholds,
      }),
    };
  });

  return {
    totalWords,
    keywords: keywordMetrics,
    warningCodes,
  };
};
