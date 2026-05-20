import { normalizeWhitespace } from '../../utils/text.js';

import {
  DEFAULT_PAGE_TITLE_SEPARATOR,
  TITLE_MAX_IDEAL_CHARACTERS,
  TITLE_MIN_CHARACTERS,
} from './constants.js';

import type {
  BuildPageTitleOptions,
  BuildPageTitleResult,
  PageTitleWarningCode,
} from './types.js';

const getLengthWarningCodes = (
  characters: number,
): PageTitleWarningCode[] => {
  const warningCodes: PageTitleWarningCode[] = [];

  if (characters < TITLE_MIN_CHARACTERS) {
    warningCodes.push('TITLE_TOO_SHORT');
  }

  if (characters > TITLE_MAX_IDEAL_CHARACTERS) {
    warningCodes.push('TITLE_TOO_LONG');
  }

  return warningCodes;
};

const composeTitle = (
  pageTitle: string,
  brand: string,
  separator: string,
  brandPosition: 'suffix' | 'prefix',
): string => {
  if (brandPosition === 'prefix') {
    return `${brand}${separator}${pageTitle}`;
  }

  return `${pageTitle}${separator}${brand}`;
};

/**
 * Builds a branded HTML `<title>` value with optional truncation.
 *
 * The output is normalized for whitespace and returns warning codes aligned
 * with snippet title thresholds.
 *
 * @param options - Page title composition options.
 * @returns Final title string, character count, and warning codes.
 *
 * @example
 * buildPageTitle({
 *   pageTitle: 'Project Brief Template',
 *   brand: 'Acme Agency',
 *   separator: ' | ',
 *   brandPosition: 'suffix',
 *   maxLength: 60,
 * });
 */
export const buildPageTitle = ({
  pageTitle,
  brand,
  separator = DEFAULT_PAGE_TITLE_SEPARATOR,
  brandPosition = 'suffix',
  maxLength,
}: BuildPageTitleOptions): BuildPageTitleResult => {
  const normalizedPageTitle = normalizeWhitespace(pageTitle);
  const normalizedBrand =
    brand === undefined ? '' : normalizeWhitespace(brand);
  const warningCodes: PageTitleWarningCode[] = [];

  let title =
    normalizedBrand.length === 0
      ? normalizedPageTitle
      : composeTitle(
          normalizedPageTitle,
          normalizedBrand,
          separator,
          brandPosition,
        );

  if (maxLength !== undefined && title.length > maxLength) {
    title = title.slice(0, maxLength);
    warningCodes.push('TITLE_TRUNCATED');
  }

  warningCodes.push(...getLengthWarningCodes(title.length));

  return {
    title,
    characters: title.length,
    warningCodes,
  };
};
