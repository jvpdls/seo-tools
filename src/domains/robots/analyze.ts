import { formatParsedUrl, parseUrlInput } from '../../utils/url.js';

import { extractRobotsRules, extractRobotsSitemaps, parseRobotsContent } from './extract.js';

import type {
  AnalyzeRobotsUrlsOptions,
  AnalyzeRobotsUrlsResult,
  AnalyzedRobotsUrl,
  AnalyzeRobotsRulesOptions,
  AnalyzeRobotsRulesResult,
  MatchRobotsPathOptions,
  MatchRobotsPathResult,
  RobotsUrlObservationCode,
  RobotsGroup,
  RobotsRule,
} from './types.js';

const DEFAULT_USER_AGENT = '*';

const getMatchingUserAgentLength = (
  candidateUserAgent: string,
  requestedUserAgent: string,
): number => {
  if (candidateUserAgent === '*') {
    return 1;
  }

  return requestedUserAgent.includes(candidateUserAgent) ? candidateUserAgent.length : 0;
};

const selectMatchingGroups = (
  groups: RobotsGroup[],
  requestedUserAgent: string,
): RobotsGroup[] => {
  let highestMatchLength = 0;
  const matchingGroups: RobotsGroup[] = [];

  for (const group of groups) {
    const bestUserAgentMatch = Math.max(
      ...group.userAgents.map((userAgent) =>
        getMatchingUserAgentLength(userAgent, requestedUserAgent),
      ),
      0,
    );

    if (bestUserAgentMatch === 0) {
      continue;
    }

    if (bestUserAgentMatch > highestMatchLength) {
      highestMatchLength = bestUserAgentMatch;
      matchingGroups.length = 0;
      matchingGroups.push(group);
      continue;
    }

    if (bestUserAgentMatch === highestMatchLength) {
      matchingGroups.push(group);
    }
  }

  return matchingGroups;
};

const getMatchedUserAgents = (
  groups: RobotsGroup[],
  requestedUserAgent: string,
): string[] => {
  return [...new Set(selectMatchingGroups(groups, requestedUserAgent).flatMap((group) => group.userAgents))];
};

const normalizeRobotsPath = (path: string): string | null => {
  const trimmedPath = path.trim();

  if (trimmedPath.length === 0) {
    return null;
  }

  try {
    const { url } = parseUrlInput(trimmedPath);

    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
};

const escapeRegexLiteral = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const matchesRobotsRule = (path: string, ruleValue: string): boolean => {
  if (ruleValue.length === 0) {
    return false;
  }

  const normalizedPattern = ruleValue.endsWith('$')
    ? `${ruleValue.slice(0, -1)}\\$`
    : ruleValue;
  const regexSource = escapeRegexLiteral(normalizedPattern)
    .replace(/\\\*/g, '.*')
    .replace(/\\\$/g, '$');

  return new RegExp(`^${regexSource}`, 'i').test(path);
};

const pickBestMatchingRule = (
  path: string,
  rules: RobotsRule[],
): RobotsRule | null => {
  let bestRule: RobotsRule | null = null;
  let bestLength = -1;

  for (const rule of rules) {
    if (!matchesRobotsRule(path, rule.value)) {
      continue;
    }

    const ruleLength = rule.value.length;

    if (ruleLength > bestLength) {
      bestRule = rule;
      bestLength = ruleLength;
      continue;
    }

    if (ruleLength === bestLength && bestRule?.directive === 'disallow' && rule.directive === 'allow') {
      bestRule = rule;
    }
  }

  return bestRule;
};

const getUrlObservations = ({
  path,
  matchedDirective,
  matchedUserAgents,
}: {
  path: string;
  matchedDirective: RobotsRule['directive'] | null;
  matchedUserAgents: string[];
}): RobotsUrlObservationCode[] => {
  const observations: RobotsUrlObservationCode[] = [];

  if (matchedDirective === 'allow') {
    observations.push('ALLOWED_BY_ALLOW_RULE');
  } else if (matchedDirective === 'disallow') {
    observations.push('BLOCKED_BY_DISALLOW_RULE');
  } else {
    observations.push('ALLOWED_WITHOUT_MATCHING_RULE');
  }

  if (path.includes('?')) {
    observations.push('HAS_QUERY_STRING');
  }

  if (matchedUserAgents.some((userAgent) => userAgent !== '*')) {
    observations.push('MATCHED_SPECIFIC_USER_AGENT');
  } else if (matchedUserAgents.includes('*')) {
    observations.push('MATCHED_GLOBAL_USER_AGENT');
  }

  return observations;
};

const analyzeSingleRobotsUrl = ({
  inputUrl,
  userAgent,
  groups,
}: {
  inputUrl: string;
  userAgent: string;
  groups: RobotsGroup[];
}): AnalyzedRobotsUrl => {
  try {
    const parsed = parseUrlInput(inputUrl);

    if (!parsed.isAbsoluteUrl) {
      throw new TypeError('URL must be absolute.');
    }

    const path = `${parsed.url.pathname}${parsed.url.search}`;
    const matchedUserAgents = getMatchedUserAgents(groups, userAgent);
    const bestRule = pickBestMatchingRule(
      path,
      selectMatchingGroups(groups, userAgent).flatMap((group) => group.rules),
    );

    return {
      inputUrl,
      normalizedUrl: formatParsedUrl(parsed.url, parsed.isAbsoluteUrl),
      host: parsed.isAbsoluteUrl ? parsed.url.host.toLowerCase() : null,
      path,
      userAgent,
      allowed: bestRule === null ? true : bestRule.directive === 'allow',
      matchedDirective: bestRule?.directive ?? null,
      matchedPattern: bestRule?.value ?? null,
      matchedUserAgents,
      observations: getUrlObservations({
        path,
        matchedDirective: bestRule?.directive ?? null,
        matchedUserAgents,
      }),
      warningCodes: bestRule?.directive === 'disallow' ? ['BLOCKED_BY_ROBOTS'] : [],
    };
  } catch {
    return {
      inputUrl,
      normalizedUrl: null,
      host: null,
      path: null,
      userAgent,
      allowed: null,
      matchedDirective: null,
      matchedPattern: null,
      matchedUserAgents: [],
      observations: [],
      warningCodes: ['INVALID_URL'],
    };
  }
};

export const analyzeRobotsRules = ({
  content,
  userAgent = DEFAULT_USER_AGENT,
}: AnalyzeRobotsRulesOptions): AnalyzeRobotsRulesResult => {
  if (content.trim().length === 0) {
    return {
      groups: [],
      sitemaps: [],
      totalGroups: 0,
      totalRules: 0,
      hasGlobalUserAgent: false,
      matchedUserAgents: [],
      warningCodes: ['EMPTY_INPUT', 'MISSING_RULES', 'MISSING_SITEMAP'],
    };
  }

  const rulesResult = extractRobotsRules({ content });
  const sitemapResult = extractRobotsSitemaps({ content });
  const normalizedUserAgent = userAgent.trim().toLowerCase() || DEFAULT_USER_AGENT;
  const matchedGroups = selectMatchingGroups(rulesResult.groups, normalizedUserAgent);
  const matchedUserAgents = [...new Set(matchedGroups.flatMap((group) => group.userAgents))];
  const totalRules = rulesResult.groups.reduce(
    (sum, group) => sum + group.rules.length,
    0,
  );
  const warningCodes: AnalyzeRobotsRulesResult['warningCodes'] = [...rulesResult.warningCodes];

  if (totalRules === 0) {
    warningCodes.push('MISSING_RULES');
  }

  if (sitemapResult.sitemaps.length === 0) {
    warningCodes.push('MISSING_SITEMAP');
  }

  return {
    groups: rulesResult.groups,
    sitemaps: sitemapResult.sitemaps,
    totalGroups: rulesResult.groups.length,
    totalRules,
    hasGlobalUserAgent: rulesResult.groups.some((group) => group.userAgents.includes('*')),
    matchedUserAgents,
    warningCodes,
  };
};

export const matchRobotsPath = ({
  content,
  path,
  userAgent = DEFAULT_USER_AGENT,
}: MatchRobotsPathOptions): MatchRobotsPathResult => {
  if (content.trim().length === 0) {
    return {
      path,
      userAgent,
      allowed: null,
      matchedDirective: null,
      matchedPattern: null,
      warningCodes: ['EMPTY_INPUT'],
    };
  }

  const normalizedPath = normalizeRobotsPath(path);

  if (normalizedPath === null) {
    return {
      path,
      userAgent,
      allowed: null,
      matchedDirective: null,
      matchedPattern: null,
      warningCodes: ['INVALID_PATH'],
    };
  }

  const normalizedUserAgent = userAgent.trim().toLowerCase() || DEFAULT_USER_AGENT;
  const { groups } = parseRobotsContent(content);
  const matchingGroups = selectMatchingGroups(groups, normalizedUserAgent);
  const bestRule = pickBestMatchingRule(
    normalizedPath,
    matchingGroups.flatMap((group) => group.rules),
  );

  if (bestRule === null) {
    return {
      path: normalizedPath,
      userAgent: normalizedUserAgent,
      allowed: true,
      matchedDirective: null,
      matchedPattern: null,
      warningCodes: [],
    };
  }

  return {
    path: normalizedPath,
    userAgent: normalizedUserAgent,
    allowed: bestRule.directive === 'allow',
    matchedDirective: bestRule.directive,
    matchedPattern: bestRule.value,
    warningCodes: [],
  };
};

export const analyzeRobotsUrls = ({
  content,
  urls,
  userAgent = DEFAULT_USER_AGENT,
}: AnalyzeRobotsUrlsOptions): AnalyzeRobotsUrlsResult => {
  const normalizedUserAgent = userAgent.trim().toLowerCase() || DEFAULT_USER_AGENT;
  const normalizedUrls = (Array.isArray(urls) ? urls : [urls]).filter(
    (url) => url.trim().length > 0,
  );

  if (content.trim().length === 0) {
    return {
      userAgent: normalizedUserAgent,
      urls: [],
      total: 0,
      allowedCount: 0,
      blockedCount: 0,
      invalidCount: 0,
      hosts: [],
      hasMixedHosts: false,
      warningCodes:
        normalizedUrls.length === 0 ? ['EMPTY_INPUT', 'EMPTY_URLS'] : ['EMPTY_INPUT'],
    };
  }

  if (normalizedUrls.length === 0) {
    return {
      userAgent: normalizedUserAgent,
      urls: [],
      total: 0,
      allowedCount: 0,
      blockedCount: 0,
      invalidCount: 0,
      hosts: [],
      hasMixedHosts: false,
      warningCodes: ['EMPTY_URLS'],
    };
  }

  const { groups } = parseRobotsContent(content);
  const analyzedUrls = normalizedUrls.map((inputUrl) =>
    analyzeSingleRobotsUrl({
      inputUrl,
      userAgent: normalizedUserAgent,
      groups,
    }),
  );
  const hosts = [...new Set(analyzedUrls.map((entry) => entry.host).filter((host): host is string => host !== null))];
  const blockedCount = analyzedUrls.filter(
    (entry) => entry.warningCodes.includes('BLOCKED_BY_ROBOTS'),
  ).length;
  const invalidCount = analyzedUrls.filter(
    (entry) => entry.warningCodes.includes('INVALID_URL'),
  ).length;
  const allowedCount = analyzedUrls.filter((entry) => entry.allowed === true).length;
  const warningCodes: AnalyzeRobotsUrlsResult['warningCodes'] = [];

  if (invalidCount > 0) {
    warningCodes.push('INVALID_URL');
  }

  if (blockedCount > 0) {
    warningCodes.push('BLOCKED_URLS_FOUND');
  }

  if (hosts.length > 1) {
    warningCodes.push('MIXED_HOSTS');
  }

  return {
    userAgent: normalizedUserAgent,
    urls: analyzedUrls,
    total: analyzedUrls.length,
    allowedCount,
    blockedCount,
    invalidCount,
    hosts,
    hasMixedHosts: hosts.length > 1,
    warningCodes,
  };
};
