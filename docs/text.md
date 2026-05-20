# Text

Slug generation, editorial metrics, and keyword density analysis.

```ts
import { createSlug, countTextMetrics, analyzeKeywordDensity } from '@jvpdls/seo-tools/text';
```

## `createSlug(options)`

Builds a lowercase, accent-free, URL-friendly slug from plain text.

```ts
const result = createSlug({
  text: 'How to write a clear project brief for clients',
  maxWords: 6,
  removeStopwords: true,
  inputLanguage: 'en',
});

// result.slug → "write-clear-project-brief-clients"
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | — | Source text |
| `maxWords` | `number` | unlimited | Truncates the slug after N words |
| `removeStopwords` | `boolean` | `false` | Removes language stopwords before slugging |
| `inputLanguage` | `'en' \| 'pt-BR'` | `'en'` | Stopword list to use |

### Result

```ts
{
  slug: string;
  originalText: string;
  wordCount: number;
  removedStopwords: string[];
  warningCodes: SlugifyWarningCode[];
}
```

### Complete response examples
### English
```ts
const englishResult = createSlug({
  text: 'How to write a clear project brief for clients',
  maxWords: 6,
  removeStopwords: true,
  inputLanguage: 'en',
});

// {
//   slug: "write-clear-project-brief-clients",
//   originalText: "How to write a clear project brief for clients",
//   wordCount: 5,
//   removedStopwords: ["how", "to", "a", "for"],
//   warningCodes: []
// }
```
### Portuguese
```ts
const ptBrResult = createSlug({
  text: 'Como abordar um cliente pelo WhatsApp sem ser invasivo?',
  maxWords: 3,
  removeStopwords: true,
  inputLanguage: 'pt-BR',
});

// {
//   slug: "abordar-cliente-whatsapp",
//   originalText: "Como abordar um cliente pelo WhatsApp sem ser invasivo?",
//   wordCount: 3,
//   removedStopwords: ["como", "um", "pelo", "sem", "ser"],
//   warningCodes: ["MAX_WORDS_APPLIED"]
// }
```

### Warning codes

| Code | When |
| --- | --- |
| `MAX_WORDS_APPLIED` | `maxWords` truncated the slug |

Stopwords are normalized (accents removed, lowercased) before matching.

---

## `countTextMetrics(options)`

Returns character, word, sentence, paragraph, and reading-time metrics.

```ts
const metrics = countTextMetrics({
  text: 'Learn how to create a professional quote for service clients.',
  wordsPerMinute: 200, // default
});
```

### Result

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

### Complete response example

```ts
const metrics = countTextMetrics({
  text: 'First sentence.\n\nSecond paragraph with extra context.',
  wordsPerMinute: 200,
});

// {
//   characters: 53,
//   charactersWithoutSpaces: 46,
//   words: 7,
//   sentences: 2,
//   paragraphs: 2,
//   estimatedReadingTimeMinutes: 1
// }
```

Duplicated spaces are normalized for linguistic counts; raw character counts reflect the original string.

---

## `analyzeKeywordDensity(options)`

Measures how often target keywords appear in body copy. Supports single tokens and multi-word phrases with accent-insensitive matching.

```ts
const density = analyzeKeywordDensity({
  text: articleHtml,
  keywords: ['project brief', 'scope'],
  stripHtml: true,
  thresholds: { minDensity: 0.5, maxDensity: 3 },
});
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | — | Content to analyze |
| `keywords` | `string[]` | — | One or more keywords/phrases |
| `stripHtml` | `boolean` | `false` | Strips tags before tokenizing |
| `thresholds.minDensity` | `number` | `0.5` | Minimum acceptable density (%) |
| `thresholds.maxDensity` | `number` | `3` | Maximum acceptable density (%) |
| `inputLanguage` | `'en' \| 'pt-BR'` | — | Reserved for future token rules |

### Result

```ts
{
  totalWords: number;
  keywords: Array<{
    keyword: string;
    occurrences: number;
    density: number; // percentage, rounded to 2 decimals
    warningCodes: KeywordDensityWarningCode[];
  }>;
  warningCodes: KeywordDensityAnalysisWarningCode[];
}
```

### Complete response example

```ts
const density = analyzeKeywordDensity({
  text: '<p>Project brief scope and timeline.</p><p>The project brief improves scope alignment.</p>',
  keywords: ['project brief', 'scope', 'roadmap'],
  stripHtml: true,
  thresholds: { minDensity: 0.5, maxDensity: 3 },
});

// {
//   totalWords: 11,
//   keywords: [
//     {
//       keyword: "project brief",
//       occurrences: 2,
//       density: 18.18,
//       warningCodes: ["DENSITY_TOO_HIGH"]
//     },
//     {
//       keyword: "scope",
//       occurrences: 2,
//       density: 18.18,
//       warningCodes: ["DENSITY_TOO_HIGH"]
//     },
//     {
//       keyword: "roadmap",
//       occurrences: 0,
//       density: 0,
//       warningCodes: ["KEYWORD_NOT_FOUND"]
//     }
//   ],
//   warningCodes: []
// }
```

### Warning codes

**Per keyword**

| Code | When |
| --- | --- |
| `KEYWORD_NOT_FOUND` | Zero occurrences |
| `DENSITY_TOO_LOW` | Below `minDensity` |
| `DENSITY_TOO_HIGH` | Above `maxDensity` |

**Analysis-level**

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | No text after trim (and optional HTML strip) |
| `NO_KEYWORDS` | Empty or all-blank keyword list |
