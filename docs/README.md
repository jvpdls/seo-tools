# Documentation

Detailed reference for each domain in `@jvpdls/seo-tools`.

| Domain | Guide | Primary use cases |
| --- | --- | --- |
| Text | [text.md](./text.md) | Slugs, content metrics, keyword density |
| SERP | [serp.md](./serp.md) | Title/meta analysis, branded page titles |
| Headings | [headings.md](./headings.md) | H1–H6 extraction and hierarchy checks |
| URL | [url.md](./url.md) | Canonical URLs, UTM campaign links |
| HTML | [html.md](./html.md) | Markup cleanup, link inventory |

All utilities are **dependency-free**, ship as **ESM**, and return **stable warning codes** you can map to any UI language.

## Import paths

```ts
// Full package
import { createSlug, analyzeSerpSnippet } from '@jvpdls/seo-tools';

// Domain subpaths (smaller mental surface)
import { createSlug } from '@jvpdls/seo-tools/text';
import { analyzeSerpSnippet } from '@jvpdls/seo-tools/serp';
```

Requires **Node.js 18+**.
