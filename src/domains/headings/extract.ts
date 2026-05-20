import { getPlainTextFromHtml, matchHeadingTags } from '../../utils/html.js';

import type { HeadingItem, HeadingLevel } from './types.js';

/**
 * Extracts H1-H6 headings from HTML in document order.
 *
 * Heading text is converted to plain text, nested tags are removed,
 * common entities are decoded, and empty headings are skipped.
 *
 * @param html - HTML markup to parse.
 * @returns Ordered heading items with level and text.
 *
 * @example
 * extractHeadings('<h1>Guide</h1><h2 class="mt-4">Chapter</h2>');
 */
export const extractHeadings = (html: string): HeadingItem[] => {
  return [...matchHeadingTags(html)]
    .map((match) => ({
      level: match.level as HeadingLevel,
      text: getPlainTextFromHtml(match.content),
    }))
    .filter((heading) => heading.text.length > 0);
};
