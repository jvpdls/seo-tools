# Headings

Extract and audit H1–H6 structure from HTML strings.

```ts
import { analyzeHeadings, extractHeadings } from '@jvpdls/seo-tools/headings';
```

## `extractHeadings(html)`

Returns heading nodes in document order without hierarchy analysis.

```ts
const headings = extractHeadings(
  '<h1>Guide</h1><h2 class="mt-4">Chapter</h2>',
);

// [{ level: 1, text: "Guide" }, { level: 2, text: "Chapter" }]
```

### Complete response example

```ts
const headings = extractHeadings(`
  <h1>Technical SEO Checklist</h1>
  <h2>Canonical setup</h2>
  <h3>Absolute canonical URL</h3>
  <h2><span>Internal linking</span></h2>
`);

// [
//   { level: 1, text: "Technical SEO Checklist" },
//   { level: 2, text: "Canonical setup" },
//   { level: 3, text: "Absolute canonical URL" },
//   { level: 2, text: "Internal linking" }
// ]
```

- Nested markup inside headings is stripped to plain text.
- Common HTML entities are decoded.
- Empty headings after cleanup are skipped.
- Tags are matched case-insensitively; attributes are allowed.

---

## `analyzeHeadings(options)`

Runs `extractHeadings` and adds structural SEO checks.

```ts
const result = analyzeHeadings({
  html: '<h1>How to write a clear project brief</h1><h2>What to include</h2>',
});

// result.hasH1 → true
// result.hasSkippedLevels → false
```

### Result

```ts
{
  hasH1: boolean;
  h1Count: number;
  hasMultipleH1: boolean;
  hasSkippedLevels: boolean;
  headings: HeadingItem[];
  warningCodes: HeadingWarningCode[];
}
```

### Complete response example

```ts
const result = analyzeHeadings({
  html: `
    <h2>Intro</h2>
    <h1>Main topic</h1>
    <h3>Details</h3>
    <h5>Skipped level</h5>
    <h1>Another main topic</h1>
  `,
});

// {
//   hasH1: true,
//   h1Count: 2,
//   hasMultipleH1: true,
//   hasSkippedLevels: true,
//   headings: [
//     { level: 2, text: "Intro" },
//     { level: 1, text: "Main topic" },
//     { level: 3, text: "Details" },
//     { level: 5, text: "Skipped level" },
//     { level: 1, text: "Another main topic" }
//   ],
//   warningCodes: ["MULTIPLE_H1", "SKIPPED_HEADING_LEVEL"]
// }
```

### Warning codes

| Code | When |
| --- | --- |
| `MISSING_H1` | No H1 in the document |
| `MULTIPLE_H1` | More than one H1 |
| `SKIPPED_HEADING_LEVEL` | Level jumps (e.g. H1 → H3 without H2) |

Skipped levels are detected in document order: each heading must not be more than one level deeper than the previous non-skipped level in the chain.
