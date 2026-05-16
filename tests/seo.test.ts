import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { analyzeSeoSnippet } from '../src/index.js';

describe('analyzeSeoSnippet', () => {
  test('returns ok when title and description are inside the ideal ranges and include the keyword', () => {
    const result = analyzeSeoSnippet({
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
    const result = analyzeSeoSnippet({
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
    const result = analyzeSeoSnippet({
      title: 'A'.repeat(55),
      description:
        'A practical guide for planning better content, improving search snippets, and keeping editorial decisions easier to review.',
    });

    assert.equal(result.title.status, 'long');
    assert.deepEqual(result.title.warningCodes, ['TITLE_TOO_LONG']);
    assert.equal(result.overallStatus, 'needs_improvement');
  });

  test('marks descriptions with 155 characters as long to keep a pixel-width margin', () => {
    const result = analyzeSeoSnippet({
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
    const result = analyzeSeoSnippet({
      title: 'Cafe Marketing Plan for Local Businesses',
      description:
        'Use this cafe marketing plan to organize campaigns, offers, channels, weekly content ideas, and local audience research.',
      keyword: 'Café Marketing',
    });

    assert.equal(result.title.hasKeyword, true);
    assert.equal(result.description.hasKeyword, true);
    assert.equal(result.overallStatus, 'ok');
  });

  test('marks missing keyword usage as needs_improvement without adding length warnings', () => {
    const result = analyzeSeoSnippet({
      title: 'Content Calendar Template for Agencies',
      description:
        'Use this content calendar template to plan topics, publishing dates, review stages, and responsibilities across a small team.',
      keyword: 'technical SEO',
    });

    assert.equal(result.title.status, 'ok');
    assert.equal(result.description.status, 'ok');
    assert.equal(result.title.hasKeyword, false);
    assert.equal(result.description.hasKeyword, false);
    assert.deepEqual(result.title.warningCodes, []);
    assert.deepEqual(result.description.warningCodes, []);
    assert.equal(result.overallStatus, 'needs_improvement');
  });
});
