/**
 * One entry of an internationalized array field. sanity-plugin-internationalized-array
 * v5 stores the language in `language` with a random `_key`; older entries use
 * the language as `_key`.
 */
export type LocalizedEntry = { _key: string; language?: string; value: string };

const languageOf = (entry: LocalizedEntry) => entry.language ?? entry._key;

/**
 * The value for `locale` from an internationalized array field, else English,
 * else the first entry. A plain string (older documents) is returned as is.
 */
export function getLocalizedValue(
  arr: LocalizedEntry[] | string | undefined,
  locale: string,
  fallback = ''
): string {
  if (!arr) return fallback;
  if (typeof arr === 'string') return arr; // Backward compatibility
  if (!Array.isArray(arr)) return fallback;

  const item =
    arr.find((i) => languageOf(i) === locale) || arr.find((i) => languageOf(i) === 'en') || arr[0];

  return item?.value || fallback;
}
