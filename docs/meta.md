# Meta

Extract and audit page-level metadata from raw HTML.

```ts
import {
  analyzeMetaTags,
  extractCanonical,
  extractMetaRobots,
  extractMetaTags,
} from '@jvpdls/seo-tools/meta';
```

## `extractMetaTags(options)`

Returns normalized `<meta>` tags declared through `name`, `property`, `http-equiv`, or `charset`.

### Result

```ts
{
  metaTags: Array<{
    attribute: 'name' | 'property' | 'http-equiv' | 'charset';
    key: string;
    content: string | null;
    index: number;
  }>;
  warningCodes: ExtractMetaTagsWarningCode[];
}
```

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `html` string |

---

## `extractCanonical(options)`

Extracts the first canonical URL and reports whether multiple canonical links were found.

### Result

```ts
{
  canonicalUrl: string | null;
  occurrences: number;
  warningCodes: CanonicalWarningCode[];
}
```

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `html` string |
| `MISSING_CANONICAL` | No canonical link found |
| `MULTIPLE_CANONICAL` | More than one canonical link found |

---

## `extractMetaRobots(options)`

Extracts the first `meta[name="robots"]` tag and parses its directives.

### Result

```ts
{
  content: string | null;
  directives: string[];
  occurrences: number;
  warningCodes: MetaRobotsWarningCode[];
}
```

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `html` string |
| `MISSING_META_ROBOTS` | No `meta[name="robots"]` tag found |

---

## `analyzeMetaTags(options)`

Runs a compact metadata audit over title, description, canonical, robots, Open Graph, and Twitter tags.

### Result

```ts
{
  title: string | null;
  titleCount: number;
  metaDescription: string | null;
  metaDescriptionCount: number;
  canonicalUrl: string | null;
  canonicalCount: number;
  robotsContent: string | null;
  robotsDirectives: string[];
  metaTags: MetaTagEntry[];
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
  warningCodes: MetaAnalysisWarningCode[];
}
```

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `html` string |
| `MISSING_TITLE` | No `<title>` tag found |
| `MULTIPLE_TITLES` | More than one `<title>` tag found |
| `MISSING_META_DESCRIPTION` | No description tag found |
| `MULTIPLE_META_DESCRIPTIONS` | More than one description tag found |
| `MISSING_CANONICAL` | No canonical link found |
| `MULTIPLE_CANONICAL` | More than one canonical link found |
| `MISSING_META_ROBOTS` | No `meta[name="robots"]` tag found |
