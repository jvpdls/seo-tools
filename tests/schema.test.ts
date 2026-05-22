import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  buildAboutPageSchema,
  buildArticleSchema,
  buildContactPageSchema,
  buildFaqPageSchema,
  buildWebPageSchema,
  buildWebsiteSchema,
  SCHEMA_ORG_CONTEXT,
} from '../src/domains/schema/index.js';

const SITE = 'https://example.com';
const WEBSITE_ID = `${SITE}/#website`;

describe('buildWebsiteSchema', () => {
  test('builds minimal WebSite graph node', () => {
    const result = buildWebsiteSchema({
      id: WEBSITE_ID,
      url: `${SITE}/`,
      name: 'Example Site',
      description: 'Short site description.',
      publisher: { name: 'Jane Doe' },
    });

    assert.deepEqual(result, {
      '@context': SCHEMA_ORG_CONTEXT,
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: `${SITE}/`,
      name: 'Example Site',
      description: 'Short site description.',
      publisher: {
        '@type': 'Person',
        name: 'Jane Doe',
      },
    });
  });

  test('omits optional fields when not provided', () => {
    const result = buildWebsiteSchema({
      id: WEBSITE_ID,
      url: `${SITE}/`,
      name: 'Example Site',
    });

    assert.equal(result.description, undefined);
    assert.equal(result.publisher, undefined);
  });

  test('omits publisher when passed without any sub-property', () => {
    const result = buildWebsiteSchema({
      id: WEBSITE_ID,
      url: `${SITE}/`,
      name: 'Example Site',
      publisher: {},
    });

    assert.equal(result.publisher, undefined);
  });
});

describe('buildWebPageSchema', () => {
  test('builds WebPage linked to WebSite', () => {
    const pageUrl = `${SITE}/page/`;
    const result = buildWebPageSchema({
      id: `${pageUrl}#webpage`,
      url: pageUrl,
      name: 'Page title',
      websiteId: WEBSITE_ID,
      description: 'Page description.',
    });

    assert.deepEqual(result, {
      '@context': SCHEMA_ORG_CONTEXT,
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: 'Page title',
      description: 'Page description.',
      isPartOf: { '@id': WEBSITE_ID },
    });
  });

  test('omits isPartOf when websiteId is not provided', () => {
    const result = buildWebPageSchema({
      id: `${SITE}/page/#webpage`,
      url: `${SITE}/page/`,
      name: 'Page title',
    });

    assert.equal(result.isPartOf, undefined);
  });
});

describe('buildArticleSchema', () => {
  const postUrl = `${SITE}/blog/post/`;
  const baseOptions = {
    id: `${postUrl}#article`,
    pageId: `${postUrl}#webpage`,
    headline: 'Post title',
    image: `${SITE}/images/post.jpg`,
    datePublished: '2026-05-20T10:00:00-03:00',
    author: { name: 'Jane Doe', url: `${SITE}/about/` },
    publisher: { name: 'Example Site', logoUrl: `${SITE}/logo.png` },
  };

  test('builds Article with optional fields', () => {
    const result = buildArticleSchema({
      ...baseOptions,
      description: 'Post summary.',
      dateModified: '2026-05-21T10:00:00-03:00',
    });

    assert.deepEqual(result, {
      '@context': SCHEMA_ORG_CONTEXT,
      '@type': 'Article',
      '@id': baseOptions.id,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': baseOptions.pageId,
      },
      headline: 'Post title',
      description: 'Post summary.',
      image: `${SITE}/images/post.jpg`,
      datePublished: '2026-05-20T10:00:00-03:00',
      dateModified: '2026-05-21T10:00:00-03:00',
      author: {
        '@type': 'Person',
        name: 'Jane Doe',
        url: `${SITE}/about/`,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Example Site',
        logo: {
          '@type': 'ImageObject',
          url: `${SITE}/logo.png`,
        },
      },
    });
  });

  test('omits author and publisher when not provided', () => {
    const result = buildArticleSchema({
      id: baseOptions.id,
      pageId: baseOptions.pageId,
      headline: baseOptions.headline,
      image: baseOptions.image,
      datePublished: baseOptions.datePublished,
    });

    assert.equal(result.author, undefined);
    assert.equal(result.publisher, undefined);
  });

  test('omits author when passed without any sub-property', () => {
    const result = buildArticleSchema({
      ...baseOptions,
      author: {},
    });

    assert.equal(result.author, undefined);
    assert.notEqual(result.publisher, undefined);
  });

  test('supports partial publisher with logo only', () => {
    const result = buildArticleSchema({
      id: baseOptions.id,
      pageId: baseOptions.pageId,
      headline: baseOptions.headline,
      image: baseOptions.image,
      datePublished: baseOptions.datePublished,
      publisher: { logoUrl: `${SITE}/logo.png` },
    });

    assert.deepEqual(result.publisher, {
      '@type': 'Organization',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE}/logo.png`,
      },
    });
  });

  test('supports article subtypes', () => {
    const result = buildArticleSchema({
      ...baseOptions,
      articleType: 'BlogPosting',
    });

    assert.equal(result['@type'], 'BlogPosting');
  });

  test('supports multiple image URLs', () => {
    const images = [`${SITE}/1.jpg`, `${SITE}/2.jpg`];
    const result = buildArticleSchema({
      ...baseOptions,
      image: images,
    });

    assert.deepEqual(result.image, images);
  });
});

describe('buildFaqPageSchema', () => {
  test('builds FAQPage with required mainEntity', () => {
    const result = buildFaqPageSchema({
      id: `${SITE}/faq/#faq`,
      questions: [
        { name: 'First question?', answer: 'First answer.' },
        { name: 'Second question?', answer: 'Second answer.' },
      ],
    });

    assert.deepEqual(result, {
      '@context': SCHEMA_ORG_CONTEXT,
      '@type': 'FAQPage',
      '@id': `${SITE}/faq/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'First question?',
          acceptedAnswer: { '@type': 'Answer', text: 'First answer.' },
        },
        {
          '@type': 'Question',
          name: 'Second question?',
          acceptedAnswer: { '@type': 'Answer', text: 'Second answer.' },
        },
      ],
    });
  });

  test('omits @id when not provided', () => {
    const result = buildFaqPageSchema({
      questions: [{ name: 'Question?', answer: 'Answer.' }],
    });

    assert.equal(result['@id'], undefined);
  });
});

describe('buildAboutPageSchema', () => {
  test('omits about and isPartOf when not provided', () => {
    const aboutUrl = `${SITE}/about/`;
    const result = buildAboutPageSchema({
      id: `${aboutUrl}#webpage`,
      url: aboutUrl,
      name: 'About Example Site',
    });

    assert.equal(result.about, undefined);
    assert.equal(result.isPartOf, undefined);
  });

  test('builds AboutPage with Person subject', () => {
    const aboutUrl = `${SITE}/about/`;
    const result = buildAboutPageSchema({
      id: `${aboutUrl}#webpage`,
      url: aboutUrl,
      name: 'About Example Site',
      websiteId: WEBSITE_ID,
      description: 'About page description.',
      about: { name: 'Jane Doe', url: aboutUrl },
    });

    assert.deepEqual(result, {
      '@context': SCHEMA_ORG_CONTEXT,
      '@type': 'AboutPage',
      '@id': `${aboutUrl}#webpage`,
      url: aboutUrl,
      name: 'About Example Site',
      description: 'About page description.',
      isPartOf: { '@id': WEBSITE_ID },
      about: {
        '@type': 'Person',
        name: 'Jane Doe',
        url: aboutUrl,
      },
    });
  });

  test('supports about with a single sub-property', () => {
    const result = buildAboutPageSchema({
      id: `${SITE}/about/#webpage`,
      url: `${SITE}/about/`,
      name: 'About',
      about: { url: `${SITE}/about/` },
    });

    assert.deepEqual(result.about, {
      '@type': 'Person',
      url: `${SITE}/about/`,
    });
  });

  test('omits about when passed without any sub-property', () => {
    const result = buildAboutPageSchema({
      id: `${SITE}/about/#webpage`,
      url: `${SITE}/about/`,
      name: 'About',
      about: {},
    });

    assert.equal(result.about, undefined);
  });
});

describe('buildContactPageSchema', () => {
  test('omits about and isPartOf when not provided', () => {
    const contactUrl = `${SITE}/contact/`;
    const result = buildContactPageSchema({
      id: `${contactUrl}#webpage`,
      url: contactUrl,
      name: 'Contact',
    });

    assert.equal(result.about, undefined);
    assert.equal(result.isPartOf, undefined);
  });

  test('builds about with organization only', () => {
    const result = buildContactPageSchema({
      id: `${SITE}/contact/#webpage`,
      url: `${SITE}/contact/`,
      name: 'Contact',
      organization: { name: 'Example Site' },
    });

    assert.deepEqual(result.about, {
      '@type': 'Organization',
      name: 'Example Site',
    });
  });

  test('builds ContactPage with organization contact point', () => {
    const contactUrl = `${SITE}/contact/`;
    const result = buildContactPageSchema({
      id: `${contactUrl}#webpage`,
      url: contactUrl,
      name: 'Contact',
      websiteId: WEBSITE_ID,
      description: 'Contact page description.',
      organization: { name: 'Example Site', url: `${SITE}/` },
      contactPoint: {
        email: 'hello@example.com',
        contactType: 'customer support',
        availableLanguage: ['Portuguese'],
      },
    });

    assert.deepEqual(result, {
      '@context': SCHEMA_ORG_CONTEXT,
      '@type': 'ContactPage',
      '@id': `${contactUrl}#webpage`,
      url: contactUrl,
      name: 'Contact',
      description: 'Contact page description.',
      isPartOf: { '@id': WEBSITE_ID },
      about: {
        '@type': 'Organization',
        name: 'Example Site',
        url: `${SITE}/`,
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'hello@example.com',
          contactType: 'customer support',
          availableLanguage: ['Portuguese'],
        },
      },
    });
  });

  test('emits only provided contactPoint fields', () => {
    const result = buildContactPageSchema({
      id: `${SITE}/contact/#webpage`,
      url: `${SITE}/contact/`,
      name: 'Contact',
      contactPoint: { email: 'hello@example.com' },
    });

    assert.deepEqual(result.about?.contactPoint, {
      '@type': 'ContactPoint',
      email: 'hello@example.com',
    });
  });

  test('omits about when organization and contactPoint are empty objects', () => {
    const result = buildContactPageSchema({
      id: `${SITE}/contact/#webpage`,
      url: `${SITE}/contact/`,
      name: 'Contact',
      organization: {},
      contactPoint: {},
    });

    assert.equal(result.about, undefined);
  });
});
