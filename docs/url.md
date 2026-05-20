# URL

Normalize URLs for technical SEO and build campaign tracking links.

```ts
import { normalizeUrl, buildUtmUrl } from '@jvpdls/seo-tools/url';
```

## `normalizeUrl(options)`

Canonicalizes absolute URLs or path-only inputs and returns parsed parts for auditing.

```ts
const result = normalizeUrl({
  url: 'HTTPS://Example.com/blog/Test-Post/?utm_source=google&id=123#section',
  removeTrackingParams: true,
  forceLowercaseUrl: true,
  removeHash: true,
});

// result.normalizedUrl → "https://example.com/blog/test-post/?id=123"
```

Throws `TypeError` on empty or invalid absolute URLs.

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `removeTrackingParams` | `boolean` | `false` | Strips `utm_*`, `fbclid`, `gclid`, `_ga`, `mc_cid`, `msclkid`, `pk_*`, `mtm_*`, `matomo_*`, `hsa_*`, `WT.mc_id`, and similar |
| `forceLowercaseHost` | `boolean` | `false` | Lowercases hostname only |
| `forceLowercaseUrl` | `boolean` | `false` | Lowercases host, path, query, and hash; overrides `forceLowercaseHost` |
| `removeHash` | `boolean` | `false` | Removes the fragment |

### Result

```ts
{
  originalUrl: string;
  normalizedUrl: string;
  protocol: string | null;
  host: string | null;
  path: string;
  queryParams: Record<string, string | string[]>;
  removedParams: string[];
  urlLowercased: boolean;
  hashRemoved: boolean;
}
```

### Complete response example

```ts
const normalized = normalizeUrl({
  url: 'HTTPS://Example.com/blog/Test-Post/?utm_source=google&utm_medium=cpc&id=123&id=456#Section',
  removeTrackingParams: true,
  forceLowercaseUrl: true,
  removeHash: true,
});

// {
//   originalUrl: "HTTPS://Example.com/blog/Test-Post/?utm_source=google&utm_medium=cpc&id=123&id=456#Section",
//   normalizedUrl: "https://example.com/blog/test-post/?id=123&id=456",
//   protocol: "https",
//   host: "example.com",
//   path: "/blog/test-post/",
//   queryParams: { id: ["123", "456"] },
//   removedParams: ["utm_source", "utm_medium"],
//   urlLowercased: true,
//   hashRemoved: true
// }
```

For path-only input, `protocol` and `host` are `null` and `normalizedUrl` stays a path.

Repeated query keys are preserved as `string[]`.

---

## `buildUtmUrl(options)`

Appends UTM (or custom) query parameters for campaign URLs.

```ts
const campaign = buildUtmUrl({
  url: 'https://example.com/landing',
  params: {
    utm_source: 'newsletter',
    utm_medium: 'email',
    utm_campaign: 'spring-launch',
  },
});
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `params` | `UtmParams` | — | Query params to add; `utm_*` fields are typed, custom keys allowed |
| `overwriteExisting` | `boolean` | `false` | Replace params that already exist on the URL |

Undefined and blank values are skipped. Hash fragments are preserved. Works with absolute URLs and path-only inputs.

### Result

```ts
{
  originalUrl: string;
  builtUrl: string;
  addedParams: string[];
  skippedParams: string[]; // already present when overwrite is false
}
```

### Complete response example

```ts
const campaign = buildUtmUrl({
  url: 'https://example.com/page?id=42&utm_source=existing',
  params: {
    utm_source: 'newsletter',
    utm_medium: 'email',
    utm_campaign: 'spring_sale',
    custom_ref: 'partner_a',
  },
});

// {
//   originalUrl: "https://example.com/page?id=42&utm_source=existing",
//   builtUrl: "https://example.com/page?id=42&utm_source=existing&utm_medium=email&utm_campaign=spring_sale&custom_ref=partner_a",
//   addedParams: ["utm_medium", "utm_campaign", "custom_ref"],
//   skippedParams: ["utm_source"]
// }
```

Throws `TypeError` on empty or invalid URLs.
