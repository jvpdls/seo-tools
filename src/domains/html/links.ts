import {
  decodeHtmlEntities,
  getPlainTextFromHtml,
  matchHtmlTags,
} from '../../utils/html.js';
import {
  HTTP_URL_PATTERN,
  INVALID_HREF_SCHEME_PATTERN,
  PROTOCOL_RELATIVE_URL_PATTERN,
  URL_AUTHORITY_PATTERN,
  URL_SCHEME_PATTERN,
} from '../../constants/url.js';
import { getUrlResolutionBase, parseUrlInput } from '../../utils/url.js';

import type { CountLinksOptions, CountLinksResult, CountLinksWarningCode } from './types.js';

const getAttributeValue = (
  attributes: string,
  attributeName: string,
): string | undefined => {
  const pattern = new RegExp(
    `\\b${attributeName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    'i',
  );
  const match = attributes.match(pattern);

  if (!match) {
    return undefined;
  }

  return decodeHtmlEntities((match[1] ?? match[2] ?? match[3] ?? '').trim());
};

const hasRelToken = (attributes: string, token: string): boolean => {
  const relValue = getAttributeValue(attributes, 'rel');

  if (relValue === undefined) {
    return false;
  }

  return relValue
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(Boolean)
    .includes(token.toLowerCase());
};

const getBaseHostname = (baseUrl: string): string => {
  return new URL(getUrlResolutionBase(baseUrl)).hostname;
};

type LinkKind = 'internal' | 'external' | 'mailto' | 'tel' | 'unclassified';

const classifyResolvedUrl = (
  resolvedUrl: URL,
  baseUrl?: string,
): LinkKind | 'invalid' => {
  if (resolvedUrl.protocol === 'mailto:') {
    return 'mailto';
  }

  if (resolvedUrl.protocol === 'tel:') {
    return 'tel';
  }

  if (!['http:', 'https:'].includes(resolvedUrl.protocol)) {
    return 'unclassified';
  }

  if (baseUrl === undefined) {
    return 'external';
  }

  return getBaseHostname(baseUrl) === resolvedUrl.hostname ? 'internal' : 'external';
};

const classifyHref = (href: string, baseUrl?: string): LinkKind | 'invalid' => {
  if (href.length === 0 || INVALID_HREF_SCHEME_PATTERN.test(href)) {
    return 'invalid';
  }

  if (/^mailto:/i.test(href)) {
    return 'mailto';
  }

  if (/^tel:/i.test(href)) {
    return 'tel';
  }

  if (href.startsWith('#')) {
    return baseUrl === undefined ? 'unclassified' : 'internal';
  }

  if (PROTOCOL_RELATIVE_URL_PATTERN.test(href)) {
    if (baseUrl === undefined) {
      return 'unclassified';
    }

    try {
      return classifyResolvedUrl(new URL(href, getUrlResolutionBase(baseUrl)), baseUrl);
    } catch {
      return 'invalid';
    }
  }

  if (URL_AUTHORITY_PATTERN.test(href) || URL_SCHEME_PATTERN.test(href)) {
    try {
      return classifyResolvedUrl(new URL(href), baseUrl);
    } catch {
      return 'invalid';
    }
  }

  try {
    if (baseUrl !== undefined) {
      return classifyResolvedUrl(new URL(href, getUrlResolutionBase(baseUrl)), baseUrl);
    }

    if (HTTP_URL_PATTERN.test(href)) {
      parseUrlInput(href);
      return 'external';
    }

    parseUrlInput(href);
    return 'unclassified';
  } catch {
    return 'invalid';
  }
};

/**
 * Counts and classifies anchor links from HTML content.
 *
 * Reports totals for internal/external links, `mailto`, `tel`, `nofollow`,
 * empty anchors, and invalid href values.
 *
 * When `baseUrl` is provided, relative and hash links can be classified as
 * internal links against that host.
 *
 * @param options - Link counting options.
 * @returns Link inventory with warning codes.
 *
 * @example
 * countLinks({
 *   html: '<a href="/pricing">Pricing</a>',
 *   baseUrl: 'https://example.com/blog/post',
 * });
 */
export const countLinks = ({
  html,
  baseUrl,
}: CountLinksOptions): CountLinksResult => {
  const warningCodes: CountLinksWarningCode[] = [];
  const trimmedHtml = html.trim();

  if (trimmedHtml.length === 0) {
    warningCodes.push('EMPTY_INPUT');

    return {
      total: 0,
      internal: 0,
      external: 0,
      mailto: 0,
      tel: 0,
      nofollow: 0,
      emptyAnchor: 0,
      invalidHref: 0,
      warningCodes,
    };
  }

  const result: CountLinksResult = {
    total: 0,
    internal: 0,
    external: 0,
    mailto: 0,
    tel: 0,
    nofollow: 0,
    emptyAnchor: 0,
    invalidHref: 0,
    warningCodes,
  };

  for (const anchor of matchHtmlTags(trimmedHtml, 'a')) {
    result.total += 1;

    const href = getAttributeValue(anchor.attributes, 'href');

    if (hasRelToken(anchor.attributes, 'nofollow')) {
      result.nofollow += 1;
    }

    if (getPlainTextFromHtml(anchor.content).length === 0) {
      result.emptyAnchor += 1;
    }

    if (href === undefined || href.length === 0) {
      result.invalidHref += 1;
      continue;
    }

    const classification = classifyHref(href, baseUrl);

    if (classification === 'invalid') {
      result.invalidHref += 1;
      continue;
    }

    if (classification === 'internal') {
      result.internal += 1;
      continue;
    }

    if (classification === 'external') {
      result.external += 1;
      continue;
    }

    if (classification === 'mailto') {
      result.mailto += 1;
      continue;
    }

    if (classification === 'tel') {
      result.tel += 1;
    }
  }

  return result;
};
