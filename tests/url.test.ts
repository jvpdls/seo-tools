import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { normalizeUrl } from '../src/index.js';

describe('normalizeUrl', () => {
  test('normalizes an absolute URL and removes tracking params and hash', () => {
    const result = normalizeUrl({
      url: 'HTTPS://Example.com/blog/Test-Post/?utm_source=google&utm_medium=cpc&id=123#section',
      removeTrackingParams: true,
      forceLowercaseHost: true,
      forceLowercaseUrl: true,
      removeHash: true,
    });

    assert.deepEqual(result, {
      originalUrl:
        'HTTPS://Example.com/blog/Test-Post/?utm_source=google&utm_medium=cpc&id=123#section',
      normalizedUrl: 'https://example.com/blog/test-post/?id=123',
      protocol: 'https',
      host: 'example.com',
      path: '/blog/test-post/',
      queryParams: {
        id: '123',
      },
      removedParams: ['utm_source', 'utm_medium'],
      urlLowercased: true,
      hashRemoved: true,
    });
  });

  test('normalizes a path without adding a synthetic host to the output', () => {
    const result = normalizeUrl({
      url: '/Blog/Test-Post/?utm_campaign=launch&id=123#Top',
      removeTrackingParams: true,
      forceLowercaseUrl: true,
      removeHash: false,
    });

    assert.deepEqual(result, {
      originalUrl: '/Blog/Test-Post/?utm_campaign=launch&id=123#Top',
      normalizedUrl: '/blog/test-post/?id=123#top',
      protocol: null,
      host: null,
      path: '/blog/test-post/',
      queryParams: {
        id: '123',
      },
      removedParams: ['utm_campaign'],
      urlLowercased: true,
      hashRemoved: false,
    });
  });

  test('preserves non-tracking query params and repeated values', () => {
    const result = normalizeUrl({
      url: 'https://example.com/products?tag=SEO&tag=Content&utm_term=ads&page=2',
      removeTrackingParams: true,
    });

    assert.equal(
      result.normalizedUrl,
      'https://example.com/products?tag=SEO&tag=Content&page=2',
    );
    assert.deepEqual(result.queryParams, {
      tag: ['SEO', 'Content'],
      page: '2',
    });
    assert.deepEqual(result.removedParams, ['utm_term']);
  });

  test('lowercases only the host when forceLowercaseHost is enabled', () => {
    const result = normalizeUrl({
      url: 'https://Example.com/Blog/Post?Name=Joao#Section',
      forceLowercaseHost: true,
    });

    assert.equal(
      result.normalizedUrl,
      'https://example.com/Blog/Post?Name=Joao#Section',
    );
    assert.equal(result.host, 'example.com');
    assert.equal(result.path, '/Blog/Post');
    assert.deepEqual(result.queryParams, {
      Name: 'Joao',
    });
    assert.equal(result.urlLowercased, false);
  });

  test('lowercases query params and hash when forceLowercaseUrl is enabled', () => {
    const result = normalizeUrl({
      url: 'https://Example.com/Blog/Post?Name=Joao#Section',
      forceLowercaseUrl: true,
    });

    assert.equal(
      result.normalizedUrl,
      'https://example.com/blog/post?name=joao#section',
    );
    assert.deepEqual(result.queryParams, {
      name: 'joao',
    });
  });

  test('keeps hashRemoved false when removeHash is enabled but there is no hash', () => {
    const result = normalizeUrl({
      url: 'https://example.com/blog/post',
      removeHash: true,
    });

    assert.equal(result.normalizedUrl, 'https://example.com/blog/post');
    assert.equal(result.hashRemoved, false);
  });

  test('throws a TypeError for empty input', () => {
    assert.throws(
      () =>
        normalizeUrl({
          url: '   ',
        }),
      {
        name: 'TypeError',
        message: 'URL must not be empty.',
      },
    );
  });

  test('throws a TypeError for invalid absolute URLs', () => {
    assert.throws(
      () =>
        normalizeUrl({
          url: 'https://',
        }),
      {
        name: 'TypeError',
        message: 'URL is invalid.',
      },
    );
  });
});
