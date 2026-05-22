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

export {
  buildAboutPageSchema,
  buildArticleSchema,
  buildContactPageSchema,
  buildFaqPageSchema,
  buildWebPageSchema,
  buildWebsiteSchema,
  DEFAULT_CONTACT_TYPE,
  SCHEMA_ORG_CONTEXT,
} from './domains/schema/index.js';
export type {
  AboutPageAboutInput,
  AboutPageAboutResult,
  AboutPageSchemaOptions,
  AboutPageSchemaResult,
  ArticleSchemaAuthorInput,
  ArticleSchemaAuthorResult,
  ArticleSchemaOptions,
  ArticleSchemaPublisherInput,
  ArticleSchemaPublisherResult,
  ArticleSchemaResult,
  ArticleSchemaType,
  ContactPageAboutResult,
  ContactPageContactPointInput,
  ContactPageContactPointResult,
  ContactPageOrganizationInput,
  ContactPageSchemaOptions,
  ContactPageSchemaResult,
  FaqPageQuestionInput,
  FaqPageSchemaOptions,
  FaqPageSchemaResult,
  JsonLdDocument,
  SchemaEntityType,
  SchemaPublisherInput,
  WebPageSchemaOptions,
  WebPageSchemaResult,
  WebsiteSchemaOptions,
  WebsiteSchemaResult,
} from './domains/schema/index.js';
