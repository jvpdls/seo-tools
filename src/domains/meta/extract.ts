import {
  getHtmlAttributeValue,
  getPlainTextFromHtml,
  matchHtmlTags,
  matchSingleHtmlTags,
} from '../../utils/html.js';

import type {
  CanonicalExtractionResult,
  ExtractCanonicalOptions,
  ExtractMetaRobotsOptions,
  ExtractMetaTagsOptions,
  ExtractMetaTagsResult,
  MetaRobotsExtractionResult,
  MetaTagAttribute,
  MetaTagEntry,
} from './types.js';

const getMetaTagAttribute = (
  attributes: string,
): { attribute: MetaTagAttribute; key: string; content: string | null } | null => {
  const name = getHtmlAttributeValue(attributes, 'name');

  if (name !== undefined) {
    return {
      attribute: 'name',
      key: name.trim().toLowerCase(),
      content: getHtmlAttributeValue(attributes, 'content') ?? null,
    };
  }

  const property = getHtmlAttributeValue(attributes, 'property');

  if (property !== undefined) {
    return {
      attribute: 'property',
      key: property.trim().toLowerCase(),
      content: getHtmlAttributeValue(attributes, 'content') ?? null,
    };
  }

  const httpEquiv = getHtmlAttributeValue(attributes, 'http-equiv');

  if (httpEquiv !== undefined) {
    return {
      attribute: 'http-equiv',
      key: httpEquiv.trim().toLowerCase(),
      content: getHtmlAttributeValue(attributes, 'content') ?? null,
    };
  }

  const charset = getHtmlAttributeValue(attributes, 'charset');

  if (charset !== undefined) {
    return {
      attribute: 'charset',
      key: 'charset',
      content: charset.trim(),
    };
  }

  return null;
};

const extractMetaTagEntries = (html: string): MetaTagEntry[] => {
  const metaTags: MetaTagEntry[] = [];

  for (const tag of matchSingleHtmlTags(html, 'meta')) {
    const metaTag = getMetaTagAttribute(tag.attributes);

    if (metaTag === null || metaTag.key.length === 0) {
      continue;
    }

    metaTags.push({
      ...metaTag,
      index: tag.index,
    });
  }

  return metaTags;
};

const getCanonicalLinks = (html: string): string[] => {
  const canonicalUrls: string[] = [];

  for (const tag of matchSingleHtmlTags(html, 'link')) {
    const rel = getHtmlAttributeValue(tag.attributes, 'rel');

    if (rel === undefined) {
      continue;
    }

    const relTokens = rel
      .split(/\s+/)
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean);

    if (!relTokens.includes('canonical')) {
      continue;
    }

    const href = getHtmlAttributeValue(tag.attributes, 'href');

    if (href !== undefined) {
      canonicalUrls.push(href.trim());
    }
  }

  return canonicalUrls;
};

const getTitleValues = (html: string): string[] => {
  const titles: string[] = [];

  for (const tag of matchHtmlTags(html, 'title')) {
    const title = getPlainTextFromHtml(tag.content).trim();

    if (title.length > 0) {
      titles.push(title);
    }
  }

  return titles;
};

const getMetaDescriptions = (metaTags: MetaTagEntry[]): string[] => {
  return metaTags
    .filter((metaTag) => metaTag.attribute === 'name' && metaTag.key === 'description')
    .map((metaTag) => metaTag.content?.trim() ?? '')
    .filter((description) => description.length > 0);
};

const parseRobotsDirectives = (content: string | null): string[] => {
  if (content === null) {
    return [];
  }

  return [...new Set(
    content
      .split(',')
      .map((directive) => directive.trim().toLowerCase())
      .filter(Boolean),
  )];
};

export const extractMetaTags = ({
  html,
}: ExtractMetaTagsOptions): ExtractMetaTagsResult => {
  if (html.trim().length === 0) {
    return {
      metaTags: [],
      warningCodes: ['EMPTY_INPUT'],
    };
  }

  return {
    metaTags: extractMetaTagEntries(html),
    warningCodes: [],
  };
};

export const extractCanonical = ({
  html,
}: ExtractCanonicalOptions): CanonicalExtractionResult => {
  if (html.trim().length === 0) {
    return {
      canonicalUrl: null,
      occurrences: 0,
      warningCodes: ['EMPTY_INPUT'],
    };
  }

  const canonicalUrls = getCanonicalLinks(html);
  const warningCodes: CanonicalExtractionResult['warningCodes'] = [];

  if (canonicalUrls.length === 0) {
    warningCodes.push('MISSING_CANONICAL');
  }

  if (canonicalUrls.length > 1) {
    warningCodes.push('MULTIPLE_CANONICAL');
  }

  return {
    canonicalUrl: canonicalUrls[0] ?? null,
    occurrences: canonicalUrls.length,
    warningCodes,
  };
};

export const extractMetaRobots = ({
  html,
}: ExtractMetaRobotsOptions): MetaRobotsExtractionResult => {
  if (html.trim().length === 0) {
    return {
      content: null,
      directives: [],
      occurrences: 0,
      warningCodes: ['EMPTY_INPUT'],
    };
  }

  const metaTags = extractMetaTagEntries(html);
  const robotsTags = metaTags.filter(
    (metaTag) => metaTag.attribute === 'name' && metaTag.key === 'robots',
  );
  const content = robotsTags[0]?.content?.trim() ?? null;
  const warningCodes: MetaRobotsExtractionResult['warningCodes'] = [];

  if (robotsTags.length === 0) {
    warningCodes.push('MISSING_META_ROBOTS');
  }

  return {
    content,
    directives: parseRobotsDirectives(content),
    occurrences: robotsTags.length,
    warningCodes,
  };
};

export const extractMetaAnalysisPieces = (html: string) => {
  const metaTags = extractMetaTagEntries(html);
  const titles = getTitleValues(html);
  const descriptions = getMetaDescriptions(metaTags);
  const canonicalUrls = getCanonicalLinks(html);
  const robotsTags = metaTags.filter(
    (metaTag) => metaTag.attribute === 'name' && metaTag.key === 'robots',
  );
  const robotsContent = robotsTags[0]?.content?.trim() ?? null;

  return {
    metaTags,
    titles,
    descriptions,
    canonicalUrls,
    robotsContent,
    robotsDirectives: parseRobotsDirectives(robotsContent),
  };
};
