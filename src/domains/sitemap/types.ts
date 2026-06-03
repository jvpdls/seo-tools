export type SitemapType = 'urlset' | 'sitemapindex' | 'unknown';

export type DetectSitemapTypeWarningCode = 'EMPTY_INPUT';

export type ExtractSitemapUrlsWarningCode = 'EMPTY_INPUT';

export type ExtractSitemapMetadataWarningCode = 'EMPTY_INPUT';

export type ExtractChildSitemapsWarningCode = 'EMPTY_INPUT';

export type AnalyzeSitemapWarningCode =
  | 'EMPTY_INPUT'
  | 'UNKNOWN_SITEMAP_TYPE'
  | 'MISSING_URLS'
  | 'MISSING_CHILD_SITEMAPS'
  | 'DUPLICATE_URLS'
  | 'INVALID_URL'
  | 'INVALID_PRIORITY';

export type SitemapUrlEntry = {
  loc: string;
  lastmod: string | null;
  changefreq: string | null;
  priority: number | null;
};

export type SitemapChildEntry = {
  loc: string;
  lastmod: string | null;
};

export type DetectSitemapTypeOptions = {
  xml: string;
};

export type DetectSitemapTypeResult = {
  type: SitemapType;
  warningCodes: DetectSitemapTypeWarningCode[];
};

export type ExtractSitemapUrlsOptions = {
  xml: string;
};

export type ExtractSitemapUrlsResult = {
  urls: string[];
  warningCodes: ExtractSitemapUrlsWarningCode[];
};

export type ExtractSitemapMetadataOptions = {
  xml: string;
};

export type ExtractSitemapMetadataResult = {
  urls: SitemapUrlEntry[];
  warningCodes: ExtractSitemapMetadataWarningCode[];
};

export type ExtractChildSitemapsOptions = {
  xml: string;
};

export type ExtractChildSitemapsResult = {
  sitemaps: SitemapChildEntry[];
  warningCodes: ExtractChildSitemapsWarningCode[];
};

export type AnalyzeSitemapOptions = {
  xml: string;
};

export type SitemapAnalysis = {
  type: SitemapType;
  totalUrls: number;
  totalChildSitemaps: number;
  duplicateUrls: string[];
  invalidUrls: string[];
  invalidPriorityCount: number;
  hasLastmod: boolean;
  hasChangefreq: boolean;
  hasPriority: boolean;
  warningCodes: AnalyzeSitemapWarningCode[];
};
