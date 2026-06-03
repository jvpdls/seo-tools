# Sitemap

Parse raw sitemap XML into URLs, metadata, and lightweight diagnostics.

```ts
import {
  analyzeSitemap,
  detectSitemapType,
  extractChildSitemaps,
  extractSitemapMetadata,
  extractSitemapUrls,
} from '@jvpdls/seo-tools/sitemap';
```

## `detectSitemapType(options)`

Detects whether the input looks like a `urlset`, `sitemapindex`, or an unknown document.

### Result

```ts
{
  type: 'urlset' | 'sitemapindex' | 'unknown';
  warningCodes: DetectSitemapTypeWarningCode[];
}
```

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `xml` string |

---

## `extractSitemapUrls(options)`

Returns the `loc` values from `<url>` entries in a sitemap document.

### Result

```ts
{
  urls: string[];
  warningCodes: ExtractSitemapUrlsWarningCode[];
}
```

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `xml` string |

---

## `extractSitemapMetadata(options)`

Returns full metadata for `<url>` entries.

### Result

```ts
{
  urls: Array<{
    loc: string;
    lastmod: string | null;
    changefreq: string | null;
    priority: number | null;
  }>;
  warningCodes: ExtractSitemapMetadataWarningCode[];
}
```

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `xml` string |

---

## `extractChildSitemaps(options)`

Returns child sitemap declarations from `<sitemapindex>` documents.

### Result

```ts
{
  sitemaps: Array<{
    loc: string;
    lastmod: string | null;
  }>;
  warningCodes: ExtractChildSitemapsWarningCode[];
}
```

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `xml` string |

---

## `analyzeSitemap(options)`

Runs a compact sitemap audit covering type, entry counts, duplicates, invalid URLs, and invalid priorities.

### Result

```ts
{
  type: SitemapType;
  totalUrls: number;
  totalChildSitemaps: number;
  duplicateUrls: string[];
  invalidUrls: string[];
  invalidPriorityCount: number;
  hasLastmod: boolean;
  hasChangefreq: boolean;
  hasPriority: boolean;
  warningCodes: AnalyzeSitemapWarningCode[];
}
```

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `xml` string |
| `UNKNOWN_SITEMAP_TYPE` | Root element does not look like `urlset` or `sitemapindex` |
| `MISSING_URLS` | A `urlset` has no `<url>` entries |
| `MISSING_CHILD_SITEMAPS` | A `sitemapindex` has no `<sitemap>` entries |
| `DUPLICATE_URLS` | Duplicate `<loc>` values found in URL entries |
| `INVALID_URL` | One or more `loc` values are not absolute URLs |
| `INVALID_PRIORITY` | One or more priorities are outside the `0..1` range |
