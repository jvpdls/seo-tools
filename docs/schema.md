# Schema (JSON-LD)

Builders for valid Schema.org JSON-LD graphs. Each function returns a plain object you can `JSON.stringify`, pass to a `<script type="application/ld+json">`, or merge into a larger `@graph`.

```ts
import { buildWebsiteSchema, buildWebPageSchema } from '@jvpdls/seo-tools/schema';
```

## Design

- **`@context`** is always `https://schema.org`.
- **Required options** are the top-level fields needed for a functional node (`id`, `url`, `name`, etc.).
- **Optional nested objects** are only emitted when at least one sub-property is provided (empty `{}` is ignored).
- **Optional sub-properties** inside those objects are all optional; only defined values appear in the output.
- Return type is **`JsonLdDocument<T>`** — a typed object, not a pre-stringified payload.

## `buildWebsiteSchema(options)`

| Required | Optional |
| --- | --- |
| `id`, `url`, `name` | `description`, `publisher` (`name?`, `type?`) |

## `buildWebPageSchema(options)`

| Required | Optional |
| --- | --- |
| `id`, `url`, `name` | `description`, `websiteId` → `isPartOf` |

## `buildArticleSchema(options)`

| Required | Optional |
| --- | --- |
| `id`, `pageId`, `headline`, `image`, `datePublished` | `articleType`, `description`, `dateModified`, `author` (`name?`, `url?`, `type?`), `publisher` (`name?`, `logoUrl?`, `url?`) |

- **`articleType`**: `Article` (default), `BlogPosting`, `NewsArticle`, `TechArticle`
- **`image`**: `string` or `string[]`
- **`logoUrl`** is emitted as `publisher.logo` (`ImageObject`)

## `buildFaqPageSchema(options)`

| Required | Optional |
| --- | --- |
| `questions` (`{ name, answer }[]`) | `id` |

Matches Google FAQ requirements: `mainEntity` → `Question.name` + `acceptedAnswer.text`.

## `buildAboutPageSchema(options)`

| Required | Optional |
| --- | --- |
| `id`, `url`, `name` | `description`, `websiteId` → `isPartOf`, `about` (`name?`, `url?`) |

## `buildContactPageSchema(options)`

| Required | Optional |
| --- | --- |
| `id`, `url`, `name` | `description`, `websiteId` → `isPartOf`, `organization` (`name?`, `url?`), `contactPoint` (`email?`, `contactType?`, `availableLanguage?`) |

`about` (Organization) is emitted only when `organization` and/or `contactPoint` has at least one sub-property.

## Usage patterns

```ts
// Inject in HTML (React, etc.)
const json = JSON.stringify(buildWebsiteSchema({ id: '...', url: '...', name: '...' }));

// Keep as object for CMS APIs
const graph = [buildWebsiteSchema({ ... }), buildWebPageSchema({ ... })];
```

## Constants

- `SCHEMA_ORG_CONTEXT` — `'https://schema.org'`
- `DEFAULT_CONTACT_TYPE` — `'customer support'` (reference default; not auto-injected)
