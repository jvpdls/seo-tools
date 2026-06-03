import type {
  ExtractRobotsRulesOptions,
  ExtractRobotsRulesResult,
  ExtractRobotsSitemapsOptions,
  ExtractRobotsSitemapsResult,
  RobotsGroup,
  RobotsRule,
} from './types.js';

type ParsedRobotsDocument = {
  groups: RobotsGroup[];
  sitemaps: string[];
};

const stripRobotsComment = (line: string): string => {
  const hashIndex = line.indexOf('#');

  if (hashIndex === -1) {
    return line.trim();
  }

  return line.slice(0, hashIndex).trim();
};

const createRobotsGroup = (): RobotsGroup => ({
  userAgents: [],
  rules: [],
  crawlDelay: null,
  host: null,
});

const parseDirectiveLine = (
  line: string,
): { directive: string; value: string } | null => {
  const separatorIndex = line.indexOf(':');

  if (separatorIndex === -1) {
    return null;
  }

  const directive = line.slice(0, separatorIndex).trim().toLowerCase();
  const value = line.slice(separatorIndex + 1).trim();

  if (directive.length === 0) {
    return null;
  }

  return { directive, value };
};

const ensureActiveGroup = (
  groups: RobotsGroup[],
  activeGroup: RobotsGroup | null,
): RobotsGroup => {
  if (activeGroup !== null) {
    return activeGroup;
  }

  const group = createRobotsGroup();

  groups.push(group);

  return group;
};

export const parseRobotsContent = (content: string): ParsedRobotsDocument => {
  const groups: RobotsGroup[] = [];
  const sitemaps: string[] = [];
  const lines = content.split(/\r?\n/);
  let activeGroup: RobotsGroup | null = null;
  let previousDirectiveWasUserAgent = false;

  for (const rawLine of lines) {
    const line = stripRobotsComment(rawLine);

    if (line.length === 0) {
      activeGroup = null;
      previousDirectiveWasUserAgent = false;
      continue;
    }

    const parsedLine = parseDirectiveLine(line);

    if (parsedLine === null) {
      continue;
    }

    const { directive, value } = parsedLine;

    if (directive === 'sitemap') {
      if (value.length > 0 && !sitemaps.includes(value)) {
        sitemaps.push(value);
      }

      previousDirectiveWasUserAgent = false;
      continue;
    }

    if (directive === 'user-agent') {
      if (activeGroup === null || (!previousDirectiveWasUserAgent && activeGroup.rules.length > 0)) {
        activeGroup = createRobotsGroup();
        groups.push(activeGroup);
      }

      if (value.length > 0) {
        activeGroup.userAgents.push(value.toLowerCase());
      }

      previousDirectiveWasUserAgent = true;
      continue;
    }

    activeGroup = ensureActiveGroup(groups, activeGroup);
    previousDirectiveWasUserAgent = false;

    if (directive === 'allow' || directive === 'disallow') {
      const rule: RobotsRule = {
        directive,
        value,
        line: groups.length,
      };

      activeGroup.rules.push(rule);
      continue;
    }

    if (directive === 'crawl-delay') {
      const crawlDelay = Number.parseFloat(value);

      activeGroup.crawlDelay = Number.isNaN(crawlDelay) ? null : crawlDelay;
      continue;
    }

    if (directive === 'host') {
      activeGroup.host = value.length > 0 ? value : null;
    }
  }

  return { groups, sitemaps };
};

export const extractRobotsRules = ({
  content,
}: ExtractRobotsRulesOptions): ExtractRobotsRulesResult => {
  if (content.trim().length === 0) {
    return {
      groups: [],
      warningCodes: ['EMPTY_INPUT'],
    };
  }

  const { groups } = parseRobotsContent(content);
  const warningCodes: ExtractRobotsRulesResult['warningCodes'] = [];

  if (groups.some((group) => group.userAgents.length === 0)) {
    warningCodes.push('MISSING_USER_AGENT');
  }

  return {
    groups,
    warningCodes,
  };
};

export const extractRobotsSitemaps = ({
  content,
}: ExtractRobotsSitemapsOptions): ExtractRobotsSitemapsResult => {
  if (content.trim().length === 0) {
    return {
      sitemaps: [],
      warningCodes: ['EMPTY_INPUT'],
    };
  }

  const { sitemaps } = parseRobotsContent(content);

  return {
    sitemaps,
    warningCodes: [],
  };
};
