import {
  applyQueryParams,
  formatParsedUrl,
  parseUrlInput,
} from '../../utils/url.js';

import type { BuildUtmUrlOptions, BuildUtmUrlResult } from './types.js';

/**
 * Builds a campaign URL by appending UTM or custom query parameters.
 *
 * Existing parameters are preserved by default and can be overwritten with
 * `overwriteExisting: true`. Throws `TypeError` for empty or invalid URLs.
 *
 * @param options - UTM URL builder options.
 * @returns Built URL plus metadata about added and skipped params.
 *
 * @example
 * buildUtmUrl({
 *   url: 'https://example.com/landing',
 *   params: {
 *     utm_source: 'newsletter',
 *     utm_medium: 'email',
 *     utm_campaign: 'spring-sale',
 *   },
 * });
 */
export const buildUtmUrl = ({
  url,
  params,
  overwriteExisting = false,
}: BuildUtmUrlOptions): BuildUtmUrlResult => {
  const { originalUrl, isAbsoluteUrl, url: parsedUrl } = parseUrlInput(url);
  const { addedParams, skippedParams } = applyQueryParams(
    parsedUrl.searchParams,
    params,
    { overwriteExisting },
  );

  return {
    originalUrl,
    builtUrl: formatParsedUrl(parsedUrl, isAbsoluteUrl),
    addedParams,
    skippedParams,
  };
};
