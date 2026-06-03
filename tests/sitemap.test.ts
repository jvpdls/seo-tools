import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  analyzeSitemap,
  detectSitemapType,
  extractChildSitemaps,
  extractSitemapMetadata,
  extractSitemapUrls,
} from '../src/domains/sitemap/index.js';

describe('sitemap extraction', () => {
  const urlsetXml = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://example.com/</loc>
        <lastmod>2026-06-01</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>https://example.com/blog</loc>
        <priority>0.8</priority>
      </url>
    </urlset>
  `;

  const sitemapIndexXml = `
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <sitemap>
        <loc>https://example.com/sitemap-pages.xml</loc>
        <lastmod>2026-06-01</lastmod>
      </sitemap>
      <sitemap>
        <loc>https://example.com/sitemap-posts.xml</loc>
      </sitemap>
    </sitemapindex>
  `;

  test('detects sitemap root types', () => {
    assert.deepEqual(detectSitemapType({ xml: urlsetXml }), {
      type: 'urlset',
      warningCodes: [],
    });
    assert.deepEqual(detectSitemapType({ xml: sitemapIndexXml }), {
      type: 'sitemapindex',
      warningCodes: [],
    });
  });

  test('extracts sitemap URLs and metadata from urlset documents', () => {
    assert.deepEqual(extractSitemapUrls({ xml: urlsetXml }), {
      urls: ['https://example.com/', 'https://example.com/blog'],
      warningCodes: [],
    });
    assert.deepEqual(extractSitemapMetadata({ xml: urlsetXml }), {
      urls: [
        {
          loc: 'https://example.com/',
          lastmod: '2026-06-01',
          changefreq: 'weekly',
          priority: 1,
        },
        {
          loc: 'https://example.com/blog',
          lastmod: null,
          changefreq: null,
          priority: 0.8,
        },
      ],
      warningCodes: [],
    });
  });

  test('extracts child sitemap declarations from sitemap indexes', () => {
    assert.deepEqual(extractChildSitemaps({ xml: sitemapIndexXml }), {
      sitemaps: [
        {
          loc: 'https://example.com/sitemap-pages.xml',
          lastmod: '2026-06-01',
        },
        {
          loc: 'https://example.com/sitemap-posts.xml',
          lastmod: null,
        },
      ],
      warningCodes: [],
    });
  });
});

describe('analyzeSitemap', () => {
  test('flags duplicates, invalid URLs and invalid priorities', () => {
    const result = analyzeSitemap({
      xml: `
        <urlset>
          <url>
            <loc>https://example.com/</loc>
            <priority>1.2</priority>
          </url>
          <url>
            <loc>https://example.com/</loc>
          </url>
          <url>
            <loc>notaurl</loc>
          </url>
        </urlset>
      `,
    });

    assert.equal(result.type, 'urlset');
    assert.equal(result.totalUrls, 3);
    assert.deepEqual(result.duplicateUrls, ['https://example.com/']);
    assert.deepEqual(result.invalidUrls, ['notaurl']);
    assert.equal(result.invalidPriorityCount, 1);
    assert.deepEqual(result.warningCodes, [
      'DUPLICATE_URLS',
      'INVALID_URL',
      'INVALID_PRIORITY',
    ]);
  });
});
