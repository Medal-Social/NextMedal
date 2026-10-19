/**
 * Helpers shared by the NextMedal content migrations (Vault plan 2026-10-18).
 * Self-contained: the Sanity CLI runs migrations without the app's path aliases.
 */
export type Doc = Record<string, unknown> & { _id: string; _type: string; _rev?: string };

export class UnmappedContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnmappedContentError';
  }
}

export const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

export const publishedId = (id: string) => id.replace(/^drafts\./, '');

/** True when a value holds anything an editor typed (_type/_key alone are not content). */
export function isFilled(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  if (isObject(value)) {
    return Object.entries(value).some(
      ([key, inner]) => key !== '_type' && key !== '_key' && isFilled(inner)
    );
  }
  return true;
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (!isObject(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortKeys(value[key])])
  );
}

/** JSON that ignores key order, so a re-run on equal content writes nothing. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value)) ?? 'undefined';
}

/** Lookup by id: the exact id first, then the other version (draft/published). */
export function documentLookup(docs: readonly Doc[]): (id: string) => Doc | undefined {
  const byId = new Map(docs.map((doc) => [doc._id, doc]));
  return (id) =>
    byId.get(id) ?? byId.get(id === publishedId(id) ? `drafts.${id}` : publishedId(id));
}

/** Deep map over every object, innermost first (arrays kept in order). */
export function mapObjects(
  value: unknown,
  fn: (obj: Record<string, unknown>) => Record<string, unknown>
): unknown {
  if (Array.isArray(value)) return value.map((item) => mapObjects(item, fn));
  if (!isObject(value)) return value;
  const inner = Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, mapObjects(item, fn)])
  );
  return fn(inner);
}

/**
 * Every reference to one of `ids` (draft or published) from a document that is
 * not itself in `ids` (exact id: a surviving other version still counts).
 */
export function findReferences(docs: readonly Doc[], ids: readonly string[]) {
  const targets = new Set(ids.map(publishedId));
  const deleted = new Set(ids);
  const found: Array<{ from: string; to: string }> = [];
  const walk = (value: unknown, from: string) => {
    if (Array.isArray(value)) {
      for (const item of value) walk(item, from);
      return;
    }
    if (!isObject(value)) return;
    if (typeof value._ref === 'string' && targets.has(publishedId(value._ref))) {
      found.push({ from, to: value._ref });
    }
    for (const inner of Object.values(value)) walk(inner, from);
  };
  for (const doc of docs) if (!deleted.has(doc._id)) walk(doc, doc._id);
  return found;
}
