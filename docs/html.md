# HTML

Lightweight HTML utilities for content cleanup and link audits—no DOM parser required.

```ts
import { cleanHtml, countLinks } from '@jvpdls/seo-tools/html';
```

## `cleanHtml(options)`

Strips or filters attributes while preserving text content and tag structure.

```ts
const { html, warningCodes } = cleanHtml({
  html: '<p class="lead" id="intro" style="color:red">Hello</p>',
  removeClasses: true,
  removeIds: true,
  removeStyle: true,
  removeDataAttributes: true,
  collapseWhitespace: true,
  removeEmptyTags: true,
});

// html → "<p>Hello</p>"
```

### Complete response example

```ts
const cleaned = cleanHtml({
  html: '<section class="hero"><p id="intro" style="color:red" data-test="x">Hello <strong>world</strong></p><p></p></section>',
  removeClasses: true,
  removeIds: true,
  removeStyle: true,
  removeDataAttributes: true,
  collapseWhitespace: true,
  removeEmptyTags: true,
});

// {
//   html: "<section><p>Hello <strong>world</strong></p></section>",
//   warningCodes: []
// }
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `removeClasses` | `boolean` | `false` | Remove `class` attributes |
| `removeIds` | `boolean` | `false` | Remove `id` attributes |
| `removeStyle` | `boolean` | `false` | Remove `style` attributes |
| `removeDataAttributes` | `boolean` | `false` | Remove `data-*` attributes |
| `removeAttributes` | `string[]` | — | Explicit deny list |
| `keepAttributes` | `string[]` | — | Allow list; takes precedence over remove flags |
| `collapseWhitespace` | `boolean` | `false` | Collapse inter-tag and repeated spaces |
| `removeEmptyTags` | `boolean` | `false` | Remove tags with no text content |

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `html` string |
| `MALFORMED_HTML` | Obviously broken markup (e.g. `<>`, stray brackets) |

---

## `countLinks(options)`

Inventory `<a href>` links in HTML with internal/external classification.

```ts
const links = countLinks({
  html: pageHtml,
  baseUrl: 'https://example.com/blog/post',
});
```

### Complete response example

```ts
const links = countLinks({
  html: `
    <a href="/pricing">Pricing</a>
    <a href="https://docs.example.com/guide">Docs</a>
    <a href="mailto:hello@example.com">Email</a>
    <a href="tel:+5511999999999">Phone</a>
    <a href="https://external-site.com" rel="nofollow sponsored">Partner</a>
    <a href="#"> </a>
    <a>Missing href</a>
  `,
  baseUrl: 'https://example.com/blog/post',
});

// {
//   total: 7,
//   internal: 2,
//   external: 2,
//   mailto: 1,
//   tel: 1,
//   nofollow: 1,
//   emptyAnchor: 1,
//   invalidHref: 1,
//   warningCodes: []
// }
```

Provide `baseUrl` to resolve relative `href` values and compare hostnames. Without it, absolute `http(s)` links count as external; relative paths stay unclassified for internal/external totals.

### Result

```ts
{
  total: number;
  internal: number;
  external: number;
  mailto: number;
  tel: number;
  nofollow: number;
  emptyAnchor: number;
  invalidHref: number;
  warningCodes: CountLinksWarningCode[];
}
```

- **nofollow**: `rel` contains a `nofollow` token (comma- or space-separated).
- **emptyAnchor**: no usable text after stripping nested markup.
- **invalidHref**: missing `href`, invalid schemes, or unresolvable values.
- **mailto** / **tel**: not counted as internal or external.

HTML entities in `href` are decoded before resolution.

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `html` string |
