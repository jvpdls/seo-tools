export { analyzeKeywordDensity, countTextMetrics, createSlug } from './domains/text/index.js';
export type {
  AnalyzeKeywordDensityOptions,
  AnalyzeKeywordDensityResult,
  CountTextMetricsOptions,
  KeywordDensityAnalysisWarningCode,
  KeywordDensityMetrics,
  KeywordDensityThresholds,
  KeywordDensityWarningCode,
  SlugifyOptions,
  SlugifyResult,
  SlugifyWarningCode,
  TextCountMetrics,
  TextInputLanguage,
} from './domains/text/index.js';

export { analyzeHeadings, extractHeadings } from './domains/headings/index.js';
export type {
  AnalyzeHeadingsOptions,
  HeadingItem,
  HeadingLevel,
  HeadingsAnalysis,
  HeadingWarningCode,
} from './domains/headings/index.js';

export { buildUtmUrl, normalizeUrl } from './domains/url/index.js';
export type {
  BuildUtmUrlOptions,
  BuildUtmUrlResult,
  NormalizedUrlResult,
  NormalizeUrlOptions,
  QueryParamValue,
  UtmParams,
} from './domains/url/index.js';

export { cleanHtml, countLinks } from './domains/html/index.js';
export type {
  CleanHtmlOptions,
  CleanHtmlResult,
  CleanHtmlWarningCode,
  CountLinksOptions,
  CountLinksResult,
  CountLinksWarningCode,
} from './domains/html/index.js';

export { analyzeSerpSnippet, buildPageTitle } from './domains/serp/index.js';
export type {
  AnalyzeSerpSnippetOptions,
  BuildPageTitleOptions,
  BuildPageTitleResult,
  PageTitleWarningCode,
  SerpSnippetAnalysis,
  SnippetOverallStatus,
  SnippetPartAnalysis,
  SnippetStatus,
  SnippetWarningCode,
} from './domains/serp/index.js';
