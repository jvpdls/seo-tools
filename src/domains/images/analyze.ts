import { extractImages } from './extract.js';

import type {
  AnalyzeImageAltsOptions,
  AnalyzeImageAltsResult,
  AnalyzeImageDimensionsOptions,
  AnalyzeImageDimensionsResult,
  AnalyzeImageLoadingOptions,
  AnalyzeImageLoadingResult,
  AnalyzeImagesOptions,
  ImageAnalysisWarningCode,
  ImagesAnalysis,
} from './types.js';

const pushUnique = <T extends string>(warningCodes: T[], warningCode: T): void => {
  if (!warningCodes.includes(warningCode)) {
    warningCodes.push(warningCode);
  }
};

export const analyzeImageAlts = ({
  html,
}: AnalyzeImageAltsOptions): AnalyzeImageAltsResult => {
  if (html.trim().length === 0) {
    return {
      total: 0,
      missingAlt: 0,
      emptyAlt: 0,
      duplicateAlt: 0,
      warningCodes: ['EMPTY_INPUT'],
    };
  }

  const { images } = extractImages({ html });
  const altOccurrences = new Map<string, number>();

  for (const image of images) {
    const alt = image.alt?.trim();

    if (alt !== undefined && alt !== null && alt.length > 0) {
      altOccurrences.set(alt, (altOccurrences.get(alt) ?? 0) + 1);
    }
  }

  let missingAlt = 0;
  let emptyAlt = 0;
  let duplicateAlt = 0;

  for (const image of images) {
    if (image.alt === null) {
      missingAlt += 1;
      continue;
    }

    const normalizedAlt = image.alt.trim();

    if (normalizedAlt.length === 0) {
      emptyAlt += 1;
      continue;
    }

    if ((altOccurrences.get(normalizedAlt) ?? 0) > 1) {
      duplicateAlt += 1;
      altOccurrences.set(normalizedAlt, 1);
    }
  }

  const warningCodes: AnalyzeImageAltsResult['warningCodes'] = [];

  if (missingAlt > 0) {
    warningCodes.push('MISSING_ALT');
  }

  if (emptyAlt > 0) {
    warningCodes.push('EMPTY_ALT');
  }

  if (duplicateAlt > 0) {
    warningCodes.push('DUPLICATE_ALT');
  }

  return {
    total: images.length,
    missingAlt,
    emptyAlt,
    duplicateAlt,
    warningCodes,
  };
};

export const analyzeImageDimensions = ({
  html,
}: AnalyzeImageDimensionsOptions): AnalyzeImageDimensionsResult => {
  if (html.trim().length === 0) {
    return {
      total: 0,
      missingDimensions: 0,
      invalidDimensions: 0,
      warningCodes: ['EMPTY_INPUT'],
    };
  }

  const { images } = extractImages({ html });
  let missingDimensions = 0;
  let invalidDimensions = 0;

  for (const image of images) {
    const hasMissingDimension = image.width === null || image.height === null;

    if (hasMissingDimension) {
      missingDimensions += 1;
      continue;
    }

    if (
      image.width !== null &&
      image.height !== null &&
      (image.width <= 0 || image.height <= 0)
    ) {
      invalidDimensions += 1;
    }
  }

  const warningCodes: AnalyzeImageDimensionsResult['warningCodes'] = [];

  if (missingDimensions > 0) {
    warningCodes.push('MISSING_DIMENSIONS');
  }

  if (invalidDimensions > 0) {
    warningCodes.push('INVALID_DIMENSION_VALUE');
  }

  return {
    total: images.length,
    missingDimensions,
    invalidDimensions,
    warningCodes,
  };
};

export const analyzeImageLoading = ({
  html,
}: AnalyzeImageLoadingOptions): AnalyzeImageLoadingResult => {
  if (html.trim().length === 0) {
    return {
      total: 0,
      lazy: 0,
      eager: 0,
      missingLoading: 0,
      warningCodes: ['EMPTY_INPUT'],
    };
  }

  const { images } = extractImages({ html });
  let lazy = 0;
  let eager = 0;
  let missingLoading = 0;

  for (const image of images) {
    if (image.loading === null || image.loading.length === 0) {
      missingLoading += 1;
      continue;
    }

    if (image.loading === 'lazy') {
      lazy += 1;
      continue;
    }

    if (image.loading === 'eager') {
      eager += 1;
    }
  }

  const warningCodes: AnalyzeImageLoadingResult['warningCodes'] = [];

  if (missingLoading > 0) {
    warningCodes.push('MISSING_LOADING_ATTRIBUTE');
  }

  return {
    total: images.length,
    lazy,
    eager,
    missingLoading,
    warningCodes,
  };
};

export const analyzeImages = ({
  html,
}: AnalyzeImagesOptions): ImagesAnalysis => {
  if (html.trim().length === 0) {
    return {
      images: [],
      total: 0,
      missingAlt: 0,
      emptyAlt: 0,
      duplicateAlt: 0,
      missingDimensions: 0,
      invalidDimensions: 0,
      lazy: 0,
      eager: 0,
      missingLoading: 0,
      warningCodes: ['EMPTY_INPUT'],
    };
  }

  const { images } = extractImages({ html });
  const altAnalysis = analyzeImageAlts({ html });
  const dimensionAnalysis = analyzeImageDimensions({ html });
  const loadingAnalysis = analyzeImageLoading({ html });
  const warningCodes: ImageAnalysisWarningCode[] = [];

  for (const warningCode of [
    ...altAnalysis.warningCodes,
    ...dimensionAnalysis.warningCodes,
    ...loadingAnalysis.warningCodes,
  ]) {
    pushUnique(warningCodes, warningCode);
  }

  return {
    images,
    total: images.length,
    missingAlt: altAnalysis.missingAlt,
    emptyAlt: altAnalysis.emptyAlt,
    duplicateAlt: altAnalysis.duplicateAlt,
    missingDimensions: dimensionAnalysis.missingDimensions,
    invalidDimensions: dimensionAnalysis.invalidDimensions,
    lazy: loadingAnalysis.lazy,
    eager: loadingAnalysis.eager,
    missingLoading: loadingAnalysis.missingLoading,
    warningCodes,
  };
};
