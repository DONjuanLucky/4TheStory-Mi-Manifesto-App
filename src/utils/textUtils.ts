/**
 * Counts the number of words in a string.
 * Uses a regex to split by whitespace and filters out empty strings.
 * This matches the original implementation logic but extracts it for reuse.
 *
 * @param text The text to count words in.
 * @returns The number of words.
 */
export const countWords = (text: string): number => {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
};
