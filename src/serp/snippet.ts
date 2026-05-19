import { normalizeTextToken } from '../utils/text.js';

import type {
  AnalyzeSeoSnippetOptions,
  SeoSnippetAnalysis,
  SnippetStatus,
  SnippetWarningCode,
} from './types.js';

const TITLE_MIN_CHARACTERS = 30;
const TITLE_MAX_IDEAL_CHARACTERS = 54;
const DESCRIPTION_MIN_CHARACTERS = 120;
const DESCRIPTION_MAX_IDEAL_CHARACTERS = 154;

const getSnippetStatus = (
  characters: number,
  minCharacters: number,
  maxIdealCharacters: number,
): SnippetStatus => {
  if (characters < minCharacters) {
    return 'short';
  }

  if (characters > maxIdealCharacters) {
    return 'long';
  }

  return 'ok';
};

const getKeywordMatch = (text: string, keyword?: string): boolean => {
  if (keyword === undefined || keyword.trim().length === 0) {
    return false;
  }

  return normalizeTextToken(text).includes(normalizeTextToken(keyword));
};

const getTitleWarningCodes = (status: SnippetStatus): SnippetWarningCode[] => {
  const warningCodes: SnippetWarningCode[] = [];

  if (status === 'short') {
    warningCodes.push('TITLE_TOO_SHORT');
  }

  if (status === 'long') {
    warningCodes.push('TITLE_TOO_LONG');
  }

  return warningCodes;
};

const getDescriptionWarningCodes = (
  status: SnippetStatus,
): SnippetWarningCode[] => {
  const warningCodes: SnippetWarningCode[] = [];

  if (status === 'short') {
    warningCodes.push('DESCRIPTION_TOO_SHORT');
  }

  if (status === 'long') {
    warningCodes.push('DESCRIPTION_TOO_LONG');
  }

  return warningCodes;
};

export const analyzeSeoSnippet = ({
  title,
  description,
  keyword,
}: AnalyzeSeoSnippetOptions): SeoSnippetAnalysis => {
  const titleStatus = getSnippetStatus(
    title.length,
    TITLE_MIN_CHARACTERS,
    TITLE_MAX_IDEAL_CHARACTERS,
  );
  const descriptionStatus = getSnippetStatus(
    description.length,
    DESCRIPTION_MIN_CHARACTERS,
    DESCRIPTION_MAX_IDEAL_CHARACTERS,
  );
  const titleHasKeyword = getKeywordMatch(title, keyword);
  const descriptionHasKeyword = getKeywordMatch(description, keyword);
  const shouldCheckKeyword = keyword !== undefined && keyword.trim().length > 0;
  const titleWarningCodes = getTitleWarningCodes(titleStatus);
  const descriptionWarningCodes =
    getDescriptionWarningCodes(descriptionStatus);

  if (shouldCheckKeyword && !titleHasKeyword) {
    titleWarningCodes.push('TITLE_MISSING_KEYWORD');
  }

  if (shouldCheckKeyword && !descriptionHasKeyword) {
    descriptionWarningCodes.push('DESCRIPTION_MISSING_KEYWORD');
  }

  const hasLengthIssue =
    titleStatus !== 'ok' || descriptionStatus !== 'ok';
  const hasKeywordGap =
    shouldCheckKeyword && (!titleHasKeyword || !descriptionHasKeyword);

  return {
    title: {
      characters: title.length,
      status: titleStatus,
      hasKeyword: titleHasKeyword,
      warningCodes: titleWarningCodes,
    },
    description: {
      characters: description.length,
      status: descriptionStatus,
      hasKeyword: descriptionHasKeyword,
      warningCodes: descriptionWarningCodes,
    },
    overallStatus:
      hasLengthIssue || hasKeywordGap ? 'needs_improvement' : 'ok',
  };
};
