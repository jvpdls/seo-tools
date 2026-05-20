export const HTML_TAG_PATTERN = /<[^>]*>/g;

export const HTML_ENTITY_PATTERN = /&(#x[\da-f]+|#\d+|[a-z]+);/gi;

export const HEADING_TAG_PATTERN = /<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;

export const HTML_TAG_TOKEN_PATTERN =
  /<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g;

export const NAMED_HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
};
