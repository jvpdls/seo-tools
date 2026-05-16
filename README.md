# @joaosantos/seo-tools

Type-safe SEO and content utilities for JavaScript and TypeScript projects.

`@joaosantos/seo-tools` provides small, dependency-free helpers for common SEO and editorial workflows such as slug generation, text normalization and basic content metrics.

## Features

- Generate lowercase, accent-free, URL-friendly slugs.
- Optionally remove English and Brazilian Portuguese stopwords.
- Limit generated slugs by word count.
- Count characters, words, sentences, paragraphs and estimated reading time.
- Analyze SEO title and meta description snippets.
- Use stable warning codes that can be mapped to any UI language.
- Import typed ESM utilities with no runtime dependencies.

## Installation

```bash
npm install @joaosantos/seo-tools
```

## Usage

```ts
import {
  analyzeSeoSnippet,
  countTextMetrics,
  createSlug,
} from '@joaosantos/seo-tools';

const slugResult = createSlug({
  text: 'How to write a clear project brief for clients',
  maxWords: 6,
  removeStopwords: true,
  inputLanguage: 'en',
});

console.log(slugResult.slug);
// write-clear-project-brief-clients

const metrics = countTextMetrics({
  text: 'Learn how to create a professional quote for service clients.',
});

console.log(metrics.words);
// 10

const snippet = analyzeSeoSnippet({
  title: 'How to write a clear project brief',
  description:
    'Learn how to create a clear project brief that helps clients understand scope, timelines, and next steps.',
  keyword: 'project brief',
});

console.log(snippet.overallStatus);
// needs_improvement
```

## Reference

### `createSlug(options)`

Creates a URL-friendly slug from a text input.

```ts
const result = createSlug({
  text: 'Quick budget for Sao Paulo 2026!!!',
  removeStopwords: false,
  inputLanguage: 'en',
});
```

Returns:

```ts
{
  slug: string;
  originalText: string;
  wordCount: number;
  removedStopwords: string[];
  warningCodes: SlugifyWarningCode[];
}
```

Supported input languages:

- `en`
- `pt-BR`

Current warning codes:

- `MAX_WORDS_APPLIED`: the generated slug was truncated because `maxWords` was reached.

### `countTextMetrics(options)`

Returns basic text metrics.

```ts
const metrics = countTextMetrics({
  text: 'First sentence.\n\nSecond paragraph!',
});
```

Returns:

```ts
{
  characters: number;
  charactersWithoutSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  estimatedReadingTimeMinutes: number;
}
```

By default, reading time uses `200` words per minute. You can override it with `wordsPerMinute`.

```ts
countTextMetrics({
  text: 'A long article...',
  wordsPerMinute: 250,
});
```

### `analyzeSeoSnippet(options)`

Analyzes a title and meta description using simple SEO guidelines.

```ts
const snippet = analyzeSeoSnippet({
  title: 'Project Brief Template for Agencies',
  description:
    'Use this project brief template to align scope, timelines, goals, stakeholders, and next steps before client work begins.',
  keyword: 'project brief',
});
```

Returns:

```ts
{
  title: {
    characters: number;
    status: 'short' | 'ok' | 'long';
    hasKeyword: boolean;
    warningCodes: SnippetWarningCode[];
  };
  description: {
    characters: number;
    status: 'short' | 'ok' | 'long';
    hasKeyword: boolean;
    warningCodes: SnippetWarningCode[];
  };
  overallStatus: 'ok' | 'needs_improvement';
}
```

Title status uses these character ranges:

- `short`: fewer than 30 characters
- `ok`: 30 to 54 characters
- `long`: 55 characters or more

Meta description status uses these character ranges:

- `short`: fewer than 120 characters
- `ok`: 120 to 154 characters
- `long`: 155 characters or more

The upper limits intentionally stay below 55 characters for titles and below 155 characters for meta descriptions to leave a margin for search engines that measure snippets by pixel width.

Current snippet warning codes:

- `TITLE_TOO_SHORT`
- `TITLE_TOO_LONG`
- `DESCRIPTION_TOO_SHORT`
- `DESCRIPTION_TOO_LONG`

## Text Helpers

The package also exports lower-level helpers:

- `normalizeWhitespace`
- `removeDiacritics`
- `normalizeTextToken`
- `getSlugWords`
- `joinSlugWords`
- `countNonWhitespaceCharacters`
- `countWords`
- `countSentences`
- `countParagraphs`
- `estimateReadingTimeMinutes`

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT © João Santos
