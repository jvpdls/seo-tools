import { extractMetaAnalysisPieces } from './extract.js';

import type {
  AnalyzeMetaTagsOptions,
  MetaAnalysisWarningCode,
  MetaTagsAnalysis,
} from './types.js';

const collectSocialTags = (
  entries: MetaTagsAnalysis['metaTags'],
  prefix: string,
): Record<string, string> => {
  const socialTags: Record<string, string> = {};

  for (const entry of entries) {
    if (entry.key.startsWith(prefix) && entry.content !== null) {
      socialTags[entry.key] = entry.content;
    }
  }

  return socialTags;
};

const pushUnique = (
  warningCodes: MetaAnalysisWarningCode[],
  warningCode: MetaAnalysisWarningCode,
): void => {
  if (!warningCodes.includes(warningCode)) {
    warningCodes.push(warningCode);
  }
};

export const analyzeMetaTags = ({
  html,
}: AnalyzeMetaTagsOptions): MetaTagsAnalysis => {
  if (html.trim().length === 0) {
    return {
      title: null,
      titleCount: 0,
      metaDescription: null,
      metaDescriptionCount: 0,
      canonicalUrl: null,
      canonicalCount: 0,
      robotsContent: null,
      robotsDirectives: [],
      metaTags: [],
      openGraph: {},
      twitter: {},
      warningCodes: [
        'EMPTY_INPUT',
        'MISSING_TITLE',
        'MISSING_META_DESCRIPTION',
        'MISSING_CANONICAL',
        'MISSING_META_ROBOTS',
      ],
    };
  }

  const {
    metaTags,
    titles,
    descriptions,
    canonicalUrls,
    robotsContent,
    robotsDirectives,
  } = extractMetaAnalysisPieces(html);
  const warningCodes: MetaAnalysisWarningCode[] = [];

  if (titles.length === 0) {
    pushUnique(warningCodes, 'MISSING_TITLE');
  }

  if (titles.length > 1) {
    pushUnique(warningCodes, 'MULTIPLE_TITLES');
  }

  if (descriptions.length === 0) {
    pushUnique(warningCodes, 'MISSING_META_DESCRIPTION');
  }

  if (descriptions.length > 1) {
    pushUnique(warningCodes, 'MULTIPLE_META_DESCRIPTIONS');
  }

  if (canonicalUrls.length === 0) {
    pushUnique(warningCodes, 'MISSING_CANONICAL');
  }

  if (canonicalUrls.length > 1) {
    pushUnique(warningCodes, 'MULTIPLE_CANONICAL');
  }

  if (robotsContent === null) {
    pushUnique(warningCodes, 'MISSING_META_ROBOTS');
  }

  return {
    title: titles[0] ?? null,
    titleCount: titles.length,
    metaDescription: descriptions[0] ?? null,
    metaDescriptionCount: descriptions.length,
    canonicalUrl: canonicalUrls[0] ?? null,
    canonicalCount: canonicalUrls.length,
    robotsContent,
    robotsDirectives,
    metaTags,
    openGraph: collectSocialTags(metaTags, 'og:'),
    twitter: collectSocialTags(metaTags, 'twitter:'),
    warningCodes,
  };
};
