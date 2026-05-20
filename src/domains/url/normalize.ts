import {
  formatParsedUrl,
  isTrackingParam,
  parseUrlInput,
} from '../../utils/url.js';

import type {
  NormalizedUrlResult,
  NormalizeUrlOptions,
  QueryParamValue,
} from './types.js';

const addUnique = (values: string[], value: string): void => {
  if (!values.includes(value)) {
    values.push(value);
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

/**
 * Normalizes absolute URLs or path-only inputs for technical SEO workflows.
 *
 * Supports tracking-param removal, host/url lowercasing, and hash removal.
 * Throws `TypeError` when input is empty or the URL cannot be parsed.
 *
 * @param options - URL normalization options.
 * @returns Normalized URL data and parsed URL parts.
 *
 * @example
 * normalizeUrl({
 *   url: 'HTTPS://Example.com/blog/?utm_source=google&id=1#Top',
 *   removeTrackingParams: true,
 *   forceLowercaseUrl: true,
 *   removeHash: true,
 * });
 */
export const normalizeUrl = ({
  url,
  removeTrackingParams = false,
  forceLowercaseHost = false,
  forceLowercaseUrl = false,
  removeHash = false,
}: NormalizeUrlOptions): NormalizedUrlResult => {
  const { originalUrl, isAbsoluteUrl, url: parsedUrl } = parseUrlInput(url);
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
    normalizedUrl: formatParsedUrl(parsedUrl, isAbsoluteUrl),
    protocol: isAbsoluteUrl ? parsedUrl.protocol.replace(/:$/, '') : null,
    host: isAbsoluteUrl ? parsedUrl.host : null,
    path: parsedUrl.pathname,
    queryParams: collectQueryParams(parsedUrl.searchParams),
    removedParams,
    urlLowercased: forceLowercaseUrl,
    hashRemoved,
  };
};
