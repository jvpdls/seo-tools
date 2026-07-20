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

export {
  analyzeMetaTags,
  extractCanonical,
  extractMetaRobots,
  extractMetaTags,
} from './domains/meta/index.js';
export type {
  AnalyzeMetaTagsOptions,
  CanonicalExtractionResult,
  CanonicalWarningCode,
  ExtractCanonicalOptions,
  ExtractMetaRobotsOptions,
  ExtractMetaTagsOptions,
  ExtractMetaTagsResult,
  ExtractMetaTagsWarningCode,
  MetaAnalysisWarningCode,
  MetaRobotsExtractionResult,
  MetaRobotsWarningCode,
  MetaTagAttribute,
  MetaTagEntry,
  MetaTagsAnalysis,
} from './domains/meta/index.js';

export {
  analyzeImageAlts,
  analyzeImageDimensions,
  analyzeImageLoading,
  analyzeImages,
  extractImages,
} from './domains/images/index.js';
export type {
  AnalyzeImageAltsOptions,
  AnalyzeImageAltsResult,
  AnalyzeImageDimensionsOptions,
  AnalyzeImageDimensionsResult,
  AnalyzeImageLoadingOptions,
  AnalyzeImageLoadingResult,
  AnalyzeImagesOptions,
  ExtractImagesOptions,
  ExtractImagesResult,
  ExtractImagesWarningCode,
  ImageAltWarningCode,
  ImageAnalysisWarningCode,
  ImageDimensionWarningCode,
  ImageFramework,
  ImageItem,
  ImageLoadingWarningCode,
  ImageOptimizer,
  ImagesAnalysis,
} from './domains/images/index.js';

export {
  analyzeRobotsUrls,
  analyzeRobotsRules,
  extractRobotsRules,
  extractRobotsSitemaps,
  matchRobotsPath,
} from './domains/robots/index.js';
export type {
  AnalyzeRobotsUrlsOptions,
  AnalyzeRobotsUrlsResult,
  AnalyzeRobotsUrlsWarningCode,
  AnalyzeRobotsRulesOptions,
  AnalyzeRobotsRulesResult,
  AnalyzeRobotsWarningCode,
  AnalyzedRobotsUrl,
  ExtractRobotsRulesOptions,
  ExtractRobotsRulesResult,
  ExtractRobotsRulesWarningCode,
  ExtractRobotsSitemapsOptions,
  ExtractRobotsSitemapsResult,
  ExtractRobotsSitemapsWarningCode,
  MatchRobotsPathOptions,
  MatchRobotsPathResult,
  MatchRobotsPathWarningCode,
  RobotsGroup,
  RobotsUrlAnalysisWarningCode,
  RobotsUrlObservationCode,
  RobotsRule,
  RobotsRuleDirective,
} from './domains/robots/index.js';

export {
  analyzeSitemap,
  detectSitemapType,
  extractChildSitemaps,
  extractSitemapMetadata,
  extractSitemapUrls,
} from './domains/sitemap/index.js';
export type {
  AnalyzeSitemapOptions,
  AnalyzeSitemapWarningCode,
  DetectSitemapTypeOptions,
  DetectSitemapTypeResult,
  DetectSitemapTypeWarningCode,
  ExtractChildSitemapsOptions,
  ExtractChildSitemapsResult,
  ExtractChildSitemapsWarningCode,
  ExtractSitemapMetadataOptions,
  ExtractSitemapMetadataResult,
  ExtractSitemapMetadataWarningCode,
  ExtractSitemapUrlsOptions,
  ExtractSitemapUrlsResult,
  ExtractSitemapUrlsWarningCode,
  SitemapAnalysis,
  SitemapChildEntry,
  SitemapType,
  SitemapUrlEntry,
} from './domains/sitemap/index.js';

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
