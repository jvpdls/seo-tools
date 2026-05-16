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
  if (status === 'short') {
    return ['TITLE_TOO_SHORT'];
  }

  if (status === 'long') {
    return ['TITLE_TOO_LONG'];
  }

  return [];
};

const getDescriptionWarningCodes = (
  status: SnippetStatus,
): SnippetWarningCode[] => {
  if (status === 'short') {
    return ['DESCRIPTION_TOO_SHORT'];
  }

  if (status === 'long') {
    return ['DESCRIPTION_TOO_LONG'];
  }

  return [];
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
  const hasKeywordGap =
    keyword !== undefined &&
    keyword.trim().length > 0 &&
    (!titleHasKeyword || !descriptionHasKeyword);
  const hasLengthIssue =
    titleStatus !== 'ok' || descriptionStatus !== 'ok';

  return {
    title: {
      characters: title.length,
      status: titleStatus,
      hasKeyword: titleHasKeyword,
      warningCodes: getTitleWarningCodes(titleStatus),
    },
    description: {
      characters: description.length,
      status: descriptionStatus,
      hasKeyword: descriptionHasKeyword,
      warningCodes: getDescriptionWarningCodes(descriptionStatus),
    },
    overallStatus:
      hasLengthIssue || hasKeywordGap ? 'needs_improvement' : 'ok',
  };
};
