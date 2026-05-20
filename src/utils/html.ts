import {
  HEADING_TAG_PATTERN,
  HTML_ENTITY_PATTERN,
  HTML_TAG_PATTERN,
  NAMED_HTML_ENTITIES,
} from '../constants/html.js';

import { normalizeWhitespace } from './text.js';

const HTML_ATTRIBUTE_PATTERN =
  /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/gi;

type HtmlTagMatch = {
  tagName: string;
  attributes: string;
  content: string;
  fullMatch: string;
  index: number;
};

type HeadingTagMatch = HtmlTagMatch & {
  level: 1 | 2 | 3 | 4 | 5 | 6;
};

type HtmlAttribute = {
  name: string;
  value?: string;
};

type FilterHtmlAttributesOptions = {
  removeClasses?: boolean;
  removeIds?: boolean;
  removeStyle?: boolean;
  removeDataAttributes?: boolean;
  removeAttributes?: string[];
  keepAttributes?: string[];
};

const normalizeAttributeName = (attributeName: string): string => {
  return attributeName.trim().toLowerCase();
};

const decodeHtmlEntity = (entity: string): string => {
  const normalizedEntity = entity.toLowerCase();

  if (normalizedEntity.startsWith('#x')) {
    const codePoint = Number.parseInt(normalizedEntity.slice(2), 16);

    return Number.isNaN(codePoint) ? `&${entity};` : String.fromCodePoint(codePoint);
  }

  if (normalizedEntity.startsWith('#')) {
    const codePoint = Number.parseInt(normalizedEntity.slice(1), 10);

    return Number.isNaN(codePoint) ? `&${entity};` : String.fromCodePoint(codePoint);
  }

  return NAMED_HTML_ENTITIES[normalizedEntity] ?? `&${entity};`;
};

export const decodeHtmlEntities = (text: string): string => {
  return text.replace(HTML_ENTITY_PATTERN, (_match, entity: string) =>
    decodeHtmlEntity(entity),
  );
};

export const stripHtmlTags = (text: string): string => {
  return text.replace(HTML_TAG_PATTERN, ' ');
};

export const getPlainTextFromHtml = (html: string): string => {
  return normalizeWhitespace(decodeHtmlEntities(stripHtmlTags(html)));
};

export const parseHtmlAttributes = (attributeString: string): HtmlAttribute[] => {
  const attributes: HtmlAttribute[] = [];
  const pattern = new RegExp(
    HTML_ATTRIBUTE_PATTERN.source,
    HTML_ATTRIBUTE_PATTERN.flags,
  );

  for (const match of attributeString.matchAll(pattern)) {
    const name = match[1];

    if (name === undefined) {
      continue;
    }

    const rawValue = match[2] ?? match[3] ?? match[4];

    attributes.push(
      rawValue === undefined
        ? { name }
        : { name, value: decodeHtmlEntities(rawValue) },
    );
  }

  return attributes;
};

export const serializeHtmlAttributes = (attributes: HtmlAttribute[]): string => {
  return attributes
    .map((attribute) =>
      attribute.value === undefined
        ? attribute.name
        : `${attribute.name}="${attribute.value}"`,
    )
    .join(' ');
};

export const filterHtmlAttributes = (
  attributes: HtmlAttribute[],
  options: FilterHtmlAttributesOptions,
): HtmlAttribute[] => {
  const keepAttributeNames =
    options.keepAttributes === undefined
      ? undefined
      : new Set(
          options.keepAttributes.map((attributeName) =>
            normalizeAttributeName(attributeName),
          ),
        );

  const removeAttributeNames = new Set(
    (options.removeAttributes ?? []).map((attributeName) =>
      normalizeAttributeName(attributeName),
    ),
  );

  return attributes.filter((attribute) => {
    const normalizedName = normalizeAttributeName(attribute.name);

    if (keepAttributeNames !== undefined && keepAttributeNames.size > 0) {
      return keepAttributeNames.has(normalizedName);
    }

    if (options.removeClasses && normalizedName === 'class') {
      return false;
    }

    if (options.removeIds && normalizedName === 'id') {
      return false;
    }

    if (options.removeStyle && normalizedName === 'style') {
      return false;
    }

    if (options.removeDataAttributes && normalizedName.startsWith('data-')) {
      return false;
    }

    if (removeAttributeNames.has(normalizedName)) {
      return false;
    }

    return true;
  });
};

const createTagPattern = (tagName: string): RegExp => {
  const escapedTagName = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return new RegExp(
    `<${escapedTagName}\\b([^>]*)>([\\s\\S]*?)<\\/${escapedTagName}>`,
    'gi',
  );
};

export function* matchHtmlTags(html: string, tagName: string): Generator<HtmlTagMatch> {
  const pattern = createTagPattern(tagName);
  const normalizedTagName = tagName.toLowerCase();

  for (const match of html.matchAll(pattern)) {
    yield {
      tagName: normalizedTagName,
      attributes: match[1] ?? '',
      content: match[2] ?? '',
      fullMatch: match[0],
      index: match.index ?? 0,
    };
  }
}

export function* matchHeadingTags(html: string): Generator<HeadingTagMatch> {
  for (const match of html.matchAll(HEADING_TAG_PATTERN)) {
    const level = Number(match[1]) as HeadingTagMatch['level'];

    yield {
      tagName: `h${level}`,
      level,
      attributes: match[2] ?? '',
      content: match[3] ?? '',
      fullMatch: match[0],
      index: match.index ?? 0,
    };
  }
}
