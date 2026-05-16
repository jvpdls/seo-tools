import { normalizeWhitespace } from '../utils/text.js';

import type {
  AnalyzeHeadingsOptions,
  HeadingItem,
  HeadingLevel,
  HeadingWarningCode,
  HeadingsAnalysis,
} from './types.js';

const HEADING_TAG_PATTERN = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
const HTML_TAG_PATTERN = /<[^>]*>/g;
const HTML_ENTITY_PATTERN = /&(#x[\da-f]+|#\d+|[a-z]+);/gi;

const NAMED_HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
};

const decodeHtmlEntity = (entity: string): string => {
  const normalizedEntity = entity.toLowerCase();

  if (normalizedEntity.startsWith('#x')) {
    const codePoint = Number.parseInt(normalizedEntity.slice(2), 16);

    return Number.isNaN(codePoint) ? `&${entity};` : String.fromCodePoint(codePoint);
  }

  if (normalizedEntity.startsWith('#')) {
    const codePoint = Number.parseInt(normalizedEntity.slice(1), 10);

    return Number.isNaN(codePoint) ? `&${entity};` : String.fromCodePoint(codePoint);
  }

  return NAMED_HTML_ENTITIES[normalizedEntity] ?? `&${entity};`;
};

const decodeHtmlEntities = (text: string): string => {
  return text.replace(HTML_ENTITY_PATTERN, (_match, entity: string) =>
    decodeHtmlEntity(entity),
  );
};

const getHeadingText = (content: string): string => {
  return normalizeWhitespace(
    decodeHtmlEntities(content.replace(HTML_TAG_PATTERN, ' ')),
  );
};

const extractHeadings = (html: string): HeadingItem[] => {
  return [...html.matchAll(HEADING_TAG_PATTERN)]
    .map((match) => ({
      level: Number(match[1]) as HeadingLevel,
      text: getHeadingText(match[2] ?? ''),
    }))
    .filter((heading) => heading.text.length > 0);
};

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
