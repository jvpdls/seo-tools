export type QueryParamValue = string | string[];

export type NormalizeUrlOptions = {
  url: string;
  removeTrackingParams?: boolean;
  forceLowercaseHost?: boolean;
  forceLowercaseUrl?: boolean;
  removeHash?: boolean;
};

export type NormalizedUrlResult = {
  originalUrl: string;
  normalizedUrl: string;
  protocol: string | null;
  host: string | null;
  path: string;
  queryParams: Record<string, QueryParamValue>;
  removedParams: string[];
  urlLowercased: boolean;
  hashRemoved: boolean;
};

export type UtmParams = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term?: string;
  utm_content?: string;
  [key: string]: string | undefined;
};

export type BuildUtmUrlOptions = {
  url: string;
  params: UtmParams;
  overwriteExisting?: boolean;
};

export type BuildUtmUrlResult = {
  originalUrl: string;
  builtUrl: string;
  addedParams: string[];
  skippedParams: string[];
};
