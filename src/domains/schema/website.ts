import { SCHEMA_ORG_CONTEXT } from './constants.js';
import type { WebsiteSchemaOptions, WebsiteSchemaResult } from './types.js';
import { hasDefinedValue } from '../../utils/schema.js';

/**
 * Builds a minimal `WebSite` JSON-LD graph node.
 *
 * @param options - Website identity and optional publisher.
 * @returns JSON-LD object ready to inject or stringify.
 *
 * @example
 * buildWebsiteSchema({
 *   id: 'https://example.com/#website',
 *   url: 'https://example.com/',
 *   name: 'Example Site',
 *   publisher: { name: 'Jane Doe' },
 * });
 */
export const buildWebsiteSchema = ({
  id,
  url,
  name,
  description,
  publisher,
}: WebsiteSchemaOptions): WebsiteSchemaResult => {
  const schema: WebsiteSchemaResult = {
    '@context': SCHEMA_ORG_CONTEXT,
    '@type': 'WebSite',
    '@id': id,
    url,
    name,
  };

  if (description !== undefined) {
    schema.description = description;
  }

  if (
    publisher !== undefined &&
    hasDefinedValue({
      name: publisher.name,
      type: publisher.type,
    })
  ) {
    schema.publisher = {
      '@type': publisher.type ?? 'Person',
    };

    if (publisher.name !== undefined) {
      schema.publisher.name = publisher.name;
    }
  }

  return schema;
};
