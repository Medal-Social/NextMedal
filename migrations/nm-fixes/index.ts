/**
 * `sanity migrations run nm-fixes` (Vault plan 2026-10-18, Task 12). Decisions
 * live in the pure mapDocument; this file only turns them into mutations.
 * Filters by type only, so drafts and published documents are both visited.
 * A second run writes nothing.
 *
 * Written as an async-iterable migration (not a per-document one) because two
 * guards need the whole document set before the first write:
 * - blocking drafts: drafts whose publishing would undo a fix (see
 *   blockingDrafts). A real run always refuses while there are any. A dry run
 *   refuses too, unless NM_FIXES_DRY_RUN_IGNORE_DRAFTS=1 is set — then it warns
 *   and prints the planned mutations. The flag is ignored on a real run.
 * - references: a document is never deleted while something still references
 *   it (live run: throws; API dry run: warns; offline dry run: checks the export).
 */
import {
  at,
  createIfNotExists,
  defineMigration,
  del,
  type MigrationContext,
  type Mutation,
  type NodePatch,
  patch,
  set,
  unset,
} from 'sanity/migrate';
import { blockingDrafts, groupsToCreate, MIGRATED_TYPES, mapDocument } from './map';
import {
  canonicalJson,
  type Doc,
  documentLookup,
  findReferences,
  publishedId,
  UnmappedContentError,
} from './shared';

export const IGNORE_DRAFTS_ENV = 'NM_FIXES_DRY_RUN_IGNORE_DRAFTS';

type Warn = (message: string) => void;
// biome-ignore lint/suspicious/noConsole: CLI migration output; warnings must reach the operator.
const consoleWarn: Warn = (message) => console.warn(message);

/** Every mutation the run makes, in document order: createIfNotExists, then patch or delete. */
export function planMutations(docs: readonly Doc[]): Mutation[] {
  const getDocument = documentLookup(docs);
  const existing = new Set(docs.map((d) => d._id));
  return docs.flatMap((doc): Mutation[] => {
    // createIfNotExists keeps a re-run safe; skipping existing groups keeps it silent.
    const creates = groupsToCreate(doc)
      .filter((group) => !existing.has(group._id))
      .map((group) => createIfNotExists(group as never));
    const result = mapDocument(doc, { getDocument });
    if (result.action === 'delete') return [...creates, del(doc._id)];
    if (result.action === 'skip') return creates;
    const before = doc as Record<string, unknown>;
    const next = result.next as Record<string, unknown>;
    const keys = new Set(
      [...Object.keys(before), ...Object.keys(next)].filter((key) => !key.startsWith('_'))
    );
    const patches = [...keys].flatMap((key): NodePatch[] => {
      if (!(key in next)) return [at(key, unset())];
      if (canonicalJson(before[key]) === canonicalJson(next[key])) return [];
      return [at(key, set(next[key]))];
    });
    if (!patches.length) return creates;
    // One patch per document, locked to the revision this run read.
    const options = doc._rev ? { ifRevision: doc._rev } : undefined;
    return [...creates, patch(doc._id, patches, options)];
  });
}

type Op = { type: string; value?: unknown };
type PlannedMutation =
  | { type: 'createIfNotExists'; document: Doc }
  | { type: 'delete'; id: string }
  | { type: 'patch'; id: string; patches: Array<{ path: unknown[]; op: Op }> };

function applyPatch(doc: Doc, m: Extract<PlannedMutation, { type: 'patch' }>): Doc {
  const next: Doc = { ...doc };
  for (const { path, op } of m.patches) {
    if (path.length !== 1) throw new Error(`${m.id}: nested patch path ${path.join('.')}`);
    const key = String(path[0]);
    if (op.type === 'set') next[key] = op.value;
    else if (op.type === 'unset') delete next[key];
    else throw new Error(`${m.id}: unexpected op ${op.type}`);
  }
  return next;
}

/** Applies planned mutations to plain documents (tests and the local inventory check). */
export function applyMutations(docs: readonly Doc[], mutations: readonly Mutation[]): Doc[] {
  const out = new Map(docs.map((d) => [d._id, d]));
  for (const m of mutations as unknown as PlannedMutation[]) {
    if (m.type === 'createIfNotExists') {
      if (!out.has(m.document._id)) out.set(m.document._id, m.document);
    } else if (m.type === 'delete') {
      out.delete(m.id);
    } else if (m.type === 'patch') {
      out.set(m.id, applyPatch(out.get(m.id) as Doc, m));
    } else {
      throw new Error(`unexpected mutation ${(m as { type: string }).type}`);
    }
  }
  return [...out.values()];
}

/**
 * Refuses to run while a draft would undo the fix when published (discard or
 * fix those drafts first). Dry run only: IGNORE_DRAFTS_ENV=1 turns the refusal
 * into a warning so the planned mutations can be reviewed anyway.
 */
export function assertNoBlockingDrafts(
  docs: readonly Doc[],
  {
    dryRun,
    env = process.env,
    warn = consoleWarn,
  }: { dryRun: boolean; env?: Record<string, string | undefined>; warn?: Warn }
): void {
  const blocking = blockingDrafts(docs);
  if (!blocking.length) return;
  const list = blocking.map((id) => `  ${id}`).join('\n');
  const message = `nm-fixes: ${blocking.length} draft(s) would undo the fix when published — discard or fix them first:\n${list}`;
  const preview = env[IGNORE_DRAFTS_ENV] === '1';
  if (dryRun && preview) {
    warn(`WARNING ${message}\n(${IGNORE_DRAFTS_ENV}=1: dry run continues; a real run refuses)`);
    return;
  }
  if (dryRun) {
    throw new UnmappedContentError(
      `${message}\nTo preview the mutations anyway (dry run only): ${IGNORE_DRAFTS_ENV}=1`
    );
  }
  const ignored = preview ? `\n${IGNORE_DRAFTS_ENV} is ignored on a real run.` : '';
  throw new UnmappedContentError(`${message}${ignored}`);
}

/** True when the CLI reads a local export (`--from-export`): no API access at all. */
export function isFromExport(argv: readonly string[] = process.argv): boolean {
  return argv.some((arg) => arg === '--from-export' || arg.startsWith('--from-export='));
}

const REFERENCING_QUERY = '*[references($ids) && !(_id in $ids)]._id';

/**
 * Never delete a document something else still references. Offline dry run
 * (`--from-export`, or no client): checks the export's own documents and
 * warns. API dry run: a WARNING, never an error. Live run: always checks via
 * the API (raw perspective, so drafts count) and throws.
 */
export async function checkUnreferenced(
  ids: readonly string[],
  docs: readonly Doc[],
  context: MigrationContext,
  { fromExport = isFromExport(), warn = consoleWarn }: { fromExport?: boolean; warn?: Warn } = {}
): Promise<void> {
  if (!ids.length) return;
  const report = (id: string, from: string[]) => {
    const message = `${id} is still referenced by ${from.join(', ')}`;
    if (!context.dryRun) throw new UnmappedContentError(message);
    warn(`WARNING nm-fixes: ${message} (a live run would stop here)`);
  };
  if (context.dryRun && (fromExport || !context.client)) {
    const found = findReferences(docs, ids);
    for (const id of ids) {
      const from = found.filter((r) => publishedId(r.to) === publishedId(id)).map((r) => r.from);
      if (from.length) report(id, [...new Set(from)]);
    }
    return;
  }
  if (!context.client) throw new UnmappedContentError('no API client to check references');
  const client = context.client.withConfig({ perspective: 'raw' });
  const all = [...new Set(ids.flatMap((id) => [publishedId(id), `drafts.${publishedId(id)}`]))];
  for (const id of ids) {
    const versions = [publishedId(id), `drafts.${publishedId(id)}`];
    let from: string[];
    try {
      // Excludes every document this run deletes: dead groups may point at each other.
      from = (await client.fetch<string[]>(REFERENCING_QUERY, { ids: versions })).filter(
        (ref) => !all.includes(ref)
      );
    } catch (error) {
      if (!context.dryRun) throw error;
      warn(`WARNING nm-fixes: could not check references to ${id}: ${String(error)}`);
      continue;
    }
    if (from.length) report(id, from);
  }
}

export default defineMigration({
  title: 'NextMedal phase-1 fixes: anchor links, prices, form texts, translation groups',
  documentTypes: [...MIGRATED_TYPES],
  async *migrate(documents, context) {
    const docs: Doc[] = [];
    for await (const doc of documents()) docs.push(doc as unknown as Doc);
    assertNoBlockingDrafts(docs, { dryRun: context.dryRun });
    const mutations = planMutations(docs);
    const deletes = mutations.flatMap((m) => (m.type === 'delete' ? [m.id] : []));
    await checkUnreferenced(deletes, docs, context);
    for (const mutation of mutations) yield mutation;
  },
});
