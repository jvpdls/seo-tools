import { extractHeadings } from './extract.js';

import type {
  AnalyzeHeadingsOptions,
  HeadingItem,
  HeadingWarningCode,
  HeadingsAnalysis,
} from './types.js';

const hasSkippedHeadingLevels = (headings: HeadingItem[]): boolean => {
  let previousLevel = 0;

  for (const heading of headings) {
    if (heading.level - previousLevel > 1) {
      return true;
    }

    previousLevel = heading.level;
  }

  return false;
};

const getWarningCodes = ({
  h1Count,
  hasSkippedLevels,
}: {
  h1Count: number;
  hasSkippedLevels: boolean;
}): HeadingWarningCode[] => {
  const warningCodes: HeadingWarningCode[] = [];

  if (h1Count === 0) {
    warningCodes.push('MISSING_H1');
  }

  if (h1Count > 1) {
    warningCodes.push('MULTIPLE_H1');
  }

  if (hasSkippedLevels) {
    warningCodes.push('SKIPPED_HEADING_LEVEL');
  }

  return warningCodes;
};

/**
 * Analyzes heading structure from an HTML string.
 *
 * Checks for:
 * - missing H1
 * - multiple H1s
 * - skipped heading levels (for example, H1 -> H3)
 *
 * @param options - Heading analysis options.
 * @returns Structural heading diagnostics and warning codes.
 *
 * @example
 * analyzeHeadings({
 *   html: '<h1>Page</h1><h2>Section</h2><h4>Skipped</h4>',
 * });
 */
export const analyzeHeadings = ({
  html,
}: AnalyzeHeadingsOptions): HeadingsAnalysis => {
  const headings = extractHeadings(html);
  const h1Count = headings.filter((heading) => heading.level === 1).length;
  const hasSkippedLevels = hasSkippedHeadingLevels(headings);

  return {
    hasH1: h1Count > 0,
    h1Count,
    hasMultipleH1: h1Count > 1,
    hasSkippedLevels,
    headings,
    warningCodes: getWarningCodes({
      h1Count,
      hasSkippedLevels,
    }),
  };
};
