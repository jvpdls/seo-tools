import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  analyzeMetaTags,
  extractCanonical,
  extractMetaRobots,
  extractMetaTags,
} from '../src/domains/meta/index.js';

describe('extractMetaTags', () => {
  test('returns EMPTY_INPUT for blank html', () => {
    const result = extractMetaTags({ html: '   ' });

    assert.deepEqual(result, {
      metaTags: [],
      warningCodes: ['EMPTY_INPUT'],
    });
  });

  test('extracts meta tags from name, property, http-equiv and charset attributes', () => {
    const result = extractMetaTags({
      html: `
        <meta name="description" content="Useful summary" />
        <meta property="og:title" content="Landing Page" />
        <meta http-equiv="refresh" content="60" />
        <meta charset="utf-8" />
      `,
    });

    assert.deepEqual(result.metaTags, [
      {
        attribute: 'name',
        key: 'description',
        content: 'Useful summary',
        index: result.metaTags[0]?.index ?? 0,
      },
      {
        attribute: 'property',
        key: 'og:title',
        content: 'Landing Page',
        index: result.metaTags[1]?.index ?? 0,
      },
      {
        attribute: 'http-equiv',
        key: 'refresh',
        content: '60',
        index: result.metaTags[2]?.index ?? 0,
      },
      {
        attribute: 'charset',
        key: 'charset',
        content: 'utf-8',
        index: result.metaTags[3]?.index ?? 0,
      },
    ]);
    assert.deepEqual(result.warningCodes, []);
  });
});

describe('extractCanonical', () => {
  test('extracts canonical link and warns about duplicates', () => {
    const result = extractCanonical({
      html: `
        <link rel="canonical" href="https://example.com/a" />
        <link rel="alternate canonical" href="https://example.com/b" />
      `,
    });

    assert.equal(result.canonicalUrl, 'https://example.com/a');
    assert.equal(result.occurrences, 2);
    assert.deepEqual(result.warningCodes, ['MULTIPLE_CANONICAL']);
  });
});

describe('extractMetaRobots', () => {
  test('parses robots directives from the first robots tag', () => {
    const result = extractMetaRobots({
      html: '<meta name="robots" content="noindex, nofollow, max-image-preview:large" />',
    });

    assert.equal(result.content, 'noindex, nofollow, max-image-preview:large');
    assert.deepEqual(result.directives, [
      'noindex',
      'nofollow',
      'max-image-preview:large',
    ]);
    assert.equal(result.occurrences, 1);
    assert.deepEqual(result.warningCodes, []);
  });
});

describe('analyzeMetaTags', () => {
  test('aggregates title, description, canonical, robots and social tags', () => {
    const result = analyzeMetaTags({
      html: `
        <html>
          <head>
            <title>Technical audit page</title>
            <meta name="description" content="Page summary for audits." />
            <meta name="robots" content="index, follow" />
            <meta property="og:title" content="OG Title" />
            <meta name="twitter:card" content="summary_large_image" />
            <link rel="canonical" href="https://example.com/audit" />
          </head>
        </html>
      `,
    });

    assert.equal(result.title, 'Technical audit page');
    assert.equal(result.titleCount, 1);
    assert.equal(result.metaDescription, 'Page summary for audits.');
    assert.equal(result.canonicalUrl, 'https://example.com/audit');
    assert.deepEqual(result.robotsDirectives, ['index', 'follow']);
    assert.deepEqual(result.openGraph, { 'og:title': 'OG Title' });
    assert.deepEqual(result.twitter, { 'twitter:card': 'summary_large_image' });
    assert.deepEqual(result.warningCodes, []);
  });

  test('warns when core tags are missing or duplicated', () => {
    const result = analyzeMetaTags({
      html: `
        <title>One</title>
        <title>Two</title>
        <meta name="description" content="First" />
        <meta name="description" content="Second" />
      `,
    });

    assert.deepEqual(result.warningCodes, [
      'MULTIPLE_TITLES',
      'MULTIPLE_META_DESCRIPTIONS',
      'MISSING_CANONICAL',
      'MISSING_META_ROBOTS',
    ]);
  });
});
