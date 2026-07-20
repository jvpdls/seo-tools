import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  analyzeImageAlts,
  analyzeImageDimensions,
  analyzeImageLoading,
  analyzeImages,
  extractImages,
} from '../src/domains/images/index.js';

describe('extractImages', () => {
  test('returns EMPTY_INPUT for blank html', () => {
    const result = extractImages({ html: ' ' });

    assert.deepEqual(result, {
      images: [],
      warningCodes: ['EMPTY_INPUT'],
    });
  });

  test('extracts key img attributes into a typed list', () => {
    const result = extractImages({
      html: `
        <img
          src="/hero.jpg"
          alt="Hero banner"
          width="1200"
          height="630"
          loading="lazy"
          decoding="async"
          title="Homepage hero"
          srcset="/hero-600.jpg 600w, /hero-1200.jpg 1200w"
          sizes="100vw"
        />
      `,
    });

    assert.deepEqual(result.images, [
      {
        src: '/hero.jpg',
        originalSrc: '/hero.jpg',
        framework: null,
        optimizer: null,
        alt: 'Hero banner',
        width: 1200,
        height: 630,
        fill: false,
        loading: 'lazy',
        fetchPriority: null,
        decoding: 'async',
        title: 'Homepage hero',
        srcset: '/hero-600.jpg 600w, /hero-1200.jpg 1200w',
        sizes: '100vw',
        index: result.images[0]?.index ?? 0,
      },
    ]);
  });

  test('recovers original sources from Next.js optimized image URLs', () => {
    const result = extractImages({
      html: `
        <img
          src="/_next/image?url=https%3A%2F%2Fcdn.example.com%2Fhero.jpg%3Fv%3D2&amp;w=1200&amp;q=75"
          srcset="/_next/image?url=https%3A%2F%2Fcdn.example.com%2Fhero.jpg%3Fv%3D2&amp;w=640&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fcdn.example.com%2Fhero.jpg%3Fv%3D2&amp;w=1200&amp;q=75 2x"
          alt="Optimized hero"
          width="600"
          height="315"
          loading="lazy"
          decoding="async"
          data-nimg="1"
        />
      `,
    });

    assert.equal(
      result.images[0]?.src,
      '/_next/image?url=https%3A%2F%2Fcdn.example.com%2Fhero.jpg%3Fv%3D2&w=1200&q=75',
    );
    assert.equal(
      result.images[0]?.originalSrc,
      'https://cdn.example.com/hero.jpg?v=2',
    );
    assert.equal(result.images[0]?.optimizer, 'next');
    assert.equal(result.images[0]?.framework, 'next');
  });

  test('recovers a Next.js source from srcset when overrideSrc is used', () => {
    const result = extractImages({
      html: `
        <img
          src="/seo-friendly-hero.jpg"
          srcset="/_next/image?url=%2Fhero.jpg&amp;w=640&amp;q=75 1x, /_next/image?url=%2Fhero.jpg&amp;w=1200&amp;q=75 2x"
          alt="Hero"
          width="600"
          height="315"
          data-nimg="1"
        />
      `,
    });

    assert.equal(result.images[0]?.src, '/seo-friendly-hero.jpg');
    assert.equal(result.images[0]?.originalSrc, '/hero.jpg');
    assert.equal(result.images[0]?.optimizer, 'next');
  });

  test('does not unwrap unrelated URLs that happen to use a url parameter', () => {
    const result = extractImages({
      html: '<img src="/redirect?url=%2Fhero.jpg&w=1200" alt="Hero" />',
    });

    assert.equal(
      result.images[0]?.originalSrc,
      '/redirect?url=%2Fhero.jpg&w=1200',
    );
    assert.equal(result.images[0]?.optimizer, null);
  });
});

describe('image analyzers', () => {
  const html = `
    <img src="/a.jpg" alt="Team photo" width="800" height="600" loading="lazy" />
    <img src="/b.jpg" width="400" height="0" loading="eager" />
    <img src="/c.jpg" alt="" loading="lazy" />
    <img src="/d.jpg" alt="Team photo" width="320" height="240" />
  `;

  test('flags missing, empty and duplicate alt attributes', () => {
    const result = analyzeImageAlts({ html });

    assert.deepEqual(result, {
      total: 4,
      missingAlt: 1,
      emptyAlt: 1,
      duplicateAlt: 1,
      warningCodes: ['MISSING_ALT', 'EMPTY_ALT', 'DUPLICATE_ALT'],
    });
  });

  test('flags missing and invalid image dimensions', () => {
    const result = analyzeImageDimensions({ html });

    assert.deepEqual(result, {
      total: 4,
      missingDimensions: 1,
      invalidDimensions: 1,
      warningCodes: ['MISSING_DIMENSIONS', 'INVALID_DIMENSION_VALUE'],
    });
  });

  test('counts lazy, eager and missing loading attributes', () => {
    const result = analyzeImageLoading({ html });

    assert.deepEqual(result, {
      total: 4,
      lazy: 2,
      eager: 1,
      missingLoading: 1,
      warningCodes: ['MISSING_LOADING_ATTRIBUTE'],
    });
  });

  test('combines image checks into one summary payload', () => {
    const result = analyzeImages({ html });

    assert.equal(result.total, 4);
    assert.equal(result.missingAlt, 1);
    assert.equal(result.invalidDimensions, 1);
    assert.equal(result.missingLoading, 1);
    assert.deepEqual(result.warningCodes, [
      'MISSING_ALT',
      'EMPTY_ALT',
      'DUPLICATE_ALT',
      'MISSING_DIMENSIONS',
      'INVALID_DIMENSION_VALUE',
      'MISSING_LOADING_ATTRIBUTE',
    ]);
  });

  test('accepts Next.js fill images without width and height attributes', () => {
    const result = analyzeImageDimensions({
      html: `
        <img
          src="/_next/image?url=%2Ffill.jpg&amp;w=1920&amp;q=75"
          alt="Fill image"
          sizes="100vw"
          loading="lazy"
          decoding="async"
          data-nimg="fill"
          style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent"
        />
      `,
    });

    assert.deepEqual(result, {
      total: 1,
      missingDimensions: 0,
      invalidDimensions: 0,
      warningCodes: [],
    });
  });

  test('counts fetchpriority high as eager when loading is omitted', () => {
    const result = analyzeImageLoading({
      html: `
        <img
          src="/_next/image?url=%2Fhero.jpg&amp;w=1200&amp;q=75"
          alt="Priority hero"
          width="1200"
          height="630"
          fetchpriority="high"
          data-nimg="1"
        />
      `,
    });

    assert.deepEqual(result, {
      total: 1,
      lazy: 0,
      eager: 1,
      missingLoading: 0,
      warningCodes: [],
    });
  });

  test('accepts a preloaded Next.js image when loading is omitted', () => {
    const result = analyzeImageLoading({
      html: `
        <img
          src="/_next/image?url=%2Fhero.jpg&amp;w=1200&amp;q=75"
          alt="Preloaded hero"
          width="1200"
          height="630"
          data-nimg="1"
        />
      `,
    });

    assert.deepEqual(result, {
      total: 1,
      lazy: 0,
      eager: 1,
      missingLoading: 0,
      warningCodes: [],
    });
  });
});
