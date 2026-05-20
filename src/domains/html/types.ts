export type CountLinksWarningCode = 'EMPTY_INPUT';

export type CleanHtmlWarningCode = 'EMPTY_INPUT' | 'MALFORMED_HTML';

export type CleanHtmlOptions = {
  html: string;
  removeClasses?: boolean;
  removeIds?: boolean;
  removeStyle?: boolean;
  removeDataAttributes?: boolean;
  removeAttributes?: string[];
  keepAttributes?: string[];
  collapseWhitespace?: boolean;
  removeEmptyTags?: boolean;
};

export type CleanHtmlResult = {
  html: string;
  warningCodes: CleanHtmlWarningCode[];
};

export type CountLinksOptions = {
  html: string;
  baseUrl?: string;
};

export type CountLinksResult = {
  total: number;
  internal: number;
  external: number;
  mailto: number;
  tel: number;
  nofollow: number;
  emptyAnchor: number;
  invalidHref: number;
  warningCodes: CountLinksWarningCode[];
};
