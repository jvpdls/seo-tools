export type ExtractMetaTagsWarningCode = 'EMPTY_INPUT';

export type CanonicalWarningCode =
  | 'EMPTY_INPUT'
  | 'MISSING_CANONICAL'
  | 'MULTIPLE_CANONICAL';

export type MetaRobotsWarningCode = 'EMPTY_INPUT' | 'MISSING_META_ROBOTS';

export type MetaAnalysisWarningCode =
  | CanonicalWarningCode
  | MetaRobotsWarningCode
  | 'MISSING_TITLE'
  | 'MULTIPLE_TITLES'
  | 'MISSING_META_DESCRIPTION'
  | 'MULTIPLE_META_DESCRIPTIONS';

export type MetaTagAttribute = 'name' | 'property' | 'http-equiv' | 'charset';

export type MetaTagEntry = {
  attribute: MetaTagAttribute;
  key: string;
  content: string | null;
  index: number;
};

export type ExtractMetaTagsOptions = {
  html: string;
};

export type ExtractMetaTagsResult = {
  metaTags: MetaTagEntry[];
  warningCodes: ExtractMetaTagsWarningCode[];
};

export type ExtractCanonicalOptions = {
  html: string;
};

export type CanonicalExtractionResult = {
  canonicalUrl: string | null;
  occurrences: number;
  warningCodes: CanonicalWarningCode[];
};

export type ExtractMetaRobotsOptions = {
  html: string;
};

export type MetaRobotsExtractionResult = {
  content: string | null;
  directives: string[];
  occurrences: number;
  warningCodes: MetaRobotsWarningCode[];
};

export type AnalyzeMetaTagsOptions = {
  html: string;
};

export type MetaTagsAnalysis = {
  title: string | null;
  titleCount: number;
  metaDescription: string | null;
  metaDescriptionCount: number;
  canonicalUrl: string | null;
  canonicalCount: number;
  robotsContent: string | null;
  robotsDirectives: string[];
  metaTags: MetaTagEntry[];
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
  warningCodes: MetaAnalysisWarningCode[];
};
