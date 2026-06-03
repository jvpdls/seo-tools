export type RobotsRuleDirective = 'allow' | 'disallow';

export type ExtractRobotsRulesWarningCode = 'EMPTY_INPUT' | 'MISSING_USER_AGENT';

export type ExtractRobotsSitemapsWarningCode = 'EMPTY_INPUT';

export type AnalyzeRobotsWarningCode =
  | ExtractRobotsRulesWarningCode
  | 'MISSING_RULES'
  | 'MISSING_SITEMAP';

export type MatchRobotsPathWarningCode = 'EMPTY_INPUT' | 'INVALID_PATH';

export type RobotsUrlAnalysisWarningCode = 'INVALID_URL' | 'BLOCKED_BY_ROBOTS';

export type RobotsUrlObservationCode =
  | 'ALLOWED_BY_ALLOW_RULE'
  | 'BLOCKED_BY_DISALLOW_RULE'
  | 'ALLOWED_WITHOUT_MATCHING_RULE'
  | 'MATCHED_GLOBAL_USER_AGENT'
  | 'MATCHED_SPECIFIC_USER_AGENT'
  | 'HAS_QUERY_STRING';

export type AnalyzeRobotsUrlsWarningCode =
  | 'EMPTY_INPUT'
  | 'EMPTY_URLS'
  | 'INVALID_URL'
  | 'BLOCKED_URLS_FOUND'
  | 'MIXED_HOSTS';

export type RobotsRule = {
  directive: RobotsRuleDirective;
  value: string;
  line: number;
};

export type RobotsGroup = {
  userAgents: string[];
  rules: RobotsRule[];
  crawlDelay: number | null;
  host: string | null;
};

export type ExtractRobotsRulesOptions = {
  content: string;
};

export type ExtractRobotsRulesResult = {
  groups: RobotsGroup[];
  warningCodes: ExtractRobotsRulesWarningCode[];
};

export type ExtractRobotsSitemapsOptions = {
  content: string;
};

export type ExtractRobotsSitemapsResult = {
  sitemaps: string[];
  warningCodes: ExtractRobotsSitemapsWarningCode[];
};

export type AnalyzeRobotsRulesOptions = {
  content: string;
  userAgent?: string;
};

export type AnalyzeRobotsRulesResult = {
  groups: RobotsGroup[];
  sitemaps: string[];
  totalGroups: number;
  totalRules: number;
  hasGlobalUserAgent: boolean;
  matchedUserAgents: string[];
  warningCodes: AnalyzeRobotsWarningCode[];
};

export type MatchRobotsPathOptions = {
  content: string;
  path: string;
  userAgent?: string;
};

export type MatchRobotsPathResult = {
  path: string;
  userAgent: string;
  allowed: boolean | null;
  matchedDirective: RobotsRuleDirective | null;
  matchedPattern: string | null;
  warningCodes: MatchRobotsPathWarningCode[];
};

export type AnalyzeRobotsUrlsOptions = {
  content: string;
  urls: string | string[];
  userAgent?: string;
};

export type AnalyzedRobotsUrl = {
  inputUrl: string;
  normalizedUrl: string | null;
  host: string | null;
  path: string | null;
  userAgent: string;
  allowed: boolean | null;
  matchedDirective: RobotsRuleDirective | null;
  matchedPattern: string | null;
  matchedUserAgents: string[];
  observations: RobotsUrlObservationCode[];
  warningCodes: RobotsUrlAnalysisWarningCode[];
};

export type AnalyzeRobotsUrlsResult = {
  userAgent: string;
  urls: AnalyzedRobotsUrl[];
  total: number;
  allowedCount: number;
  blockedCount: number;
  invalidCount: number;
  hosts: string[];
  hasMixedHosts: boolean;
  warningCodes: AnalyzeRobotsUrlsWarningCode[];
};
