/**
 * Converts a string to a URL-safe slug format.
 * Lowercases and collapses any run of non-alphanumeric characters into a single
 * hyphen. Unicode-aware (\p{L}/\p{N}) so non-Latin headings — Arabic, Norwegian
 * æ/ø/å, etc. — keep their letters instead of collapsing to an empty string.
 * This is the single source of truth for heading anchor ids; the Table of
 * Contents must use it too so its links match the rendered heading ids.
 * @param str - The string to convert to a slug
 * @returns URL-safe slug (e.g., "Hello World!" → "hello-world")
 * @example
 * slug("Hello World!") // "hello-world"
 * slug("My Article #1") // "my-article-1"
 * slug("Følg oss") // "følg-oss"
 */
export function slug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Formats a count with singular/plural word forms.
 * Handles arrays, numbers, null, and undefined values.
 * @param arr - Array to count, number, or null/undefined (treated as 0)
 * @param singular - Singular form of the word (default: "item")
 * @param plural - Optional plural form (defaults to singular + "s")
 * @returns Formatted string like "5 items" or "1 item"
 * @example
 * count([1, 2, 3], "post") // "3 posts"
 * count(1, "item") // "1 item"
 * count(null, "result") // "0 results"
 */
export function count(
  arr: unknown[] | number | null | undefined,
  singular = 'item',
  plural?: string
) {
  const n = typeof arr === 'number' ? arr : arr?.length || 0;
  return `${n} ${n === 1 ? singular : plural || `${singular}s`}`;
}
