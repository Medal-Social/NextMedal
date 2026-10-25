/**
 * Before/after text inventory for the NextMedal content migrations (Vault plan
 * 2026-10-18, Task 12; copied from Brandmark's lean-schema inventory). Library + CLI.
 *
 * Usage: pnpm exec tsx scripts/lean-schema/string-inventory.ts before.ndjson after.ndjson [allowed.txt]
 * Lists the documents missing from after (each must be on the migration's delete plan),
 * then checks every text string (line breaks included) of the kept documents that occurs
 * fewer times after than before against the allow-list (migrations/nm-fixes/allowed-losses.txt
 * or migrations/lean-schema/allowed-losses.txt): entry, count and field paths must match.
 * Exits 1 on any problem.
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
/** text → field path (`<doc type>.<key>.<key>`, array positions left out) → count. */
export type PathInventory = Map<string, Map<string, number>>;

function walk(value: unknown, path: string, out: PathInventory) {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, path, out);
  } else if (value && typeof value === 'object') {
    for (const [key, inner] of Object.entries(value)) {
      if (!IGNORE_KEYS.has(key)) walk(inner, path ? `${path}.${key}` : key, out);
    }
  } else if (typeof value === 'string') {
    const text = value.trim();
    if (!text) return;
    const paths = out.get(text) ?? new Map<string, number>();
    paths.set(path, (paths.get(path) ?? 0) + 1);
    out.set(text, paths);
  }
}

/** Every text string by the field path it sits in. */
export function pathInventory(docs: unknown[]): PathInventory {
  const out: PathInventory = new Map();
  for (const doc of docs) {
    walk(doc, String((doc as { _type?: unknown })?._type ?? '?'), out);
  }
  return out;
}

const total = (paths: ReadonlyMap<string, number> | undefined) =>
  [...(paths?.values() ?? [])].reduce((sum, n) => sum + n, 0);

export function inventory(docs: unknown[]): Inventory {
  return new Map([...pathInventory(docs)].map(([text, paths]) => [text, total(paths)]));
}

/** One allowed loss: why, how many occurrences, and in which field paths. */
export type AllowedLoss = { reason: string; count?: number; paths?: string[] };

/** Strings that occur fewer times after than before, minus the allowed ones. */
export function lostStrings(
  before: Inventory,
  after: Inventory,
  allowed: ReadonlyMap<string, unknown> = new Map()
): string[] {
  return [...before.entries()]
    .filter(([text, count]) => (after.get(text) ?? 0) < count && !allowed.has(text))
    .map(([text]) => text);
}

/**
 * Every problem with the losses between two document sets: a string lost
 * without an allow-list entry, a loss of another size than the entry's count,
 * a loss outside the entry's field paths, or an entry that loses nothing.
 * Empty = no text lost beyond the allow-list.
 */
export function checkLosses(
  beforeDocs: unknown[],
  afterDocs: unknown[],
  allowed: ReadonlyMap<string, AllowedLoss> = new Map()
): string[] {
  const before = pathInventory(beforeDocs);
  const after = pathInventory(afterDocs);
  const problems: string[] = [];
  for (const [text, paths] of before) {
    const lost = total(paths) - total(after.get(text));
    if (lost <= 0) continue;
    const where = [...paths.keys()]
      .filter((p) => (paths.get(p) ?? 0) > (after.get(text)?.get(p) ?? 0))
      .join(', ');
    const entry = allowed.get(text);
    if (!entry) {
      problems.push(`LOST ${JSON.stringify(text)} x${lost} (${where})`);
      continue;
    }
    if (entry.count !== undefined && entry.count !== lost) {
      problems.push(`${JSON.stringify(text)}: lost ${lost}, allowed ${entry.count} (${where})`);
    }
    if (entry.paths) {
      const atPaths = entry.paths.reduce(
        (sum, p) => sum + Math.max(0, (paths.get(p) ?? 0) - (after.get(text)?.get(p) ?? 0)),
        0
      );
      if (atPaths < lost) {
        problems.push(`${JSON.stringify(text)}: lost outside ${entry.paths.join(', ')} (${where})`);
      }
    }
  }
  for (const text of allowed.keys()) {
    if (total(before.get(text)) - total(after.get(text)) <= 0) {
      problems.push(`${JSON.stringify(text)}: on the allow-list but not lost`);
    }
  }
  return problems;
}

export function readNdjson(path: string): unknown[] {
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

const ENTRY = /^("(?:[^"\\]|\\.)*")(?:\s+(\d+))?(?:\s+(\S+))?$/;

/**
 * Allow-list file: one entry per line — a JSON string, then optionally the
 * number of occurrences lost and the comma-separated field paths
 * (`"Privacy" 2 page.title`). The `#` lines right above an entry are its
 * reason. Blank lines separate entries.
 */
export function readAllowList(path: string): Map<string, AllowedLoss> {
  const allowed = new Map<string, AllowedLoss>();
  let reason: string[] = [];
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line) {
      reason = [];
    } else if (line.startsWith('#')) {
      reason.push(line.replace(/^#\s?/, ''));
    } else {
      const match = ENTRY.exec(line);
      const text = match ? JSON.parse(match[1]) : undefined;
      if (typeof text !== 'string') throw new Error(`${path}: not an allow-list entry: ${line}`);
      allowed.set(text.trim(), {
        reason: reason.join(' '),
        ...(match?.[2] ? { count: Number(match[2]) } : {}),
        ...(match?.[3] ? { paths: match[3].split(',') } : {}),
      });
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
  const allowed = allowPath ? readAllowList(allowPath) : new Map<string, AllowedLoss>();
  const before = readNdjson(beforePath) as Array<{ _id: string; _type: string }>;
  const after = readNdjson(afterPath) as Array<{ _id: string }>;
  const kept = new Set(after.map((d) => d._id));
  const removed = before.filter((d) => !kept.has(d._id));
  console.log(
    `Documents removed (${removed.length}) — each must be on the migration's delete plan:`
  );
  for (const d of removed) console.log(`  ${d._type} ${d._id}`);
  const problems = checkLosses(
    before.filter((d) => kept.has(d._id)),
    after,
    allowed
  );
  console.log(
    problems.length ? `PROBLEMS ${problems.length}:\n${problems.join('\n')}` : 'No text lost.'
  );
  process.exit(problems.length ? 1 : 0);
}
