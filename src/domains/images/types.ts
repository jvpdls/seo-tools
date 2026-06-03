export type ExtractImagesWarningCode = 'EMPTY_INPUT';

export type ImageAltWarningCode =
  | 'EMPTY_INPUT'
  | 'MISSING_ALT'
  | 'EMPTY_ALT'
  | 'DUPLICATE_ALT';

export type ImageDimensionWarningCode =
  | 'EMPTY_INPUT'
  | 'MISSING_DIMENSIONS'
  | 'INVALID_DIMENSION_VALUE';

export type ImageLoadingWarningCode =
  | 'EMPTY_INPUT'
  | 'MISSING_LOADING_ATTRIBUTE';

export type ImageAnalysisWarningCode =
  | ImageAltWarningCode
  | ImageDimensionWarningCode
  | ImageLoadingWarningCode;

export type ImageItem = {
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
};

export type ExtractImagesOptions = {
  html: string;
};

export type ExtractImagesResult = {
  images: ImageItem[];
  warningCodes: ExtractImagesWarningCode[];
};

export type AnalyzeImageAltsOptions = {
  html: string;
};

export type AnalyzeImageAltsResult = {
  total: number;
  missingAlt: number;
  emptyAlt: number;
  duplicateAlt: number;
  warningCodes: ImageAltWarningCode[];
};

export type AnalyzeImageDimensionsOptions = {
  html: string;
};

export type AnalyzeImageDimensionsResult = {
  total: number;
  missingDimensions: number;
  invalidDimensions: number;
  warningCodes: ImageDimensionWarningCode[];
};

export type AnalyzeImageLoadingOptions = {
  html: string;
};

export type AnalyzeImageLoadingResult = {
  total: number;
  lazy: number;
  eager: number;
  missingLoading: number;
  warningCodes: ImageLoadingWarningCode[];
};

export type AnalyzeImagesOptions = {
  html: string;
};

export type ImagesAnalysis = {
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
};
