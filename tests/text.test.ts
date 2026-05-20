import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { analyzeKeywordDensity, countTextMetrics, createSlug } from '../src/index.js';
import { getStopwordsForLanguage } from '../src/utils/text.js';

const assertWordsAreStopwords = (
  language: 'en' | 'pt-BR',
  words: string[],
): void => {
  const stopwords = getStopwordsForLanguage(language);

  for (const word of words) {
    assert.ok(stopwords.has(word), `"${word}" should be a stopword (${language})`);
  }
};

describe('getStopwordsForLanguage', () => {
  test('normalizes tokens when building the English set', () => {
    const stopwords = getStopwordsForLanguage('en');

    assert.ok(stopwords.has('the'));
    assert.ok(stopwords.has('for'));
  });

  test('normalizes tokens when building the Portuguese set', () => {
    const stopwords = getStopwordsForLanguage('pt-BR');

    assert.ok(stopwords.has('como'));
    assert.ok(stopwords.has('pelo'));
  });
});

describe('createSlug', () => {
  test('normalizes a common English text without removing stopwords', () => {
    const result = createSlug({
      text: 'How to write a clear project brief for clients',
      maxWords: 10,
      removeStopwords: false,
      inputLanguage: 'en',
    });

    assert.deepEqual(result, {
      slug: 'how-to-write-a-clear-project-brief-for-clients',
      originalText: 'How to write a clear project brief for clients',
      wordCount: 9,
      removedStopwords: [],
      warningCodes: [],
    });
  });

  test('removes accents and punctuation before building the slug', () => {
    const result = createSlug({
      text: 'Orçamento rápido: São Paulo 2026!!!',
      removeStopwords: false,
      inputLanguage: 'pt-BR',
    });

    assert.equal(result.slug, 'orcamento-rapido-sao-paulo-2026');
    assert.equal(result.wordCount, 5);
    assert.deepEqual(result.removedStopwords, []);
    assert.deepEqual(result.warningCodes, []);
  });

  test('removes Portuguese stopwords and returns a stable warning code when maxWords truncates the slug', () => {
    const removedStopwords = ['como', 'um', 'pelo', 'sem', 'ser'];

    assertWordsAreStopwords('pt-BR', removedStopwords);

    const result = createSlug({
      text: 'Como abordar um cliente pelo WhatsApp sem ser invasivo?',
      maxWords: 3,
      removeStopwords: true,
      inputLanguage: 'pt-BR',
    });

    assert.deepEqual(result, {
      slug: 'abordar-cliente-whatsapp',
      originalText: 'Como abordar um cliente pelo WhatsApp sem ser invasivo?',
      wordCount: 3,
      removedStopwords,
      warningCodes: ['MAX_WORDS_APPLIED'],
    });
  });

  test('uses English stopwords by default', () => {
    assertWordsAreStopwords('en', ['how', 'to', 'a', 'for']);

    const result = createSlug({
      text: 'How to write a clear project brief for service clients',
      maxWords: 2,
      removeStopwords: true,
    });

    assert.equal(result.slug, 'write-clear');
    assert.deepEqual(result.warningCodes, ['MAX_WORDS_APPLIED']);
  });
});

describe('analyzeKeywordDensity', () => {
  test('counts keyword occurrences with accent-insensitive token matching', () => {
    const result = analyzeKeywordDensity({
      text: 'Estratégias de SEO para SEO local em São Paulo.',
      keywords: ['SEO', 'sao paulo'],
    });

    assert.equal(result.totalWords, 9);
    assert.deepEqual(result.keywords, [
      {
        keyword: 'SEO',
        occurrences: 2,
        density: 22.22,
        warningCodes: ['DENSITY_TOO_HIGH'],
      },
      {
        keyword: 'sao paulo',
        occurrences: 1,
        density: 11.11,
        warningCodes: ['DENSITY_TOO_HIGH'],
      },
    ]);
    assert.deepEqual(result.warningCodes, []);
  });

  test('matches multi-word keywords as phrases', () => {
    const result = analyzeKeywordDensity({
      text: 'Keyword density helps measure keyword density over time.',
      keywords: ['keyword density'],
    });

    assert.equal(result.totalWords, 8);
    assert.deepEqual(result.keywords, [
      {
        keyword: 'keyword density',
        occurrences: 2,
        density: 25,
        warningCodes: ['DENSITY_TOO_HIGH'],
      },
    ]);
  });

  test('strips HTML before analysis when stripHtml is enabled', () => {
    const result = analyzeKeywordDensity({
      text: '<p>SEO <strong>tools</strong> for teams</p>',
      keywords: ['seo tools'],
      stripHtml: true,
    });

    assert.equal(result.totalWords, 4);
    assert.deepEqual(result.keywords, [
      {
        keyword: 'seo tools',
        occurrences: 1,
        density: 25,
        warningCodes: ['DENSITY_TOO_HIGH'],
      },
    ]);
  });

  test('reports KEYWORD_NOT_FOUND and configurable density warnings', () => {
    const result = analyzeKeywordDensity({
      text: 'A short article about content strategy.',
      keywords: ['content strategy', 'backlinks'],
      thresholds: {
        minDensity: 5,
        maxDensity: 20,
      },
    });

    assert.deepEqual(result.keywords, [
      {
        keyword: 'content strategy',
        occurrences: 1,
        density: 16.67,
        warningCodes: [],
      },
      {
        keyword: 'backlinks',
        occurrences: 0,
        density: 0,
        warningCodes: ['KEYWORD_NOT_FOUND'],
      },
    ]);
  });

  test('reports DENSITY_TOO_LOW when density is below the minimum threshold', () => {
    const result = analyzeKeywordDensity({
      text: [
        'This guide explains how to structure articles for readability and search intent.',
        'It focuses on headings, internal links, and useful examples for readers.',
      ].join(' '),
      keywords: ['readability'],
      thresholds: {
        minDensity: 5,
        maxDensity: 10,
      },
    });

    assert.equal(result.keywords[0]?.occurrences, 1);
    assert.equal(result.keywords[0]?.density, 4.35);
    assert.deepEqual(result.keywords[0]?.warningCodes, ['DENSITY_TOO_LOW']);
  });

  test('returns EMPTY_INPUT when text is empty after normalization', () => {
    const result = analyzeKeywordDensity({
      text: '   ',
      keywords: ['seo'],
    });

    assert.deepEqual(result, {
      totalWords: 0,
      keywords: [],
      warningCodes: ['EMPTY_INPUT'],
    });
  });

  test('returns NO_KEYWORDS when the keyword list is empty', () => {
    const result = analyzeKeywordDensity({
      text: 'Valid article body.',
      keywords: ['', '   '],
    });

    assert.equal(result.totalWords, 3);
    assert.deepEqual(result.keywords, []);
    assert.deepEqual(result.warningCodes, ['NO_KEYWORDS']);
  });
});

describe('countTextMetrics', () => {
  test('counts metrics for a short text', () => {
    const result = countTextMetrics({
      text: 'Learn how to create a professional quote for service clients.',
    });

    assert.deepEqual(result, {
      characters: 61,
      charactersWithoutSpaces: 52,
      words: 10,
      sentences: 1,
      paragraphs: 1,
      estimatedReadingTimeMinutes: 1,
    });
  });

  test('normalizes duplicated spaces for linguistic metrics without changing literal character counts', () => {
    const text = 'First   sentence.\n\nSecond paragraph has two sentences! Really?';
    const result = countTextMetrics({ text });

    assert.equal(result.characters, text.length);
    assert.equal(result.charactersWithoutSpaces, 52);
    assert.equal(result.words, 8);
    assert.equal(result.sentences, 3);
    assert.equal(result.paragraphs, 2);
    assert.equal(result.estimatedReadingTimeMinutes, 1);
  });

  test('returns zero linguistic metrics for whitespace-only text after validation is bypassed', () => {
    const result = countTextMetrics({
      text: '   ',
    });

    assert.deepEqual(result, {
      characters: 3,
      charactersWithoutSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      estimatedReadingTimeMinutes: 0,
    });
  });
});
