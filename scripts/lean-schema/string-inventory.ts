/**
 * Before/after text inventory for the NextMedal content migrations (Vault plan
 * 2026-10-18, Task 12; copied from Brandmark's lean-schema inventory). Library + CLI.
 *
 * Usage: pnpm exec tsx scripts/lean-schema/string-inventory.ts before.ndjson after.ndjson [allowed.txt]
 * Lists the documents missing from after (each must be on the migration's delete plan),
 * then prints every text string (line breaks included) of the kept documents that occurs
 * fewer times after than before, minus the allow-list (migrations/nm-fixes/allowed-losses.txt
 * or migrations/lean-schema/allowed-losses.txt). Exits 1 when anything else is lost.
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Keys that hold structure or design values, not copy. */
const IGNORE_KEYS = new Set([
  '_id',
  '_rev',
  '_key',
  '_ref',
  '_type',
  '_createdAt',
  '_updatedAt',
  '_system',
  '_sanityAsset',
  '_weak',
  'style',
  'listItem',
  'marks',
  'variant',
  'videoType',
  'tone',
  'headlineSize',
  'anchorId',
  'language',
  'type',
  'editorialVariant',
  'loading',
  'params',
  'bgFrom',
  'bgTo',
  'uid',
  'layout',
  'sidebarStyle',
  'uncategorizedPosition',
  'filterByType',
  'icon',
]);

export type Inventory = Map<string, number>;

function walk(value: unknown, out: Inventory) {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, out);
  } else if (value && typeof value === 'object') {
    for (const [key, inner] of Object.entries(value)) if (!IGNORE_KEYS.has(key)) walk(inner, out);
  } else if (typeof value === 'string') {
    const text = value.trim();
    if (text) out.set(text, (out.get(text) ?? 0) + 1);
  }
}

export function inventory(docs: unknown[]): Inventory {
  const out: Inventory = new Map();
  walk(docs, out);
  return out;
}

/** Strings that occur fewer times after than before, minus the allowed ones. */
export function lostStrings(
  before: Inventory,
  after: Inventory,
  allowed: ReadonlyMap<string, string> = new Map()
): string[] {
  return [...before.entries()]
    .filter(([text, count]) => (after.get(text) ?? 0) < count && !allowed.has(text))
    .map(([text]) => text);
}

export function readNdjson(path: string): unknown[] {
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

/**
 * Allow-list file: one JSON-escaped string per line; the `#` lines right above
 * a string are its reason. Blank lines separate entries.
 */
export function readAllowList(path: string): Map<string, string> {
  const allowed = new Map<string, string>();
  let reason: string[] = [];
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line) {
      reason = [];
    } else if (line.startsWith('#')) {
      reason.push(line.replace(/^#\s?/, ''));
    } else {
      const text = JSON.parse(line);
      if (typeof text !== 'string') throw new Error(`${path}: not a JSON string: ${line}`);
      allowed.set(text.trim(), reason.join(' '));
      reason = [];
    }
  }
  return allowed;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const [, , beforePath, afterPath, allowPath] = process.argv;
  if (!beforePath || !afterPath) {
    console.error('Usage: string-inventory.ts before.ndjson after.ndjson [allowed.txt]');
    process.exit(2);
  }
  const allowed = allowPath ? readAllowList(allowPath) : new Map<string, string>();
  const before = readNdjson(beforePath) as Array<{ _id: string; _type: string }>;
  const after = readNdjson(afterPath) as Array<{ _id: string }>;
  const kept = new Set(after.map((d) => d._id));
  const removed = before.filter((d) => !kept.has(d._id));
  console.log(
    `Documents removed (${removed.length}) — each must be on the migration's delete plan:`
  );
  for (const d of removed) console.log(`  ${d._type} ${d._id}`);
  const lost = lostStrings(
    inventory(before.filter((d) => kept.has(d._id))),
    inventory(after),
    allowed
  );
  console.log(
    lost.length
      ? `LOST ${lost.length}:\n${lost.map((s) => JSON.stringify(s)).join('\n')}`
      : 'No text lost.'
  );
  process.exit(lost.length ? 1 : 0);
}
