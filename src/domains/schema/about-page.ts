import { SCHEMA_ORG_CONTEXT } from './constants.js';
import type { AboutPageSchemaOptions, AboutPageSchemaResult } from './types.js';
import { hasDefinedValue } from '../../utils/schema.js';

/**
 * Builds a minimal `AboutPage` JSON-LD graph node.
 *
 * @param options - Page identity and optional subject person / site link.
 * @returns JSON-LD object ready to inject or stringify.
 *
 * @example
 * buildAboutPageSchema({
 *   id: 'https://example.com/about/#webpage',
 *   url: 'https://example.com/about/',
 *   name: 'About Example Site',
 *   websiteId: 'https://example.com/#website',
 *   about: { name: 'Jane Doe', url: 'https://example.com/about/' },
 * });
 */
export const buildAboutPageSchema = ({
  id,
  url,
  name,
  websiteId,
  about,
  description,
}: AboutPageSchemaOptions): AboutPageSchemaResult => {
  const schema: AboutPageSchemaResult = {
    '@context': SCHEMA_ORG_CONTEXT,
    '@type': 'AboutPage',
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

  if (
    about !== undefined &&
    hasDefinedValue({
      name: about.name,
      url: about.url,
      type: about.type,
    })
  ) {
    schema.about = {
      '@type': 'Person',
    };

    if (about.name !== undefined) {
      schema.about.name = about.name;
    }

    if (about.url !== undefined) {
      schema.about.url = about.url;
    }
  }

  return schema;
};
