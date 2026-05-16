export const normalizeWhitespace = (text: string): string => {
  return text.trim().replace(/\s+/g, ' ');
};

export const removeDiacritics = (text: string): string => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const normalizeTextToken = (text: string): string => {
  return removeDiacritics(text).toLowerCase();
};

export const getSlugWords = (text: string): string[] => {
  return normalizeTextToken(text)
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/-/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
};

export const joinSlugWords = (words: string[]): string => {
  return words.join('-').replace(/-+/g, '-').replace(/^-|-$/g, '');
};

export const countNonWhitespaceCharacters = (text: string): number => {
  return text.replace(/\s/gu, '').length;
};

export const countWords = (text: string): number => {
  return text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)?/gu)?.length ?? 0;
};

export const countSentences = (text: string): number => {
  const normalizedText = normalizeWhitespace(text);

  if (normalizedText.length === 0) {
    return 0;
  }

  return normalizedText.split(/[.!?]+/gu).filter(Boolean).length;
};

export const countParagraphs = (text: string): number => {
  return text
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/g)
    .filter((paragraph) => paragraph.trim().length > 0).length;
};

export const estimateReadingTimeMinutes = (
  wordCount: number,
  wordsPerMinute = 200,
): number => {
  if (wordCount === 0) {
    return 0;
  }

  // Round up so short readable texts do not return 0 minutes.
  return Math.ceil(wordCount / wordsPerMinute);
};
