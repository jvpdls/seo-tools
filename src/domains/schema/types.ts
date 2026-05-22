import type { SCHEMA_ORG_CONTEXT } from './constants.js';

/** JSON-LD document returned by schema builders (inject as object or stringify). */
export type JsonLdDocument<T extends Record<string, unknown> = Record<string, unknown>> = {
  '@context': typeof SCHEMA_ORG_CONTEXT;
} & T;

export type SchemaEntityType = 'Person' | 'Organization';

export type ArticleSchemaType =
  | 'Article'
  | 'BlogPosting'
  | 'NewsArticle'
  | 'TechArticle';

export type SchemaPublisherInput = {
  name?: string;
  type?: SchemaEntityType;
};

export type WebsiteSchemaOptions = {
  /** Canonical `@id` for the website entity (e.g. `https://example.com/#website`). */
  id: string;
  url: string;
  name: string;
  description?: string;
  publisher?: SchemaPublisherInput;
};

export type WebsiteSchemaResult = JsonLdDocument<{
  '@type': 'WebSite';
  '@id': string;
  url: string;
  name: string;
  description?: string;
  publisher?: {
    '@type': SchemaEntityType;
    name?: string;
  };
}>;

export type WebPageSchemaOptions = {
  id: string;
  url: string;
  name: string;
  /** `@id` of the parent `WebSite` (e.g. `https://example.com/#website`). */
  websiteId?: string;
  description?: string;
};

export type WebPageSchemaResult = JsonLdDocument<{
  '@type': 'WebPage';
  '@id': string;
  url: string;
  name: string;
  description?: string;
  isPartOf?: {
    '@id': string;
  };
}>;

export type ArticleSchemaAuthorInput = {
  name?: string;
  url?: string;
  type?: SchemaEntityType;
};

export type ArticleSchemaPublisherInput = {
  name?: string;
  logoUrl?: string;
  url?: string;
};

export type ArticleSchemaOptions = {
  id: string;
  /** `@id` of the page that hosts the article (e.g. `https://example.com/post/#webpage`). */
  pageId: string;
  headline: string;
  image: string | string[];
  datePublished: string;
  author?: ArticleSchemaAuthorInput;
  publisher?: ArticleSchemaPublisherInput;
  articleType?: ArticleSchemaType;
  description?: string;
  dateModified?: string;
};

export type ArticleSchemaAuthorResult = {
  '@type': SchemaEntityType;
  name?: string;
  url?: string;
};

export type ArticleSchemaPublisherResult = {
  '@type': 'Organization';
  name?: string;
  url?: string;
  logo?: {
    '@type': 'ImageObject';
    url: string;
  };
};

export type ArticleSchemaResult = JsonLdDocument<{
  '@type': ArticleSchemaType;
  '@id': string;
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
  headline: string;
  description?: string;
  image: string | string[];
  datePublished: string;
  dateModified?: string;
  author?: ArticleSchemaAuthorResult;
  publisher?: ArticleSchemaPublisherResult;
}>;

export type FaqPageQuestionInput = {
  name: string;
  answer: string;
};

export type FaqPageSchemaOptions = {
  id?: string;
  questions: FaqPageQuestionInput[];
};

export type FaqPageSchemaResult = JsonLdDocument<{
  '@type': 'FAQPage';
  '@id'?: string;
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}>;

export type AboutPageAboutInput = {
  name?: string;
  url?: string;
  type?: 'Person';
};

export type AboutPageSchemaOptions = {
  id: string;
  url: string;
  name: string;
  websiteId?: string;
  about?: AboutPageAboutInput;
  description?: string;
};

export type AboutPageAboutResult = {
  '@type': 'Person';
  name?: string;
  url?: string;
};

export type AboutPageSchemaResult = JsonLdDocument<{
  '@type': 'AboutPage';
  '@id': string;
  url: string;
  name: string;
  description?: string;
  isPartOf?: {
    '@id': string;
  };
  about?: AboutPageAboutResult;
}>;

export type ContactPageOrganizationInput = {
  name?: string;
  url?: string;
};

export type ContactPageContactPointInput = {
  email?: string;
  contactType?: string;
  availableLanguage?: string | string[];
};

export type ContactPageSchemaOptions = {
  id: string;
  url: string;
  name: string;
  websiteId?: string;
  organization?: ContactPageOrganizationInput;
  contactPoint?: ContactPageContactPointInput;
  description?: string;
};

export type ContactPageContactPointResult = {
  '@type': 'ContactPoint';
  contactType?: string;
  email?: string;
  availableLanguage?: string | string[];
};

export type ContactPageAboutResult = {
  '@type': 'Organization';
  name?: string;
  url?: string;
  contactPoint?: ContactPageContactPointResult;
};

export type ContactPageSchemaResult = JsonLdDocument<{
  '@type': 'ContactPage';
  '@id': string;
  url: string;
  name: string;
  description?: string;
  isPartOf?: {
    '@id': string;
  };
  about?: ContactPageAboutResult;
}>;
