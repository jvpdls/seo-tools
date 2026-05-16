import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { analyzeHeadings } from '../src/index.js';

describe('analyzeHeadings', () => {
  test('extracts headings in order and detects a valid hierarchy', () => {
    const result = analyzeHeadings({
      html: '<h1>How to write a clear project brief</h1><h2>What to include</h2><h3>Scope and timeline</h3>',
    });

    assert.deepEqual(result, {
      hasH1: true,
      h1Count: 1,
      hasMultipleH1: false,
      hasSkippedLevels: false,
      headings: [
        {
          level: 1,
          text: 'How to write a clear project brief',
        },
        {
          level: 2,
          text: 'What to include',
        },
        {
          level: 3,
          text: 'Scope and timeline',
        },
      ],
      warningCodes: [],
    });
  });

  test('returns a missing H1 warning when no H1 exists', () => {
    const result = analyzeHeadings({
      html: '<h2>Section</h2><h3>Subsection</h3>',
    });

    assert.equal(result.hasH1, false);
    assert.equal(result.h1Count, 0);
    assert.deepEqual(result.warningCodes, [
      'MISSING_H1',
      'SKIPPED_HEADING_LEVEL',
    ]);
  });

  test('returns a multiple H1 warning when more than one H1 exists', () => {
    const result = analyzeHeadings({
      html: '<h1>Main title</h1><h2>Section</h2><h1>Second title</h1>',
    });

    assert.equal(result.hasH1, true);
    assert.equal(result.h1Count, 2);
    assert.equal(result.hasMultipleH1, true);
    assert.deepEqual(result.warningCodes, ['MULTIPLE_H1']);
  });

  test('detects skipped heading levels', () => {
    const result = analyzeHeadings({
      html: '<h1>Main title</h1><h2>Section</h2><h4>Skipped level</h4>',
    });

    assert.equal(result.hasSkippedLevels, true);
    assert.deepEqual(result.warningCodes, ['SKIPPED_HEADING_LEVEL']);
  });

  test('removes nested tags and decodes common HTML entities in heading text', () => {
    const result = analyzeHeadings({
      html: '<h1>SEO <span>Tools</span> &amp; Content</h1><h2>Tom&#39;s checklist&nbsp;2026</h2>',
    });

    assert.deepEqual(result.headings, [
      {
        level: 1,
        text: 'SEO Tools & Content',
      },
      {
        level: 2,
        text: "Tom's checklist 2026",
      },
    ]);
  });

  test('ignores empty headings after stripping nested markup', () => {
    const result = analyzeHeadings({
      html: '<h1><span> </span></h1><h2>Useful section</h2>',
    });

    assert.deepEqual(result.headings, [
      {
        level: 2,
        text: 'Useful section',
      },
    ]);
    assert.deepEqual(result.warningCodes, [
      'MISSING_H1',
      'SKIPPED_HEADING_LEVEL',
    ]);
  });

  test('matches heading tags case-insensitively and accepts attributes', () => {
    const result = analyzeHeadings({
      html: '<H1 class="title">Main title</H1><h2 id="intro">Intro</h2>',
    });

    assert.deepEqual(result.headings, [
      {
        level: 1,
        text: 'Main title',
      },
      {
        level: 2,
        text: 'Intro',
      },
    ]);
  });

  test('extracts messy headings with attributes and flags skipped levels', () => {
    const result = analyzeHeadings({
      html: [
        '<h1 id="main" class="hero-title" style="font-size: 42px">Main guide</h1>',
        '<section>',
        '<h2 class="section-title">Planning</h2>',
        '<h2 id="research" style="color: red">Research</h2>',
        '<h5 class="deep" data-track="true">Too deep too soon</h5>',
        '<h3 style="margin: 0"><span>Back to basics</span></h3>',
        '<h6 id="appendix">Appendix</h6>',
        '<h3 class="faq">FAQ</h3>',
        '<h2 style="font-weight: 700">Summary</h2>',
        '</section>',
      ].join(''),
    });

    assert.equal(result.hasH1, true);
    assert.equal(result.h1Count, 1);
    assert.equal(result.hasMultipleH1, false);
    assert.equal(result.hasSkippedLevels, true);
    assert.deepEqual(result.headings, [
      {
        level: 1,
        text: 'Main guide',
      },
      {
        level: 2,
        text: 'Planning',
      },
      {
        level: 2,
        text: 'Research',
      },
      {
        level: 5,
        text: 'Too deep too soon',
      },
      {
        level: 3,
        text: 'Back to basics',
      },
      {
        level: 6,
        text: 'Appendix',
      },
      {
        level: 3,
        text: 'FAQ',
      },
      {
        level: 2,
        text: 'Summary',
      },
    ]);
    assert.deepEqual(result.warningCodes, ['SKIPPED_HEADING_LEVEL']);
  });
});
