import { SCHEMA_ORG_CONTEXT } from './constants.js';
import type { WebPageSchemaOptions, WebPageSchemaResult } from './types.js';

/**
 * Builds a minimal `WebPage` JSON-LD graph node.
 *
 * @param options - Page identity and optional link to a `WebSite`.
 * @returns JSON-LD object ready to inject or stringify.
 *
 * @example
 * buildWebPageSchema({
 *   id: 'https://example.com/page/#webpage',
 *   url: 'https://example.com/page/',
 *   name: 'Page title',
 *   websiteId: 'https://example.com/#website',
 * });
 */
export const buildWebPageSchema = ({
  id,
  url,
  name,
  websiteId,
  description,
}: WebPageSchemaOptions): WebPageSchemaResult => {
  const schema: WebPageSchemaResult = {
    '@context': SCHEMA_ORG_CONTEXT,
    '@type': 'WebPage',
    '@id': id,
    url,
    name,
  };

  if (description !== undefined) {
    schema.description = description;
  }

  if (websiteId !== undefined) {
    schema.isPartOf = {
      '@id': websiteId,
    };
  }

  return schema;
};
