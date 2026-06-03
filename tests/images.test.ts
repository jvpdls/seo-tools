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
        alt: 'Hero banner',
        width: 1200,
        height: 630,
        loading: 'lazy',
        decoding: 'async',
        title: 'Homepage hero',
        srcset: '/hero-600.jpg 600w, /hero-1200.jpg 1200w',
        sizes: '100vw',
        index: result.images[0]?.index ?? 0,
      },
    ]);
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
});
