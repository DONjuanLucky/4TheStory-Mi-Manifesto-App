
/**
 * Optimized word counting function.
 * Avoids splitting strings and allocating large arrays.
 * O(N) where N is the length of the string, with O(1) memory usage.
 */
export function countWords(text: string): number {
  if (!text) return 0;

  let count = 0;
  let inWord = false;

  for (let i = 0; i < text.length; i++) {
    // Check if the current character is whitespace
    // Using simple space check for performance, or regex test if needed
    // Using strict regex \s test to match split(/\s+/) behavior
    const isSpace = /\s/.test(text[i]);

    if (isSpace) {
      inWord = false;
    } else if (!inWord) {
      inWord = true;
      count++;
    }
  }

  return count;
}
