import { SCHEMA_ORG_CONTEXT } from './constants.js';
import type { ArticleSchemaOptions, ArticleSchemaResult } from './types.js';
import { hasDefinedValue } from '../../utils/schema.js';

/**
 * Builds a minimal `Article` (or subtype) JSON-LD graph node.
 *
 * Supports `Article`, `BlogPosting`, `NewsArticle`, and `TechArticle`.
 *
 * @param options - Article content and optional linked entities.
 * @returns JSON-LD object ready to inject or stringify.
 *
 * @example
 * buildArticleSchema({
 *   id: 'https://example.com/blog/post/#article',
 *   pageId: 'https://example.com/blog/post/#webpage',
 *   headline: 'Post title',
 *   image: 'https://example.com/images/post.jpg',
 *   datePublished: '2026-05-20T10:00:00-03:00',
 *   author: { name: 'Jane Doe', url: 'https://example.com/about/' },
 *   publisher: { name: 'Example Site', logoUrl: 'https://example.com/logo.png' },
 *   articleType: 'BlogPosting',
 * });
 */
export const buildArticleSchema = ({
  id,
  pageId,
  headline,
  image,
  datePublished,
  author,
  publisher,
  articleType = 'Article',
  description,
  dateModified,
}: ArticleSchemaOptions): ArticleSchemaResult => {
  const schema: ArticleSchemaResult = {
    '@context': SCHEMA_ORG_CONTEXT,
    '@type': articleType,
    '@id': id,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageId,
    },
    headline,
    image,
    datePublished,
  };

  if (description !== undefined) {
    schema.description = description;
  }

  if (dateModified !== undefined) {
    schema.dateModified = dateModified;
  }

  if (
    author !== undefined &&
    hasDefinedValue({
      name: author.name,
      url: author.url,
      type: author.type,
    })
  ) {
    schema.author = {
      '@type': author.type ?? 'Person',
    };

    if (author.name !== undefined) {
      schema.author.name = author.name;
    }

    if (author.url !== undefined) {
      schema.author.url = author.url;
    }
  }

  if (
    publisher !== undefined &&
    hasDefinedValue({
      name: publisher.name,
      url: publisher.url,
      logoUrl: publisher.logoUrl,
    })
  ) {
    schema.publisher = {
      '@type': 'Organization',
    };

    if (publisher.name !== undefined) {
      schema.publisher.name = publisher.name;
    }

    if (publisher.url !== undefined) {
      schema.publisher.url = publisher.url;
    }

    if (publisher.logoUrl !== undefined) {
      schema.publisher.logo = {
        '@type': 'ImageObject',
        url: publisher.logoUrl,
      };
    }
  }

  return schema;
};
