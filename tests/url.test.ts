import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { buildUtmUrl, normalizeUrl } from '../src/index.js';

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

  test('removes extended tracking params and wildcard prefixes', () => {
    const trackingParams = [
      'fbclid',
      'gclid',
      'gclsrc',
      'utm_custom',
      '_ga',
      'mc_cid',
      'mc_eid',
      '_bta_tid',
      '_bta_c',
      'trk_contact',
      'gdfms',
      'gdftrk',
      'gdffi',
      '_ke',
      'sb_referer_host',
      'mkwid',
      'pcrid',
      'ef_id',
      's_kwcid',
      'msclkid',
      'dm_i',
      'epik',
      'pk_campaign',
      'piwik_campaign',
      'mtm_campaign',
      'matomo_campaign',
      'hsa_cam',
      '_branch_match_id',
      'mkevt',
      'mkcid',
      'mkrid',
      'campid',
      'toolid',
      'customid',
      'igshid',
      'si',
      'sms_source',
      'WT.mc_id',
      'WT.nav',
      'campaign_id',
      'hootPostID',
      'wprov',
      '__s',
    ];
    const query = new URLSearchParams([
      ...trackingParams.map((paramName) => [paramName, 'tracking']),
      ['id', '123'],
    ]);
    const result = normalizeUrl({
      url: `https://example.com/products?${query.toString()}`,
      removeTrackingParams: true,
    });

    assert.equal(result.normalizedUrl, 'https://example.com/products?id=123');
    assert.deepEqual(result.queryParams, {
      id: '123',
    });
    assert.deepEqual(result.removedParams, trackingParams);
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

describe('buildUtmUrl', () => {
  const baseParams = {
    utm_source: 'newsletter',
    utm_medium: 'email',
    utm_campaign: 'spring_sale',
  };

  test('appends UTM params to an absolute URL', () => {
    const result = buildUtmUrl({
      url: 'https://example.com/landing',
      params: {
        ...baseParams,
        utm_term: 'shoes',
        utm_content: 'cta_top',
      },
    });

    const built = new URL(result.builtUrl);

    assert.equal(result.originalUrl, 'https://example.com/landing');
    assert.equal(built.origin, 'https://example.com');
    assert.equal(built.pathname, '/landing');
    assert.equal(built.searchParams.get('utm_source'), 'newsletter');
    assert.equal(built.searchParams.get('utm_medium'), 'email');
    assert.equal(built.searchParams.get('utm_campaign'), 'spring_sale');
    assert.equal(built.searchParams.get('utm_term'), 'shoes');
    assert.equal(built.searchParams.get('utm_content'), 'cta_top');
    assert.deepEqual(result.addedParams, [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
    ]);
    assert.deepEqual(result.skippedParams, []);
  });

  test('appends UTM params to a path-only URL without a synthetic host', () => {
    const result = buildUtmUrl({
      url: '/products/widget',
      params: baseParams,
    });

    assert.equal(
      result.builtUrl,
      '/products/widget?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale',
    );
    assert.deepEqual(result.addedParams, [
      'utm_source',
      'utm_medium',
      'utm_campaign',
    ]);
  });

  test('merges with existing query params without overwriting by default', () => {
    const result = buildUtmUrl({
      url: 'https://example.com/page?id=42&utm_source=existing',
      params: {
        ...baseParams,
        custom_ref: 'partner_a',
      },
    });

    const built = new URL(result.builtUrl);

    assert.equal(built.searchParams.get('id'), '42');
    assert.equal(built.searchParams.get('utm_source'), 'existing');
    assert.equal(built.searchParams.get('utm_medium'), 'email');
    assert.equal(built.searchParams.get('utm_campaign'), 'spring_sale');
    assert.equal(built.searchParams.get('custom_ref'), 'partner_a');
    assert.deepEqual(result.skippedParams, ['utm_source']);
    assert.ok(result.addedParams.includes('utm_medium'));
    assert.ok(result.addedParams.includes('utm_campaign'));
    assert.ok(result.addedParams.includes('custom_ref'));
  });

  test('overwrites existing params when overwriteExisting is enabled', () => {
    const result = buildUtmUrl({
      url: 'https://example.com/page?utm_source=old&utm_medium=old',
      params: baseParams,
      overwriteExisting: true,
    });

    const built = new URL(result.builtUrl);

    assert.equal(built.searchParams.get('utm_source'), 'newsletter');
    assert.equal(built.searchParams.get('utm_medium'), 'email');
    assert.equal(built.searchParams.get('utm_campaign'), 'spring_sale');
    assert.deepEqual(result.skippedParams, []);
    assert.deepEqual(result.addedParams, [
      'utm_source',
      'utm_medium',
      'utm_campaign',
    ]);
  });

  test('encodes special characters in param values', () => {
    const result = buildUtmUrl({
      url: 'https://example.com/',
      params: {
        ...baseParams,
        utm_content: 'hero banner & cta',
      },
    });

    assert.equal(
      result.builtUrl,
      'https://example.com/?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale&utm_content=hero+banner+%26+cta',
    );
  });

  test('skips undefined and blank param values', () => {
    const result = buildUtmUrl({
      url: 'https://example.com/',
      params: {
        ...baseParams,
        utm_term: undefined,
        utm_content: '   ',
        custom_key: '',
      },
    });

    const built = new URL(result.builtUrl);

    assert.equal(built.searchParams.has('utm_term'), false);
    assert.equal(built.searchParams.has('utm_content'), false);
    assert.equal(built.searchParams.has('custom_key'), false);
    assert.deepEqual(result.addedParams, [
      'utm_source',
      'utm_medium',
      'utm_campaign',
    ]);
  });

  test('preserves hash on the built URL', () => {
    const result = buildUtmUrl({
      url: 'https://example.com/page#pricing',
      params: baseParams,
    });

    assert.equal(
      result.builtUrl,
      'https://example.com/page?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale#pricing',
    );
  });

  test('throws a TypeError for empty input', () => {
    assert.throws(
      () =>
        buildUtmUrl({
          url: '   ',
          params: baseParams,
        }),
      {
        name: 'TypeError',
        message: 'URL must not be empty.',
      },
    );
  });

  test('throws a TypeError for invalid URLs', () => {
    assert.throws(
      () =>
        buildUtmUrl({
          url: 'https://',
          params: baseParams,
        }),
      {
        name: 'TypeError',
        message: 'URL is invalid.',
      },
    );
  });
});
