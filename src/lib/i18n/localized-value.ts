/**
 * The value for `locale` from an internationalized array field, else English,
 * else the first entry. A plain string (older documents) is returned as is.
 */
export function getLocalizedValue(
  arr: Array<{ _key: string; value: string }> | string | undefined,
  locale: string,
  fallback = ''
): string {
  if (!arr) return fallback;
  if (typeof arr === 'string') return arr; // Backward compatibility
  if (!Array.isArray(arr)) return fallback;

  const item = arr.find((i) => i._key === locale) || arr.find((i) => i._key === 'en') || arr[0];

  return item?.value || fallback;
}
