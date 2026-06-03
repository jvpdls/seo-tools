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
    alt: string | null;
    width: number | null;
    height: number | null;
    loading: string | null;
    decoding: string | null;
    title: string | null;
    srcset: string | null;
    sizes: string | null;
    index: number;
  }>;
  warningCodes: ExtractImagesWarningCode[];
}
```

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

Checks whether images declare `width` and `height`, and whether those dimensions are valid positive numbers.

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

Counts `loading="lazy"`, `loading="eager"`, and missing `loading` attributes.

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
