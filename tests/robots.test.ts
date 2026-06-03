import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  analyzeRobotsUrls,
  analyzeRobotsRules,
  extractRobotsRules,
  extractRobotsSitemaps,
  matchRobotsPath,
} from '../src/domains/robots/index.js';

const robotsContent = `
  User-agent: *
  Disallow: /admin/
  Allow: /admin/help/

  User-agent: Googlebot
  Allow: /private/google/
  Disallow: /private/
  Crawl-delay: 5

  Sitemap: https://example.com/sitemap.xml
  Sitemap: https://example.com/news.xml
`;

describe('extractRobotsRules', () => {
  test('returns EMPTY_INPUT for blank robots content', () => {
    const result = extractRobotsRules({ content: ' ' });

    assert.deepEqual(result, {
      groups: [],
      warningCodes: ['EMPTY_INPUT'],
    });
  });

  test('extracts grouped user-agent rules and crawl delay', () => {
    const result = extractRobotsRules({ content: robotsContent });

    assert.equal(result.groups.length, 2);
    assert.deepEqual(result.groups[0], {
      userAgents: ['*'],
      rules: [
        { directive: 'disallow', value: '/admin/', line: 1 },
        { directive: 'allow', value: '/admin/help/', line: 1 },
      ],
      crawlDelay: null,
      host: null,
    });
    assert.deepEqual(result.groups[1], {
      userAgents: ['googlebot'],
      rules: [
        { directive: 'allow', value: '/private/google/', line: 2 },
        { directive: 'disallow', value: '/private/', line: 2 },
      ],
      crawlDelay: 5,
      host: null,
    });
    assert.deepEqual(result.warningCodes, []);
  });
});

describe('extractRobotsSitemaps', () => {
  test('extracts unique sitemap declarations', () => {
    const result = extractRobotsSitemaps({ content: robotsContent });

    assert.deepEqual(result, {
      sitemaps: [
        'https://example.com/sitemap.xml',
        'https://example.com/news.xml',
      ],
      warningCodes: [],
    });
  });
});

describe('analyzeRobotsRules', () => {
  test('summarizes robots groups, rules, sitemaps and user-agent matches', () => {
    const result = analyzeRobotsRules({
      content: robotsContent,
      userAgent: 'Googlebot-News',
    });

    assert.equal(result.totalGroups, 2);
    assert.equal(result.totalRules, 4);
    assert.equal(result.hasGlobalUserAgent, true);
    assert.deepEqual(result.matchedUserAgents, ['googlebot']);
    assert.deepEqual(result.warningCodes, []);
  });
});

describe('matchRobotsPath', () => {
  test('uses the most specific matching directive for a path', () => {
    const blocked = matchRobotsPath({
      content: robotsContent,
      path: '/admin/report',
    });
    const allowed = matchRobotsPath({
      content: robotsContent,
      path: '/admin/help/guide',
    });
    const googleAllowed = matchRobotsPath({
      content: robotsContent,
      path: 'https://example.com/private/google/doc',
      userAgent: 'Googlebot',
    });

    assert.deepEqual(blocked, {
      path: '/admin/report',
      userAgent: '*',
      allowed: false,
      matchedDirective: 'disallow',
      matchedPattern: '/admin/',
      warningCodes: [],
    });
    assert.deepEqual(allowed, {
      path: '/admin/help/guide',
      userAgent: '*',
      allowed: true,
      matchedDirective: 'allow',
      matchedPattern: '/admin/help/',
      warningCodes: [],
    });
    assert.deepEqual(googleAllowed, {
      path: '/private/google/doc',
      userAgent: 'googlebot',
      allowed: true,
      matchedDirective: 'allow',
      matchedPattern: '/private/google/',
      warningCodes: [],
    });
  });
});

describe('analyzeRobotsUrls', () => {
  test('analyzes a batch of URLs and returns per-url diagnostics', () => {
    const result = analyzeRobotsUrls({
      content: robotsContent,
      urls: [
        'https://example.com/private/report',
        'https://example.com/private/google/doc?tab=1',
        'https://example.com/admin/help/guide',
      ],
      userAgent: 'Googlebot',
    });

    assert.equal(result.userAgent, 'googlebot');
    assert.equal(result.total, 3);
    assert.equal(result.allowedCount, 2);
    assert.equal(result.blockedCount, 1);
    assert.equal(result.invalidCount, 0);
    assert.deepEqual(result.hosts, ['example.com']);
    assert.equal(result.hasMixedHosts, false);
    assert.deepEqual(result.warningCodes, ['BLOCKED_URLS_FOUND']);
    assert.deepEqual(result.urls, [
      {
        inputUrl: 'https://example.com/private/report',
        normalizedUrl: 'https://example.com/private/report',
        host: 'example.com',
        path: '/private/report',
        userAgent: 'googlebot',
        allowed: false,
        matchedDirective: 'disallow',
        matchedPattern: '/private/',
        matchedUserAgents: ['googlebot'],
        observations: ['BLOCKED_BY_DISALLOW_RULE', 'MATCHED_SPECIFIC_USER_AGENT'],
        warningCodes: ['BLOCKED_BY_ROBOTS'],
      },
      {
        inputUrl: 'https://example.com/private/google/doc?tab=1',
        normalizedUrl: 'https://example.com/private/google/doc?tab=1',
        host: 'example.com',
        path: '/private/google/doc?tab=1',
        userAgent: 'googlebot',
        allowed: true,
        matchedDirective: 'allow',
        matchedPattern: '/private/google/',
        matchedUserAgents: ['googlebot'],
        observations: [
          'ALLOWED_BY_ALLOW_RULE',
          'HAS_QUERY_STRING',
          'MATCHED_SPECIFIC_USER_AGENT',
        ],
        warningCodes: [],
      },
      {
        inputUrl: 'https://example.com/admin/help/guide',
        normalizedUrl: 'https://example.com/admin/help/guide',
        host: 'example.com',
        path: '/admin/help/guide',
        userAgent: 'googlebot',
        allowed: true,
        matchedDirective: null,
        matchedPattern: null,
        matchedUserAgents: ['googlebot'],
        observations: ['ALLOWED_WITHOUT_MATCHING_RULE', 'MATCHED_SPECIFIC_USER_AGENT'],
        warningCodes: [],
      },
    ]);
  });

  test('reports invalid URLs and mixed hosts in batch mode', () => {
    const result = analyzeRobotsUrls({
      content: robotsContent,
      urls: [
        'https://example.com/admin/',
        'notaurl',
        'https://other.com/public/page',
      ],
    });

    assert.equal(result.total, 3);
    assert.equal(result.allowedCount, 1);
    assert.equal(result.blockedCount, 1);
    assert.equal(result.invalidCount, 1);
    assert.deepEqual(result.hosts, ['example.com', 'other.com']);
    assert.equal(result.hasMixedHosts, true);
    assert.deepEqual(result.warningCodes, [
      'INVALID_URL',
      'BLOCKED_URLS_FOUND',
      'MIXED_HOSTS',
    ]);
    assert.deepEqual(result.urls[1], {
      inputUrl: 'notaurl',
      normalizedUrl: null,
      host: null,
      path: null,
      userAgent: '*',
      allowed: null,
      matchedDirective: null,
      matchedPattern: null,
      matchedUserAgents: [],
      observations: [],
      warningCodes: ['INVALID_URL'],
    });
  });

  test('returns EMPTY_URLS when the batch is blank', () => {
    const result = analyzeRobotsUrls({
      content: robotsContent,
      urls: [' ', ''],
    });

    assert.deepEqual(result, {
      userAgent: '*',
      urls: [],
      total: 0,
      allowedCount: 0,
      blockedCount: 0,
      invalidCount: 0,
      hosts: [],
      hasMixedHosts: false,
      warningCodes: ['EMPTY_URLS'],
    });
  });
});
