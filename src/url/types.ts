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
