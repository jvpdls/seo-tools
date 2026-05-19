export { countTextMetrics, createSlug } from './text/index.js';
export type {
  CountTextMetricsOptions,
  SlugifyOptions,
  SlugifyResult,
  SlugifyWarningCode,
  TextCountMetrics,
  TextInputLanguage,
} from './text/index.js';

export { analyzeHeadings } from './headings/index.js';
export type {
  AnalyzeHeadingsOptions,
  HeadingItem,
  HeadingLevel,
  HeadingsAnalysis,
  HeadingWarningCode,
} from './headings/index.js';

export { normalizeUrl } from './url/index.js';
export type {
  NormalizedUrlResult,
  NormalizeUrlOptions,
  QueryParamValue,
} from './url/index.js';

export { analyzeSeoSnippet } from './serp/index.js';
export type {
  AnalyzeSeoSnippetOptions,
  SeoSnippetAnalysis,
  SnippetOverallStatus,
  SnippetPartAnalysis,
  SnippetStatus,
  SnippetWarningCode,
} from './serp/index.js';
