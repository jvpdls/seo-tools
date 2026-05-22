# Technical & On-Page SEO Utilities

Type-safe, dependency-free SEO utilities for JavaScript and TypeScript — slugs, SERP checks, heading audits, URL normalization, and HTML link analysis.

Built for **CMS plugins**, **content editors**, **marketing dashboards**, and **CLI tools** that need predictable outputs and stable warning codes (map them to any UI language).

[![npm version](https://img.shields.io/npm/v/@jvpdls/seo-tools)](https://www.npmjs.com/package/@jvpdls/seo-tools)
[![license](https://img.shields.io/npm/l/@jvpdls/seo-tools)](./LICENSE)

## Install

```bash
npm install @jvpdls/seo-tools
```

Requires **Node.js 18+**. ESM only. Zero runtime dependencies.

## Quick start

Ship a slug, validate a SERP snippet, and normalize a campaign URL in a few lines:

```ts
import {
  analyzeSerpSnippet,
  buildUtmUrl,
  createSlug,
  normalizeUrl,
} from '@jvpdls/seo-tools';

// URL-ready slug for a blog post
const { slug } = createSlug({
  text: 'How to write a clear project brief for clients',
  maxWords: 6,
  removeStopwords: true,
});
// → "write-clear-project-brief-clients"

// On-page SEO feedback before publish
const serp = analyzeSerpSnippet({
  title: 'How to write a clear project brief',
  description:
    'Learn how to create a project brief that aligns scope, timelines, and next steps.',
  keyword: 'project brief',
});
// serp.overallStatus → "ok" | "needs_improvement"

// Clean URL for audits or canonical tags
const { normalizedUrl } = normalizeUrl({
  url: 'HTTPS://Example.com/blog/?utm_source=google&id=1#top',
  removeTrackingParams: true,
  forceLowercaseUrl: true,
  removeHash: true,
});
// → "https://example.com/blog/?id=1"

// Trackable link for newsletters
const campaign = buildUtmUrl({
  url: 'https://example.com/guide',
  params: {
    utm_source: 'newsletter',
    utm_medium: 'email',
    utm_campaign: 'brief-guide',
  },
});
// campaign.builtUrl → "https://example.com/guide?utm_source=newsletter&utm_medium=email&utm_campaign=brief-guide"
// campaign.addedParams → ["utm_source", "utm_medium", "utm_campaign"]
// campaign.skippedParams → []
```

Import only what you need via [domain subpaths](#domain-imports) or the [full API table](#api-overview) below.

## API overview

### Text · [text.md](./docs/text.md)

| Function | One-line purpose |
| --- | --- |
| [`createSlug`](./docs/text.md#createslugoptions) | Accent-free, stopword-aware URL slugs |
| [`countTextMetrics`](./docs/text.md#counttextmetricsoptions) | Words, sentences, reading time |
| [`analyzeKeywordDensity`](./docs/text.md#analyzekeyworddensityoptions) | Keyword frequency and density warnings |

### SERP · [serp.md](./docs/serp.md)

| Function | One-line purpose |
| --- | --- |
| [`analyzeSerpSnippet`](./docs/serp.md#analyzesserpsnippetoptions) | Title & meta length + keyword checks |
| [`buildPageTitle`](./docs/serp.md#buildpagetitleoptions) | Branded `<title>` with length warnings |

### Headings · [headings.md](./docs/headings.md)

| Function | One-line purpose |
| --- | --- |
| [`extractHeadings`](./docs/headings.md#extractheadingshtml) | H1–H6 list in document order |
| [`analyzeHeadings`](./docs/headings.md#analyzeheadingsoptions) | Missing/multiple H1, skipped levels |

### URL · [url.md](./docs/url.md)

| Function | One-line purpose |
| --- | --- |
| [`normalizeUrl`](./docs/url.md#normalizeurloptions) | Canonical URLs, strip tracking params |
| [`buildUtmUrl`](./docs/url.md#buildutmurloptions) | Append UTM / campaign query params |

### HTML · [html.md](./docs/html.md)

| Function | One-line purpose |
| --- | --- |
| [`cleanHtml`](./docs/html.md#cleanhtmloptions) | Strip classes, ids, inline styles |
| [`countLinks`](./docs/html.md#countlinksoptions) | Internal, external, nofollow link counts |

### Schema · [schema.md](./docs/schema.md)

| Function | One-line purpose |
| --- | --- |
| [`buildWebsiteSchema`](./docs/schema.md#buildwebsiteschemaoptions) | `WebSite` JSON-LD graph node |
| [`buildWebPageSchema`](./docs/schema.md#buildwebpageschemaoptions) | `WebPage` linked to a site |
| [`buildArticleSchema`](./docs/schema.md#buildarticleschemaoptions) | `Article` / `BlogPosting` / etc. |
| [`buildFaqPageSchema`](./docs/schema.md#buildfaqpageschemaoptions) | `FAQPage` Q&A list |
| [`buildAboutPageSchema`](./docs/schema.md#buildaboutpageschemaoptions) | `AboutPage` + person |
| [`buildContactPageSchema`](./docs/schema.md#buildcontactpageschemaoptions) | `ContactPage` + contact point |

Full reference: **[docs/](./docs/README.md)**

## Domain imports

Tree-shake by domain when bundling editors or microservices:

```ts
import { createSlug } from '@jvpdls/seo-tools/text';
import { analyzeSerpSnippet } from '@jvpdls/seo-tools/serp';
import { analyzeHeadings } from '@jvpdls/seo-tools/headings';
import { normalizeUrl } from '@jvpdls/seo-tools/url';
import { countLinks } from '@jvpdls/seo-tools/html';
import { buildWebsiteSchema } from '@jvpdls/seo-tools/schema';
```

## Why these utilities?

| Need | Utility |
| --- | --- |
| Publish-ready permalink | `createSlug` |
| Editor word count & reading time | `countTextMetrics` |
| Avoid thin or stuffed copy | `analyzeKeywordDensity` |
| Pre-flight title & description | `analyzeSerpSnippet` |
| Consistent branded titles | `buildPageTitle` |
| Content outline / TOC | `extractHeadings` |
| On-page hierarchy QA | `analyzeHeadings` |
| Dedupe URLs in crawls | `normalizeUrl` |
| Campaign links | `buildUtmUrl` |
| Sanitize pasted HTML | `cleanHtml` |
| Internal linking reports | `countLinks` |
| JSON-LD for core page types | `buildWebsiteSchema`, `buildArticleSchema`, … |

All analyzers return **`warningCodes`** — stable string enums you localize in the app layer, not in the library.

## Changelog

### 0.3.0
- Schema: added JSON-LD utilities
- Schema: added builders for `WebSite`, `WebPage`, `Article` (& variations), `FAQPage`, `AboutPage`, and `ContactPage`
- Docs: added schema examples and API reference
- Development: installed and configured eslint

### 0.2.1

- README: clearer project title for GitHub and npm discovery

### 0.2.0

- Domain-based layout (`text`, `serp`, `headings`, `url`, `html` subpaths)
- HTML utilities: `cleanHtml`, `countLinks`
- Text: `analyzeKeywordDensity`
- URL: `buildUtmUrl`
- SERP: `buildPageTitle`
- Per-domain API docs in [`docs/`](./docs/README.md)

## 0.1.1

- Internal cleanup and small package adjustments

## 0.1.0

- Initial release

## Development

```bash
git clone https://github.com/jvpdls/seo-tools.git
cd seo-tools
npm install
npm run build
npm test
```

## License

MIT © [João Santos](https://github.com/jvpdls)
