# Images

Extract image attributes from raw HTML and run lightweight accessibility and technical audits.

```ts
import {
  analyzeImageAlts,
  analyzeImageDimensions,
  analyzeImageLoading,
  analyzeImages,
  extractImages,
} from '@jvpdls/seo-tools/images';
```

## `extractImages(options)`

Returns a typed list of `<img>` elements and their most useful attributes.

### Result

```ts
{
  images: Array<{
    src: string | null;
    originalSrc: string | null;
    framework: 'next' | null;
    optimizer: 'next' | null;
    alt: string | null;
    width: number | null;
    height: number | null;
    fill: boolean;
    loading: string | null;
    fetchPriority: string | null;
    decoding: string | null;
    title: string | null;
    srcset: string | null;
    sizes: string | null;
    index: number;
  }>;
  warningCodes: ExtractImagesWarningCode[];
}
```

For HTML rendered by `next/image`, `src` keeps the browser-facing optimizer
URL while `originalSrc` contains the decoded source from the optimizer's `url`
parameter. `framework` identifies markup emitted by Next.js, and `optimizer`
identifies URLs served through its built-in `/_next/image` optimizer. For
regular images, `originalSrc` is the same as `src` and both identifier fields
are `null`.

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `html` string |

---

## `analyzeImageAlts(options)`

Counts missing, empty, and duplicate `alt` attributes.

### Result

```ts
{
  total: number;
  missingAlt: number;
  emptyAlt: number;
  duplicateAlt: number;
  warningCodes: ImageAltWarningCode[];
}
```

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `html` string |
| `MISSING_ALT` | One or more images have no `alt` attribute |
| `EMPTY_ALT` | One or more images have an empty `alt` value |
| `DUPLICATE_ALT` | Repeated non-empty `alt` text found |

---

## `analyzeImageDimensions(options)`

Checks whether images declare `width` and `height`, and whether those dimensions are valid positive numbers. Next.js images rendered with `data-nimg="fill"` are treated as dimensionally valid because their dimensions come from the parent container.

### Result

```ts
{
  total: number;
  missingDimensions: number;
  invalidDimensions: number;
  warningCodes: ImageDimensionWarningCode[];
}
```

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `html` string |
| `MISSING_DIMENSIONS` | One or more images are missing `width` and/or `height` |
| `INVALID_DIMENSION_VALUE` | One or more images have non-positive dimensions |

---

## `analyzeImageLoading(options)`

Counts `loading="lazy"`, `loading="eager"`, and missing `loading` attributes. A Next.js image without `loading` (for example, one using `preload`) or any image with `fetchpriority="high"` is counted as eager instead of missing.

### Result

```ts
{
  total: number;
  lazy: number;
  eager: number;
  missingLoading: number;
  warningCodes: ImageLoadingWarningCode[];
}
```

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `html` string |
| `MISSING_LOADING_ATTRIBUTE` | One or more images do not declare `loading` |

---

## `analyzeImages(options)`

Runs the main image checks in one call and returns the original extracted list for downstream automation.

### Next.js example

```ts
const result = analyzeImages({
  html: `
    <img
      src="/_next/image?url=%2Fhero.jpg&amp;w=1200&amp;q=75"
      srcset="/_next/image?url=%2Fhero.jpg&amp;w=640&amp;q=75 1x,
              /_next/image?url=%2Fhero.jpg&amp;w=1200&amp;q=75 2x"
      alt="Hero"
      width="1200"
      height="630"
      data-nimg="1"
      fetchpriority="high"
    />
  `,
});

result.images[0]?.src;
// "/_next/image?url=%2Fhero.jpg&w=1200&q=75"

result.images[0]?.originalSrc;
// "/hero.jpg"
```

### Result

```ts
{
  images: ImageItem[];
  total: number;
  missingAlt: number;
  emptyAlt: number;
  duplicateAlt: number;
  missingDimensions: number;
  invalidDimensions: number;
  lazy: number;
  eager: number;
  missingLoading: number;
  warningCodes: ImageAnalysisWarningCode[];
}
```
