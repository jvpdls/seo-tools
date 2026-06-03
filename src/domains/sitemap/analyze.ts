import { parseUrlInput } from '../../utils/url.js';

import { extractSitemapAnalysisPieces } from './extract.js';

import type {
  AnalyzeSitemapOptions,
  SitemapAnalysis,
  SitemapUrlEntry,
} from './types.js';

const isValidAbsoluteUrl = (url: string): boolean => {
  try {
    const parsed = parseUrlInput(url);

    return parsed.isAbsoluteUrl;
  } catch {
    return false;
  }
};

const getDuplicateUrls = (entries: SitemapUrlEntry[]): string[] => {
  const seenUrls = new Set<string>();
  const duplicateUrls = new Set<string>();

  for (const entry of entries) {
    if (seenUrls.has(entry.loc)) {
      duplicateUrls.add(entry.loc);
      continue;
    }

    seenUrls.add(entry.loc);
  }

  return [...duplicateUrls];
};

export const analyzeSitemap = ({
  xml,
}: AnalyzeSitemapOptions): SitemapAnalysis => {
  if (xml.trim().length === 0) {
    return {
      type: 'unknown',
      totalUrls: 0,
      totalChildSitemaps: 0,
      duplicateUrls: [],
      invalidUrls: [],
      invalidPriorityCount: 0,
      hasLastmod: false,
      hasChangefreq: false,
      hasPriority: false,
      warningCodes: ['EMPTY_INPUT'],
    };
  }

  const { type, urls, childSitemaps } = extractSitemapAnalysisPieces(xml);
  const invalidUrls = [
    ...new Set(
      [...urls.map((entry) => entry.loc), ...childSitemaps.map((entry) => entry.loc)].filter(
        (url) => !isValidAbsoluteUrl(url),
      ),
    ),
  ];
  const duplicateUrls = getDuplicateUrls(urls);
  const invalidPriorityCount = urls.filter(
    (entry) => entry.priority !== null && (entry.priority < 0 || entry.priority > 1),
  ).length;
  const warningCodes: SitemapAnalysis['warningCodes'] = [];

  if (type === 'unknown') {
    warningCodes.push('UNKNOWN_SITEMAP_TYPE');
  }

  if (type === 'urlset' && urls.length === 0) {
    warningCodes.push('MISSING_URLS');
  }

  if (type === 'sitemapindex' && childSitemaps.length === 0) {
    warningCodes.push('MISSING_CHILD_SITEMAPS');
  }

  if (duplicateUrls.length > 0) {
    warningCodes.push('DUPLICATE_URLS');
  }

  if (invalidUrls.length > 0) {
    warningCodes.push('INVALID_URL');
  }

  if (invalidPriorityCount > 0) {
    warningCodes.push('INVALID_PRIORITY');
  }

  return {
    type,
    totalUrls: urls.length,
    totalChildSitemaps: childSitemaps.length,
    duplicateUrls,
    invalidUrls,
    invalidPriorityCount,
    hasLastmod: urls.some((entry) => entry.lastmod !== null) || childSitemaps.some((entry) => entry.lastmod !== null),
    hasChangefreq: urls.some((entry) => entry.changefreq !== null),
    hasPriority: urls.some((entry) => entry.priority !== null),
    warningCodes,
  };
};
