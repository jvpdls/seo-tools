import {
  getHtmlAttributeValue,
  matchSingleHtmlTags,
} from '../../utils/html.js';

import type {
  ExtractImagesOptions,
  ExtractImagesResult,
  ImageItem,
} from './types.js';

const parseDimensionValue = (value: string | undefined): number | null => {
  if (value === undefined) {
    return null;
  }

  const parsedValue = Number.parseInt(value.trim(), 10);

  return Number.isNaN(parsedValue) ? null : parsedValue;
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
    images.push({
      src: getHtmlAttributeValue(tag.attributes, 'src')?.trim() ?? null,
      alt: getHtmlAttributeValue(tag.attributes, 'alt') ?? null,
      width: parseDimensionValue(getHtmlAttributeValue(tag.attributes, 'width')),
      height: parseDimensionValue(getHtmlAttributeValue(tag.attributes, 'height')),
      loading: getHtmlAttributeValue(tag.attributes, 'loading')?.trim().toLowerCase() ?? null,
      decoding: getHtmlAttributeValue(tag.attributes, 'decoding')?.trim().toLowerCase() ?? null,
      title: getHtmlAttributeValue(tag.attributes, 'title') ?? null,
      srcset: getHtmlAttributeValue(tag.attributes, 'srcset') ?? null,
      sizes: getHtmlAttributeValue(tag.attributes, 'sizes') ?? null,
      index: tag.index,
    });
  }

  return {
    images,
    warningCodes: [],
  };
};
