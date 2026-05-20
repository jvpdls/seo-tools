import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { cleanHtml, countLinks } from '../src/domains/html/index.js';

describe('cleanHtml', () => {
  test('returns EMPTY_INPUT warning for empty html', () => {
    const result = cleanHtml({ html: '   ' });

    assert.deepEqual(result, {
      html: '',
      warningCodes: ['EMPTY_INPUT'],
    });
  });

  test('preserves text content while removing class attributes', () => {
    const result = cleanHtml({
      html: '<p class="lead">Hello <strong class="bold">world</strong></p>',
      removeClasses: true,
    });

    assert.equal(result.html, '<p>Hello <strong>world</strong></p>');
    assert.deepEqual(result.warningCodes, []);
  });

  test('removes id, style and data-* attributes when requested', () => {
    const result = cleanHtml({
      html: '<div id="main" class="box" style="color:red" data-track="1" data-id="x">Content</div>',
      removeIds: true,
      removeStyle: true,
      removeDataAttributes: true,
    });

    assert.equal(result.html, '<div class="box">Content</div>');
    assert.deepEqual(result.warningCodes, []);
  });

  test('applies an explicit deny list through removeAttributes', () => {
    const result = cleanHtml({
      html: '<a href="/blog" target="_blank" rel="nofollow">Read</a>',
      removeAttributes: ['target', 'rel'],
    });

    assert.equal(result.html, '<a href="/blog">Read</a>');
  });

  test('keeps only allow-listed attributes when keepAttributes is provided', () => {
    const result = cleanHtml({
      html: '<img src="/cover.jpg" class="hero" alt="Cover" width="1200" />',
      keepAttributes: ['src', 'alt'],
    });

    assert.equal(result.html, '<img src="/cover.jpg" alt="Cover" />');
  });

  test('gives keepAttributes precedence over remove flags', () => {
    const result = cleanHtml({
      html: '<p class="note" id="intro">Intro</p>',
      removeClasses: true,
      removeIds: true,
      keepAttributes: ['class'],
    });

    assert.equal(result.html, '<p class="note">Intro</p>');
  });

  test('optionally collapses whitespace and removes empty tags', () => {
    const result = cleanHtml({
      html: '<div>  <span></span>  <p>  Keep  </p>  </div>',
      collapseWhitespace: true,
      removeEmptyTags: true,
    });

    assert.equal(result.html, '<div><p> Keep </p></div>');
    assert.deepEqual(result.warningCodes, []);
  });

  test('reports MALFORMED_HTML for obviously broken markup', () => {
    const result = cleanHtml({
      html: '<p>Broken <> fragment</p>',
    });

    assert.equal(result.html, '<p>Broken <> fragment</p>');
    assert.deepEqual(result.warningCodes, ['MALFORMED_HTML']);
  });
});

describe('countLinks', () => {
  test('returns EMPTY_INPUT warning and zero counts for empty html', () => {
    const result = countLinks({ html: '   ' });

    assert.deepEqual(result, {
      total: 0,
      internal: 0,
      external: 0,
      mailto: 0,
      tel: 0,
      nofollow: 0,
      emptyAnchor: 0,
      invalidHref: 0,
      warningCodes: ['EMPTY_INPUT'],
    });
  });

  test('classifies internal and external links when baseUrl is provided', () => {
    const result = countLinks({
      html: [
        '<a href="/about">About</a>',
        '<a href="https://example.com/pricing">Pricing</a>',
        '<a href="https://other.com">Partner</a>',
      ].join(''),
      baseUrl: 'https://example.com/blog/post',
    });

    assert.equal(result.total, 3);
    assert.equal(result.internal, 2);
    assert.equal(result.external, 1);
    assert.equal(result.invalidHref, 0);
    assert.deepEqual(result.warningCodes, []);
  });

  test('resolves relative href values against baseUrl', () => {
    const result = countLinks({
      html: '<a href="contact">Contact</a><a href="../help">Help</a>',
      baseUrl: 'https://example.com/blog/post',
    });

    assert.equal(result.total, 2);
    assert.equal(result.internal, 2);
    assert.equal(result.external, 0);
  });

  test('counts mailto and tel links without classifying them as internal or external', () => {
    const result = countLinks({
      html: [
        '<a href="mailto:hello@example.com">Email</a>',
        '<a href="tel:+5511999999999">Call</a>',
        '<a href="https://example.com">Home</a>',
      ].join(''),
      baseUrl: 'https://example.com',
    });

    assert.equal(result.total, 3);
    assert.equal(result.mailto, 1);
    assert.equal(result.tel, 1);
    assert.equal(result.internal, 1);
    assert.equal(result.external, 0);
  });

  test('detects nofollow links from rel attribute tokens', () => {
    const result = countLinks({
      html: [
        '<a href="/a" rel="nofollow">A</a>',
        '<a href="/b" rel="noopener nofollow sponsored">B</a>',
        '<a href="/c">C</a>',
      ].join(''),
      baseUrl: 'https://example.com',
    });

    assert.equal(result.total, 3);
    assert.equal(result.nofollow, 2);
  });

  test('detects empty anchors after stripping nested markup', () => {
    const result = countLinks({
      html: [
        '<a href="/empty"></a>',
        '<a href="/spaces"><span> </span></a>',
        '<a href="/valid">Read more</a>',
      ].join(''),
      baseUrl: 'https://example.com',
    });

    assert.equal(result.total, 3);
    assert.equal(result.emptyAnchor, 2);
  });

  test('counts invalid href values and missing href attributes', () => {
    const result = countLinks({
      html: [
        '<a href="javascript:void(0)">Bad</a>',
        '<a href="ht!tp://broken">Broken</a>',
        '<a>Missing</a>',
        '<a href="">Blank</a>',
        '<a href="/ok">OK</a>',
      ].join(''),
      baseUrl: 'https://example.com',
    });

    assert.equal(result.total, 5);
    assert.equal(result.invalidHref, 4);
    assert.equal(result.internal, 1);
  });

  test('treats absolute http(s) links as external when baseUrl is omitted', () => {
    const result = countLinks({
      html: '<a href="https://example.com">Example</a><a href="/relative">Relative</a>',
    });

    assert.equal(result.total, 2);
    assert.equal(result.external, 1);
    assert.equal(result.internal, 0);
  });

  test('decodes HTML entities in href attributes before classification', () => {
    const result = countLinks({
      html: '<a href="https://example.com/path?a=1&amp;b=2">Encoded</a>',
      baseUrl: 'https://example.com',
    });

    assert.equal(result.total, 1);
    assert.equal(result.internal, 1);
    assert.equal(result.invalidHref, 0);
  });
});

