import { ABSOLUTE_URL_PATTERN, RELATIVE_URL_BASE } from '../constants/url.js';

type ParsedUrlInput = {
  originalUrl: string;
  isAbsoluteUrl: boolean;
  url: URL;
};

type ApplyQueryParamsResult = {
  addedParams: string[];
  skippedParams: string[];
};

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

const normalizeParamName = (paramName: string): string => {
  return paramName.trim().toLowerCase();
};

const hasTrackingPrefix = (paramName: string): boolean => {
  return TRACKING_PARAM_PREFIXES.some((prefix) => paramName.startsWith(prefix));
};

export const isTrackingParam = (paramName: string): boolean => {
  const normalizedParamName = normalizeParamName(paramName);

  return (
    TRACKING_PARAM_NAMES.has(normalizedParamName) ||
    hasTrackingPrefix(normalizedParamName)
  );
};

export const parseUrlInput = (url: string): ParsedUrlInput => {
  const originalUrl = url;
  const trimmedUrl = url.trim();

  if (trimmedUrl.length === 0) {
    throw new TypeError('URL must not be empty.');
  }

  const isAbsoluteUrl = ABSOLUTE_URL_PATTERN.test(trimmedUrl);
  const parseTarget = isAbsoluteUrl
    ? trimmedUrl
    : trimmedUrl.startsWith('/')
      ? trimmedUrl
      : `/${trimmedUrl}`;

  try {
    const parsedUrl = isAbsoluteUrl
      ? new URL(parseTarget)
      : new URL(parseTarget, RELATIVE_URL_BASE);

    return {
      originalUrl,
      isAbsoluteUrl,
      url: parsedUrl,
    };
  } catch {
    throw new TypeError('URL is invalid.');
  }
};

export const formatParsedUrl = (
  parsedUrl: URL,
  isAbsoluteUrl: boolean,
): string => {
  if (isAbsoluteUrl) {
    return parsedUrl.href;
  }

  return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
};

export const getUrlResolutionBase = (baseUrl: string): string => {
  const parsedBaseUrl = parseUrlInput(baseUrl);

  if (parsedBaseUrl.isAbsoluteUrl) {
    return parsedBaseUrl.url.href;
  }

  return `${RELATIVE_URL_BASE}${parsedBaseUrl.url.pathname}${parsedBaseUrl.url.search}${parsedBaseUrl.url.hash}`;
};

export const serializeQueryParams = (
  params: Record<string, string>,
): string => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    searchParams.set(key, value);
  }

  return searchParams.toString();
};

export const applyQueryParams = (
  searchParams: URLSearchParams,
  params: Record<string, string | undefined>,
  { overwriteExisting = false }: { overwriteExisting?: boolean } = {},
): ApplyQueryParamsResult => {
  const addedParams: string[] = [];
  const skippedParams: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value.trim().length === 0) {
      continue;
    }

    if (!overwriteExisting && searchParams.has(key)) {
      skippedParams.push(key);
      continue;
    }

    searchParams.set(key, value);
    addedParams.push(key);
  }

  return { addedParams, skippedParams };
};
