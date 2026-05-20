import { HTML_TAG_TOKEN_PATTERN } from '../../constants/html.js';
import {
  filterHtmlAttributes,
  parseHtmlAttributes,
  serializeHtmlAttributes,
} from '../../utils/html.js';

import type {
  CleanHtmlOptions,
  CleanHtmlResult,
  CleanHtmlWarningCode,
} from './types.js';

const EMPTY_TAG_PATTERN = /<([a-z][a-z0-9]*)\b[^>]*>\s*<\/\1>/gi;

const detectMalformedHtml = (html: string): boolean => {
  return /<>/.test(html) || /<\s+\/?>/.test(html);
};

const collapseHtmlWhitespace = (html: string): string => {
  return html.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim();
};

const removeEmptyHtmlTags = (html: string): string => {
  let cleanedHtml = html;
  let previousHtml = '';

  while (previousHtml !== cleanedHtml) {
    previousHtml = cleanedHtml;
    cleanedHtml = cleanedHtml.replace(EMPTY_TAG_PATTERN, '');
  }

  return cleanedHtml;
};

const cleanHtmlTags = (html: string, options: CleanHtmlOptions): string => {
  const pattern = new RegExp(
    HTML_TAG_TOKEN_PATTERN.source,
    HTML_TAG_TOKEN_PATTERN.flags,
  );

  return html.replace(
    pattern,
    (_fullMatch, slash: string, tagName: string, attributePart: string, selfClosing: string) => {
      if (slash.length > 0) {
        return `</${tagName}>`;
      }

      let attributeString = attributePart.trim();
      let isSelfClosing = selfClosing.length > 0;

      if (attributeString.endsWith('/')) {
        isSelfClosing = true;
        attributeString = attributeString.slice(0, -1).trim();
      }

      const filteredAttributes = filterHtmlAttributes(
        parseHtmlAttributes(attributeString),
        options,
      );
      const serializedAttributes = serializeHtmlAttributes(filteredAttributes);
      const selfClosingSuffix = isSelfClosing ? ' /' : '';

      if (serializedAttributes.length === 0) {
        return `<${tagName}${selfClosingSuffix}>`;
      }

      return `<${tagName} ${serializedAttributes}${selfClosingSuffix}>`;
    },
  );
};

/**
 * Cleans HTML attributes while preserving tag and text structure.
 *
 * Can remove common noisy attributes (`class`, `id`, `style`, `data-*`),
 * enforce allow/deny lists, collapse whitespace, and remove empty tags.
 *
 * @param options - HTML cleanup options.
 * @returns Cleaned HTML and warning codes.
 *
 * @example
 * cleanHtml({
 *   html: '<p class="lead" id="intro" style="color:red">Hello</p>',
 *   removeClasses: true,
 *   removeIds: true,
 *   removeStyle: true,
 * });
 */
export const cleanHtml = ({
  html,
  removeClasses = false,
  removeIds = false,
  removeStyle = false,
  removeDataAttributes = false,
  removeAttributes,
  keepAttributes,
  collapseWhitespace = false,
  removeEmptyTags = false,
}: CleanHtmlOptions): CleanHtmlResult => {
  const warningCodes: CleanHtmlWarningCode[] = [];
  const trimmedHtml = html.trim();

  if (trimmedHtml.length === 0) {
    warningCodes.push('EMPTY_INPUT');

    return {
      html: '',
      warningCodes,
    };
  }

  if (detectMalformedHtml(trimmedHtml)) {
    warningCodes.push('MALFORMED_HTML');
  }

  const cleaningOptions: CleanHtmlOptions = {
    html: trimmedHtml,
    removeClasses,
    removeIds,
    removeStyle,
    removeDataAttributes,
    removeAttributes,
    keepAttributes,
    collapseWhitespace,
    removeEmptyTags,
  };

  let cleanedHtml = cleanHtmlTags(trimmedHtml, cleaningOptions);

  if (removeEmptyTags) {
    cleanedHtml = removeEmptyHtmlTags(cleanedHtml);
  }

  if (collapseWhitespace) {
    cleanedHtml = collapseHtmlWhitespace(cleanedHtml);
  }

  return {
    html: cleanedHtml,
    warningCodes,
  };
};
