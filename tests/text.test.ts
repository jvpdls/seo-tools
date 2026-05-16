import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  countTextMetrics,
  createSlug,
  normalizeTextToken,
} from '../src/index.js';

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
      removedStopwords: ['como', 'um', 'pelo', 'sem', 'ser'],
      warningCodes: ['MAX_WORDS_APPLIED'],
    });
  });

  test('uses English stopwords by default', () => {
    const result = createSlug({
      text: 'How to write a clear project brief for service clients',
      maxWords: 2,
      removeStopwords: true,
    });

    assert.equal(result.slug, 'write-clear');
    assert.deepEqual(result.warningCodes, ['MAX_WORDS_APPLIED']);
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

describe('text helpers', () => {
  test('normalizes accents and case in tokens', () => {
    assert.equal(normalizeTextToken('São'), 'sao');
  });
});
