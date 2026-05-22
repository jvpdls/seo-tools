import { SCHEMA_ORG_CONTEXT } from './constants.js';
import type {
  ContactPageAboutResult,
  ContactPageContactPointResult,
  ContactPageSchemaOptions,
  ContactPageSchemaResult,
} from './types.js';
import { hasDefinedValue } from '../../utils/schema.js';

const buildContactPoint = (
  contactPoint: NonNullable<ContactPageSchemaOptions['contactPoint']>,
): ContactPageContactPointResult | undefined => {
  if (
    !hasDefinedValue({
      email: contactPoint.email,
      contactType: contactPoint.contactType,
      availableLanguage: contactPoint.availableLanguage,
    })
  ) {
    return undefined;
  }

  const result: ContactPageContactPointResult = {
    '@type': 'ContactPoint',
  };

  if (contactPoint.email !== undefined) {
    result.email = contactPoint.email;
  }

  if (contactPoint.contactType !== undefined) {
    result.contactType = contactPoint.contactType;
  }

  if (contactPoint.availableLanguage !== undefined) {
    result.availableLanguage = contactPoint.availableLanguage;
  }

  return result;
};

const buildAbout = (
  organization: ContactPageSchemaOptions['organization'],
  contactPoint: ContactPageSchemaOptions['contactPoint'],
): ContactPageAboutResult | undefined => {
  const about: ContactPageAboutResult = {
    '@type': 'Organization',
  };
  let hasContent = false;

  if (
    organization !== undefined &&
    hasDefinedValue({
      name: organization.name,
      url: organization.url,
    })
  ) {
    if (organization.name !== undefined) {
      about.name = organization.name;
      hasContent = true;
    }

    if (organization.url !== undefined) {
      about.url = organization.url;
      hasContent = true;
    }
  }

  if (contactPoint !== undefined) {
    const builtContactPoint = buildContactPoint(contactPoint);

    if (builtContactPoint !== undefined) {
      about.contactPoint = builtContactPoint;
      hasContent = true;
    }
  }

  return hasContent ? about : undefined;
};

/**
 * Builds a minimal `ContactPage` JSON-LD graph node.
 *
 * @param options - Page identity and optional organization / contact point.
 * @returns JSON-LD object ready to inject or stringify.
 *
 * @example
 * buildContactPageSchema({
 *   id: 'https://example.com/contact/#webpage',
 *   url: 'https://example.com/contact/',
 *   name: 'Contact',
 *   websiteId: 'https://example.com/#website',
 *   organization: { name: 'Example Site', url: 'https://example.com/' },
 *   contactPoint: { email: 'hello@example.com' },
 * });
 */
export const buildContactPageSchema = ({
  id,
  url,
  name,
  websiteId,
  organization,
  contactPoint,
  description,
}: ContactPageSchemaOptions): ContactPageSchemaResult => {
  const schema: ContactPageSchemaResult = {
    '@context': SCHEMA_ORG_CONTEXT,
    '@type': 'ContactPage',
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

  const about = buildAbout(organization, contactPoint);

  if (about !== undefined) {
    schema.about = about;
  }

  return schema;
};
