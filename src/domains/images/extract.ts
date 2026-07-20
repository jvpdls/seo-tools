import {
  getHtmlAttributeValue,
  matchSingleHtmlTags,
} from '../../utils/html.js';

import type {
  ExtractImagesOptions,
  ExtractImagesResult,
  ImageItem,
  ImageOptimizer,
} from './types.js';

const NEXT_IMAGE_PATH_PATTERN = /(?:^|\/)_next\/image\/?$/;

const parseDimensionValue = (value: string | undefined): number | null => {
  if (value === undefined) {
    return null;
  }

  const parsedValue = Number.parseInt(value.trim(), 10);

  return Number.isNaN(parsedValue) ? null : parsedValue;
};

const extractNextImageSource = (
  url: string | null,
  dataNimg: string | null,
): string | null => {
  if (url === null) {
    return null;
  }

  try {
    const parsedUrl = new URL(url, 'https://seo-tools.invalid');
    const isDefaultNextOptimizer = NEXT_IMAGE_PATH_PATTERN.test(
      parsedUrl.pathname,
    );
    const isNextImageWithOptimizerParameters =
      dataNimg !== null &&
      parsedUrl.searchParams.has('url') &&
      parsedUrl.searchParams.has('w');

    if (!isDefaultNextOptimizer && !isNextImageWithOptimizerParameters) {
      return null;
    }

    return parsedUrl.searchParams.get('url');
  } catch {
    return null;
  }
};

const getSrcsetUrls = (srcset: string | null): string[] => {
  if (srcset === null) {
    return [];
  }

  return srcset
    .split(',')
    .map((candidate) => candidate.trim().split(/\s+/, 1)[0] ?? '')
    .filter((candidate) => candidate.length > 0);
};

const getImageSourceDetails = ({
  src,
  srcset,
  dataNimg,
}: {
  src: string | null;
  srcset: string | null;
  dataNimg: string | null;
}): {
  originalSrc: string | null;
  optimizer: ImageOptimizer | null;
} => {
  const candidates = src === null
    ? getSrcsetUrls(srcset)
    : [src, ...getSrcsetUrls(srcset)];

  for (const candidate of candidates) {
    const originalSrc = extractNextImageSource(candidate, dataNimg);

    if (originalSrc !== null) {
      return {
        originalSrc,
        optimizer: 'next',
      };
    }
  }

  return {
    originalSrc: src,
    optimizer: null,
  };
};

export const extractImages = ({
  html,
}: ExtractImagesOptions): ExtractImagesResult => {
  if (html.trim().length === 0) {
    return {
      images: [],
      warningCodes: ['EMPTY_INPUT'],
    };
  }

  const images: ImageItem[] = [];

  for (const tag of matchSingleHtmlTags(html, 'img')) {
    const src = getHtmlAttributeValue(tag.attributes, 'src')?.trim() ?? null;
    const srcset = getHtmlAttributeValue(tag.attributes, 'srcset') ?? null;
    const dataNimg =
      getHtmlAttributeValue(tag.attributes, 'data-nimg')?.trim().toLowerCase() ??
      null;
    const sourceDetails = getImageSourceDetails({
      src,
      srcset,
      dataNimg,
    });

    images.push({
      src,
      ...sourceDetails,
      framework:
        dataNimg !== null || sourceDetails.optimizer === 'next' ? 'next' : null,
      alt: getHtmlAttributeValue(tag.attributes, 'alt') ?? null,
      width: parseDimensionValue(getHtmlAttributeValue(tag.attributes, 'width')),
      height: parseDimensionValue(getHtmlAttributeValue(tag.attributes, 'height')),
      fill: dataNimg === 'fill',
      loading: getHtmlAttributeValue(tag.attributes, 'loading')?.trim().toLowerCase() ?? null,
      fetchPriority:
        getHtmlAttributeValue(tag.attributes, 'fetchpriority')
          ?.trim()
          .toLowerCase() ?? null,
      decoding: getHtmlAttributeValue(tag.attributes, 'decoding')?.trim().toLowerCase() ?? null,
      title: getHtmlAttributeValue(tag.attributes, 'title') ?? null,
      srcset,
      sizes: getHtmlAttributeValue(tag.attributes, 'sizes') ?? null,
      index: tag.index,
    });
  }

  return {
    images,
    warningCodes: [],
  };
};
