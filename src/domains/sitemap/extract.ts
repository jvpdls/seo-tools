import { getPlainTextFromHtml, matchHtmlTags } from '../../utils/html.js';

import type {
  DetectSitemapTypeOptions,
  DetectSitemapTypeResult,
  ExtractChildSitemapsOptions,
  ExtractChildSitemapsResult,
  ExtractSitemapMetadataOptions,
  ExtractSitemapMetadataResult,
  ExtractSitemapUrlsOptions,
  ExtractSitemapUrlsResult,
  SitemapChildEntry,
  SitemapType,
  SitemapUrlEntry,
} from './types.js';

const ROOT_URLSET_PATTERN = /<urlset\b/i;
const ROOT_SITEMAP_INDEX_PATTERN = /<sitemapindex\b/i;

const getNestedTagValue = (content: string, tagName: string): string | null => {
  for (const tag of matchHtmlTags(content, tagName)) {
    const value = getPlainTextFromHtml(tag.content).trim();

    if (value.length > 0) {
      return value;
    }
  }

  return null;
};

const parsePriority = (priority: string | null): number | null => {
  if (priority === null) {
    return null;
  }

  const parsedPriority = Number.parseFloat(priority);

  return Number.isNaN(parsedPriority) ? null : parsedPriority;
};

const detectType = (xml: string): SitemapType => {
  if (ROOT_URLSET_PATTERN.test(xml)) {
    return 'urlset';
  }

  if (ROOT_SITEMAP_INDEX_PATTERN.test(xml)) {
    return 'sitemapindex';
  }

  return 'unknown';
};

const extractUrlEntries = (xml: string): SitemapUrlEntry[] => {
  const urls: SitemapUrlEntry[] = [];

  for (const tag of matchHtmlTags(xml, 'url')) {
    const loc = getNestedTagValue(tag.content, 'loc');

    if (loc === null) {
      continue;
    }

    urls.push({
      loc,
      lastmod: getNestedTagValue(tag.content, 'lastmod'),
      changefreq: getNestedTagValue(tag.content, 'changefreq'),
      priority: parsePriority(getNestedTagValue(tag.content, 'priority')),
    });
  }

  return urls;
};

const extractChildEntries = (xml: string): SitemapChildEntry[] => {
  const sitemaps: SitemapChildEntry[] = [];

  for (const tag of matchHtmlTags(xml, 'sitemap')) {
    const loc = getNestedTagValue(tag.content, 'loc');

    if (loc === null) {
      continue;
    }

    sitemaps.push({
      loc,
      lastmod: getNestedTagValue(tag.content, 'lastmod'),
    });
  }

  return sitemaps;
};

export const detectSitemapType = ({
  xml,
}: DetectSitemapTypeOptions): DetectSitemapTypeResult => {
  if (xml.trim().length === 0) {
    return {
      type: 'unknown',
      warningCodes: ['EMPTY_INPUT'],
    };
  }

  return {
    type: detectType(xml),
    warningCodes: [],
  };
};

export const extractSitemapUrls = ({
  xml,
}: ExtractSitemapUrlsOptions): ExtractSitemapUrlsResult => {
  if (xml.trim().length === 0) {
    return {
      urls: [],
      warningCodes: ['EMPTY_INPUT'],
    };
  }

  return {
    urls: extractUrlEntries(xml).map((entry) => entry.loc),
    warningCodes: [],
  };
};

export const extractSitemapMetadata = ({
  xml,
}: ExtractSitemapMetadataOptions): ExtractSitemapMetadataResult => {
  if (xml.trim().length === 0) {
    return {
      urls: [],
      warningCodes: ['EMPTY_INPUT'],
    };
  }

  return {
    urls: extractUrlEntries(xml),
    warningCodes: [],
  };
};

export const extractChildSitemaps = ({
  xml,
}: ExtractChildSitemapsOptions): ExtractChildSitemapsResult => {
  if (xml.trim().length === 0) {
    return {
      sitemaps: [],
      warningCodes: ['EMPTY_INPUT'],
    };
  }

  return {
    sitemaps: extractChildEntries(xml),
    warningCodes: [],
  };
};

export const extractSitemapAnalysisPieces = (xml: string) => {
  return {
    type: detectType(xml),
    urls: extractUrlEntries(xml),
    childSitemaps: extractChildEntries(xml),
  };
};
