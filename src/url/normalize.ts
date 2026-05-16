import type {
  NormalizedUrlResult,
  NormalizeUrlOptions,
  QueryParamValue,
} from './types.js';

const RELATIVE_URL_BASE = 'https://placeholder.local';
const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:\/\//i;

const TRACKING_PARAM_NAMES = new Set([
  '__s',
  '_branch_match_id',
  '_bta_c',
  '_bta_tid',
  '_ga',
  '_ke',
  'campaign_id',
  'campid',
  'customid',
  'dm_i',
  'ef_id',
  'epik',
  'fbclid',
  'gclid',
  'gclsrc',
  'gdffi',
  'gdfms',
  'gdftrk',
  'hootpostid',
  'li_fat_id',
  'mc_cid',
  'mc_eid',
  'mkcid',
  'mkevt',
  'mkrid',
  'mkwid',
  'msclkid',
  'pcrid',
  's_kwcid',
  'sb_referer_host',
  'si',
  'toolid',
  'twclid',
  'wprov',
  'wt.mc_id',
  'wt.nav',
]);

const TRACKING_PARAM_PREFIXES = [
  'hsa_',
  'igsh',
  'matomo_',
  'mtm_',
  'piwik_',
  'pk_',
  'sms_',
  'trk_',
  'utm_',
];

const hasTrackingPrefix = (paramName: string): boolean => {
  return TRACKING_PARAM_PREFIXES.some((prefix) => paramName.startsWith(prefix));
};

const normalizeParamName = (paramName: string): string => {
  return paramName.trim().toLowerCase();
};

const addUnique = (values: string[], value: string): void => {
  if (!values.includes(value)) {
    values.push(value);
  }
};

const isTrackingParam = (paramName: string): boolean => {
  const normalizedParamName = normalizeParamName(paramName);

  return (
    TRACKING_PARAM_NAMES.has(normalizedParamName) ||
    hasTrackingPrefix(normalizedParamName)
  );
};

const getParseTarget = (
  url: string,
): { isAbsoluteUrl: boolean; parseTarget: string } => {
  const trimmedUrl = url.trim();

  if (trimmedUrl.length === 0) {
    throw new TypeError('URL must not be empty.');
  }

  const isAbsoluteUrl = ABSOLUTE_URL_PATTERN.test(trimmedUrl);

  if (isAbsoluteUrl) {
    return {
      isAbsoluteUrl,
      parseTarget: trimmedUrl,
    };
  }

  return {
    isAbsoluteUrl,
    parseTarget: trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`,
  };
};

const createUrl = (parseTarget: string, isAbsoluteUrl: boolean): URL => {
  try {
    return isAbsoluteUrl
      ? new URL(parseTarget)
      : new URL(parseTarget, RELATIVE_URL_BASE);
  } catch {
    throw new TypeError('URL is invalid.');
  }
};

const collectQueryParams = (
  searchParams: URLSearchParams,
): Record<string, QueryParamValue> => {
  const queryParams: Record<string, QueryParamValue> = {};

  for (const [key, value] of searchParams) {
    const currentValue = queryParams[key];

    if (currentValue === undefined) {
      queryParams[key] = value;
      continue;
    }

    if (Array.isArray(currentValue)) {
      currentValue.push(value);
      continue;
    }

    queryParams[key] = [currentValue, value];
  }

  return queryParams;
};

const removeTrackingSearchParams = (url: URL): string[] => {
  const removedParams: string[] = [];

  for (const key of [...url.searchParams.keys()]) {
    if (isTrackingParam(key)) {
      addUnique(removedParams, key);
      url.searchParams.delete(key);
    }
  }

  return removedParams;
};

const lowercaseSearchParams = (searchParams: URLSearchParams): URLSearchParams => {
  const lowercasedParams = new URLSearchParams();

  for (const [key, value] of searchParams) {
    lowercasedParams.append(key.toLowerCase(), value.toLowerCase());
  }

  return lowercasedParams;
};

const lowercaseUrl = (url: URL): void => {
  url.hostname = url.hostname.toLowerCase();
  url.pathname = url.pathname.toLowerCase();
  url.search = lowercaseSearchParams(url.searchParams).toString();

  if (url.hash.length > 0) {
    url.hash = url.hash.toLowerCase();
  }
};

const getNormalizedUrl = (url: URL, isAbsoluteUrl: boolean): string => {
  if (isAbsoluteUrl) {
    return url.href;
  }

  return `${url.pathname}${url.search}${url.hash}`;
};

export const normalizeUrl = ({
  url,
  removeTrackingParams = false,
  forceLowercaseHost = false,
  forceLowercaseUrl = false,
  removeHash = false,
}: NormalizeUrlOptions): NormalizedUrlResult => {
  const originalUrl = url;
  const { isAbsoluteUrl, parseTarget } = getParseTarget(url);
  const parsedUrl = createUrl(parseTarget, isAbsoluteUrl);
  const removedParams = removeTrackingParams
    ? removeTrackingSearchParams(parsedUrl)
    : [];
  const hashRemoved = removeHash && parsedUrl.hash.length > 0;

  if (removeHash) {
    parsedUrl.hash = '';
  }

  if (forceLowercaseUrl) {
    lowercaseUrl(parsedUrl);
  } else if (forceLowercaseHost) {
    parsedUrl.hostname = parsedUrl.hostname.toLowerCase();
  }

  return {
    originalUrl,
    normalizedUrl: getNormalizedUrl(parsedUrl, isAbsoluteUrl),
    protocol: isAbsoluteUrl ? parsedUrl.protocol.replace(/:$/, '') : null,
    host: isAbsoluteUrl ? parsedUrl.host : null,
    path: parsedUrl.pathname,
    queryParams: collectQueryParams(parsedUrl.searchParams),
    removedParams,
    urlLowercased: forceLowercaseUrl,
    hashRemoved,
  };
};
