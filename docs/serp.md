# SERP

Search snippet and page title helpers for on-page SEO workflows.

```ts
import { analyzeSerpSnippet, buildPageTitle } from '@jvpdls/seo-tools/serp';
```

## `analyzeSerpSnippet(options)`

Evaluates an SEO title and meta description against length guidelines and optional keyword placement.

```ts
const snippet = analyzeSerpSnippet({
  title: 'How to write a clear project brief',
  description:
    'Learn how to create a clear project brief that helps clients understand scope, timelines, and next steps.',
  keyword: 'project brief',
});

// snippet.overallStatus → "ok" | "needs_improvement"
```

Keyword matching is accent- and case-insensitive.

### Length thresholds

Limits stay **below common SERP cutoffs** to leave margin for pixel-based truncation.

| Part | `short` | `ok` | `long` |
| --- | --- | --- | --- |
| Title | &lt; 30 chars | 30–54 | ≥ 55 |
| Meta description | &lt; 120 chars | 120–154 | ≥ 155 |

### Result

```ts
{
  title: {
    characters: number;
    status: 'short' | 'ok' | 'long';
    hasKeyword: boolean;
    warningCodes: SnippetWarningCode[];
  };
  description: { /* same shape */ };
  overallStatus: 'ok' | 'needs_improvement';
}
```

### Complete response example

```ts
const snippet = analyzeSerpSnippet({
  title: 'Project Brief Template for Agencies',
  description:
    'Use this project brief template to align scope, timelines, goals, stakeholders, and next steps before client work begins.',
  keyword: 'project brief',
});

// {
//   title: {
//     characters: 35,
//     status: "ok",
//     hasKeyword: true,
//     warningCodes: []
//   },
//   description: {
//     characters: 121,
//     status: "ok",
//     hasKeyword: true,
//     warningCodes: []
//   },
//   overallStatus: "ok"
// }
```

`overallStatus` is `needs_improvement` when either part is not `ok` or a keyword warning is present.

### Warning codes

| Code | When |
| --- | --- |
| `TITLE_TOO_SHORT` | Title below 30 characters |
| `TITLE_TOO_LONG` | Title above 54 characters |
| `TITLE_MISSING_KEYWORD` | Keyword provided but not found in title |
| `DESCRIPTION_TOO_SHORT` | Description below 120 characters |
| `DESCRIPTION_TOO_LONG` | Description above 154 characters |
| `DESCRIPTION_MISSING_KEYWORD` | Keyword provided but not found in description |

---

## `buildPageTitle(options)`

Composes a branded `<title>` tag value with optional truncation and length warnings aligned with `analyzeSerpSnippet`.

```ts
const { title, warningCodes } = buildPageTitle({
  pageTitle: 'Project Brief Template',
  brand: 'Agency Name',
  separator: ' | ',
  brandPosition: 'suffix', // or "prefix"
  maxLength: 60,
});

// title → "Project Brief Template | Agency Name"
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `pageTitle` | `string` | — | Primary page title |
| `brand` | `string` | — | Site or brand name; omitted for title-only |
| `separator` | `string` | `' \| '` | Between brand and page title |
| `brandPosition` | `'suffix' \| 'prefix'` | `'suffix'` | Brand placement |
| `maxLength` | `number` | — | Hard truncate; adds `TITLE_TRUNCATED` |

Whitespace is normalized on both parts. An empty brand after normalization is ignored.

### Complete response example

```ts
const pageTitle = buildPageTitle({
  pageTitle: 'How to write a clear project brief for enterprise clients',
  brand: 'Acme Agency',
  separator: ' | ',
  brandPosition: 'suffix',
  maxLength: 54,
});

// {
//   title: "How to write a clear project brief for enterprise clie",
//   characters: 54,
//   warningCodes: ["TITLE_TRUNCATED"]
// }
```

### Warning codes

| Code | When |
| --- | --- |
| `TITLE_TOO_SHORT` | Final title &lt; 30 characters |
| `TITLE_TOO_LONG` | Final title &gt; 54 characters |
| `TITLE_TRUNCATED` | `maxLength` cut the composed title |
