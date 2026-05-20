import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { analyzeSerpSnippet, buildPageTitle } from '../src/index.js';

describe('analyzeSerpSnippet', () => {
  test('returns ok when title and description are inside the ideal ranges and include the keyword', () => {
    const result = analyzeSerpSnippet({
      title: 'Project Brief Template for Agencies',
      description:
        'Use this project brief template to align scope, timelines, goals, stakeholders, and next steps before client work begins.',
      keyword: 'project brief',
    });

    assert.deepEqual(result, {
      title: {
        characters: 35,
        status: 'ok',
        hasKeyword: true,
        warningCodes: [],
      },
      description: {
        characters: 121,
        status: 'ok',
        hasKeyword: true,
        warningCodes: [],
      },
      overallStatus: 'ok',
    });
  });

  test('marks short descriptions as needs_improvement', () => {
    const result = analyzeSerpSnippet({
      title: 'How to write a clear project brief',
      description:
        'Learn how to create a clear project brief that helps clients understand scope, timelines, and next steps.',
      keyword: 'project brief',
    });

    assert.equal(result.title.status, 'ok');
    assert.equal(result.title.hasKeyword, true);
    assert.deepEqual(result.title.warningCodes, []);
    assert.deepEqual(result.description, {
      characters: 105,
      status: 'short',
      hasKeyword: true,
      warningCodes: ['DESCRIPTION_TOO_SHORT'],
    });
    assert.equal(result.overallStatus, 'needs_improvement');
  });

  test('marks titles with 55 characters as long to keep a pixel-width margin', () => {
    const result = analyzeSerpSnippet({
      title: 'A'.repeat(55),
      description:
        'A practical guide for planning better content, improving search snippets, and keeping editorial decisions easier to review.',
    });

    assert.equal(result.title.status, 'long');
    assert.deepEqual(result.title.warningCodes, ['TITLE_TOO_LONG']);
    assert.equal(result.overallStatus, 'needs_improvement');
  });

  test('marks descriptions with 155 characters as long to keep a pixel-width margin', () => {
    const result = analyzeSerpSnippet({
      title: 'Project Brief Template for Agencies',
      description: 'A'.repeat(155),
    });

    assert.equal(result.description.status, 'long');
    assert.deepEqual(result.description.warningCodes, [
      'DESCRIPTION_TOO_LONG',
    ]);
    assert.equal(result.overallStatus, 'needs_improvement');
  });

  test('detects keywords without depending on case or accents', () => {
    const result = analyzeSerpSnippet({
      title: 'Cafe Marketing Plan for Local Businesses',
      description:
        'Use this cafe marketing plan to organize campaigns, offers, channels, weekly content ideas, and local audience research.',
      keyword: 'Café Marketing',
    });

    assert.equal(result.title.hasKeyword, true);
    assert.equal(result.description.hasKeyword, true);
    assert.equal(result.overallStatus, 'ok');
  });

  test('returns warning codes when the provided keyword is missing', () => {
    const result = analyzeSerpSnippet({
      title: 'Content Calendar Template for Agencies',
      description:
        'Use this content calendar template to plan topics, publishing dates, review stages, and responsibilities across a small team.',
      keyword: 'technical SEO',
    });

    assert.equal(result.title.status, 'ok');
    assert.equal(result.description.status, 'ok');
    assert.equal(result.title.hasKeyword, false);
    assert.equal(result.description.hasKeyword, false);
    assert.deepEqual(result.title.warningCodes, ['TITLE_MISSING_KEYWORD']);
    assert.deepEqual(result.description.warningCodes, [
      'DESCRIPTION_MISSING_KEYWORD',
    ]);
    assert.equal(result.overallStatus, 'needs_improvement');
  });

  test('returns a description warning when the keyword appears only in the title', () => {
    const result = analyzeSerpSnippet({
      title: 'Technical SEO Checklist for SaaS Teams',
      description:
        'Use this checklist to review crawling, indexing, metadata, internal links, page templates, and recurring content quality issues.',
      keyword: 'technical SEO',
    });

    assert.equal(result.title.hasKeyword, true);
    assert.equal(result.description.hasKeyword, false);
    assert.deepEqual(result.title.warningCodes, []);
    assert.deepEqual(result.description.warningCodes, [
      'DESCRIPTION_MISSING_KEYWORD',
    ]);
    assert.equal(result.overallStatus, 'needs_improvement');
  });

  test('returns a title warning when the keyword appears only in the description', () => {
    const result = analyzeSerpSnippet({
      title: 'Search Visibility Checklist for SaaS Teams',
      description:
        'Use this technical SEO checklist to review crawling, indexing, metadata, internal links, page templates, and recurring content quality issues.',
      keyword: 'technical SEO',
    });

    assert.equal(result.title.hasKeyword, false);
    assert.equal(result.description.hasKeyword, true);
    assert.deepEqual(result.title.warningCodes, ['TITLE_MISSING_KEYWORD']);
    assert.deepEqual(result.description.warningCodes, []);
    assert.equal(result.overallStatus, 'needs_improvement');
  });
});

describe('buildPageTitle', () => {
  test('returns only the page title when brand is omitted', () => {
    const result = buildPageTitle({
      pageTitle: '  Project Brief Template  ',
    });

    assert.deepEqual(result, {
      title: 'Project Brief Template',
      characters: 22,
      warningCodes: ['TITLE_TOO_SHORT'],
    });
  });

  test('appends brand with the default separator in suffix position', () => {
    const result = buildPageTitle({
      pageTitle: 'Project Brief Template for Agencies',
      brand: 'Acme Studio',
    });

    assert.deepEqual(result, {
      title: 'Project Brief Template for Agencies | Acme Studio',
      characters: 49,
      warningCodes: [],
    });
  });

  test('places brand before the page title when brandPosition is prefix', () => {
    const result = buildPageTitle({
      pageTitle: 'Project Brief Template for Agencies',
      brand: 'Acme Studio',
      brandPosition: 'prefix',
    });

    assert.deepEqual(result, {
      title: 'Acme Studio | Project Brief Template for Agencies',
      characters: 49,
      warningCodes: [],
    });
  });

  test('supports a custom separator', () => {
    const result = buildPageTitle({
      pageTitle: 'Project Brief Template for Agencies',
      brand: 'Acme Studio',
      separator: ' - ',
    });

    assert.deepEqual(result, {
      title: 'Project Brief Template for Agencies - Acme Studio',
      characters: 49,
      warningCodes: [],
    });
  });

  test('ignores an empty brand after whitespace normalization', () => {
    const result = buildPageTitle({
      pageTitle: 'Project Brief Template for Agencies',
      brand: '   ',
    });

    assert.deepEqual(result, {
      title: 'Project Brief Template for Agencies',
      characters: 35,
      warningCodes: [],
    });
  });

  test('truncates to maxLength and reports truncation plus length warnings', () => {
    const result = buildPageTitle({
      pageTitle: 'Project Brief Template for Agencies',
      brand: 'Acme Studio',
      maxLength: 40,
    });

    assert.deepEqual(result, {
      title: 'Project Brief Template for Agencies | Ac',
      characters: 40,
      warningCodes: ['TITLE_TRUNCATED'],
    });
  });

  test('reports TITLE_TOO_LONG when the composed title exceeds the ideal range', () => {
    const result = buildPageTitle({
      pageTitle: 'Enterprise Content Operations Playbook for Distributed Teams',
      brand: 'Acme Studio',
    });

    assert.equal(result.characters, 74);
    assert.deepEqual(result.warningCodes, ['TITLE_TOO_LONG']);
  });

  test('aligns length warnings with analyzeSerpSnippet thresholds', () => {
    const built = buildPageTitle({
      pageTitle: 'A'.repeat(55),
    });
    const analyzed = analyzeSerpSnippet({
      title: built.title,
      description: 'A'.repeat(120),
    });

    assert.deepEqual(built.warningCodes, ['TITLE_TOO_LONG']);
    assert.deepEqual(analyzed.title.warningCodes, ['TITLE_TOO_LONG']);
  });
});
