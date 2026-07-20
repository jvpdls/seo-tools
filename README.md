# Technical & On-Page SEO Utilities

Type-safe, dependency-free SEO utilities for JavaScript and TypeScript — slugs, SERP checks, heading audits, URL normalization, metadata extraction, image audits, `robots.txt` parsing, sitemap extraction, and more.

Built for **CMS plugins**, **content editors**, **marketing dashboards**, and **CLI tools** that need predictable outputs and stable warning codes (map them to any UI language).

[![npm version](https://img.shields.io/npm/v/@jvpdls/seo-tools)](https://www.npmjs.com/package/@jvpdls/seo-tools)
[![license](https://img.shields.io/npm/l/@jvpdls/seo-tools)](./LICENSE)

## Install

```bash
npm install @jvpdls/seo-tools
```

Requires **Node.js 18+**. ESM only. Zero runtime dependencies.

## Quick start

Ship a slug, validate a SERP snippet, and parse technical SEO inputs in a few lines:

```ts
import {
  analyzeImages,
  analyzeMetaTags,
  analyzeSerpSnippet,
  buildUtmUrl,
  createSlug,
  extractSitemapUrls,
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

// Head metadata snapshot
const meta = analyzeMetaTags({
  html: `
    <title>Internal SEO Tool</title>
    <meta name="description" content="Fast technical SEO checks." />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://example.com/tool" />
  `,
});
// meta.warningCodes → []

// Extract sitemap URLs
const sitemap = extractSitemapUrls({
  xml: `
    <urlset>
      <url><loc>https://example.com/</loc></url>
      <url><loc>https://example.com/blog</loc></url>
    </urlset>
  `,
});
// sitemap.urls → ["https://example.com/", "https://example.com/blog"]

// Aggregate image checks
const images = analyzeImages({
  html: '<img src="/hero.jpg" alt="Hero" width="1200" height="630" loading="lazy" />',
});
// images.warningCodes → []
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

### Meta · [meta.md](./docs/meta.md)

| Function | One-line purpose |
| --- | --- |
| [`extractMetaTags`](./docs/meta.md#extractmetatagsoptions) | Normalize raw `<meta>` tags |
| [`extractCanonical`](./docs/meta.md#extractcanonicaloptions) | Read canonical links and duplicate counts |
| [`extractMetaRobots`](./docs/meta.md#extractmetarobotsoptions) | Parse `meta[name="robots"]` directives |
| [`analyzeMetaTags`](./docs/meta.md#analyzemetatagsoptions) | Compact title/description/canonical/robots audit |

### Images · [images.md](./docs/images.md)

| Function | One-line purpose |
| --- | --- |
| [`extractImages`](./docs/images.md#extractimagesoptions) | Extract `<img>` attributes into typed objects |
| [`analyzeImageAlts`](./docs/images.md#analyzeimagealtsoptions) | Missing, empty, duplicate `alt` counts |
| [`analyzeImageDimensions`](./docs/images.md#analyzeimagedimensionsoptions) | Width / height presence and validity |
| [`analyzeImageLoading`](./docs/images.md#analyzeimageloadingoptions) | Lazy / eager / missing loading counts |
| [`analyzeImages`](./docs/images.md#analyzeimagesoptions) | Aggregate image audit payload |

### Robots · [robots.md](./docs/robots.md)

| Function | One-line purpose |
| --- | --- |
| [`extractRobotsRules`](./docs/robots.md#extractrobotsrulesoptions) | Parse grouped `robots.txt` directives |
| [`extractRobotsSitemaps`](./docs/robots.md#extractrobotssitemapsoptions) | Extract sitemap declarations from `robots.txt` |
| [`analyzeRobotsRules`](./docs/robots.md#analyzerobotsrulesoptions) | Summarize rules, groups, sitemaps, and user-agents |
| [`analyzeRobotsUrls`](./docs/robots.md#analyzerobotsurlsoptions) | Audit one or more URLs against `robots.txt` |
| [`matchRobotsPath`](./docs/robots.md#matchrobotspathoptions) | Evaluate allow/disallow for a given path |

### Sitemap · [sitemap.md](./docs/sitemap.md)

| Function | One-line purpose |
| --- | --- |
| [`detectSitemapType`](./docs/sitemap.md#detectsitemaptypeoptions) | Detect `urlset` vs `sitemapindex` |
| [`extractSitemapUrls`](./docs/sitemap.md#extractsitemapurlsoptions) | Return URL entries from sitemap XML |
| [`extractSitemapMetadata`](./docs/sitemap.md#extractsitemapmetadataoptions) | Return `loc`, `lastmod`, `changefreq`, `priority` |
| [`extractChildSitemaps`](./docs/sitemap.md#extractchildsitemapsoptions) | Return child sitemaps from indexes |
| [`analyzeSitemap`](./docs/sitemap.md#analyzesitemapoptions) | Compact sitemap diagnostics |

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
import { analyzeMetaTags } from '@jvpdls/seo-tools/meta';
import { analyzeImages } from '@jvpdls/seo-tools/images';
import { analyzeRobotsRules } from '@jvpdls/seo-tools/robots';
import { extractSitemapUrls } from '@jvpdls/seo-tools/sitemap';
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
| Head metadata audit | `analyzeMetaTags` |
| Image accessibility / loading checks | `analyzeImages` |
| Parse `robots.txt` | `extractRobotsRules`, `matchRobotsPath` |
| Parse sitemap XML | `extractSitemapUrls`, `analyzeSitemap` |
| JSON-LD for core page types | `buildWebsiteSchema`, `buildArticleSchema`, … |

All analyzers return **`warningCodes`** — stable string enums you localize in the app layer, not in the library.

## Changelog

### 0.4.1

- Images: recover original sources from Next.js `/_next/image` URLs, including `overrideSrc` output
- Images: recognize Next.js `fill`, preload, and high fetch priority without false missing-dimension or missing-loading warnings

### 0.4.0

- Meta: added metadata extraction and audits (`extractMetaTags`, `extractCanonical`, `extractMetaRobots`, `analyzeMetaTags`)
- Images: added `<img>` extraction and image audits (`extractImages`, `analyzeImageAlts`, `analyzeImageDimensions`, `analyzeImageLoading`, `analyzeImages`)
- Robots: added `robots.txt` parsing, sitemap extraction, path matching, and batch URL audits (`extractRobotsRules`, `extractRobotsSitemaps`, `analyzeRobotsRules`, `analyzeRobotsUrls`, `matchRobotsPath`)
- Sitemap: added XML extraction and diagnostics (`detectSitemapType`, `extractSitemapUrls`, `extractSitemapMetadata`, `extractChildSitemaps`, `analyzeSitemap`)
- Docs: added new domain guides for meta, images, robots, and sitemap

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
