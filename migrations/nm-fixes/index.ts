/**
 * `sanity migrations run nm-fixes` (Vault plan 2026-10-18, Task 12). Decisions
 * live in the pure mapDocument; this file only turns them into mutations.
 * Filters by type only, so drafts and published documents are both visited.
 * A second run writes nothing.
 *
 * Written as an async-iterable migration (not a per-document one) because two
 * guards need the whole document set before the first write:
 * - blocking drafts: drafts whose publishing would undo a fix (see
 *   blockingDrafts). A real run always refuses while there are any, and checks
 *   the live dataset again just before its first write (drafts created after
 *   the export). A dry run refuses too, unless NM_FIXES_DRY_RUN_IGNORE_DRAFTS=1
 *   is set — then it warns and prints the planned mutations. The flag is
 *   ignored on a real run.
 * - references: a document is never deleted while something still references
 *   it (live run: throws; API dry run: warns; offline dry run: only checks the
 *   migrated types it read, since `--from-export` hands it nothing else).
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
    if (!doc._rev) throw new UnmappedContentError(`${doc._id} has no _rev to lock the patch to`);
    return [...creates, patch(doc._id, patches, { ifRevision: doc._rev })];
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

const REFERENCING_QUERY = '*[references($refs) && !(_id in $deleted)]';
const MIGRATED_QUERY = '*[_type in $types]';

/** Both versions (published and draft) of every id. */
const allVersions = (ids: readonly string[]) => [
  ...new Set(ids.flatMap((id) => [publishedId(id), `drafts.${publishedId(id)}`])),
];

/**
 * Never delete a document something else still references. Offline dry run
 * (`--from-export`, or no client): only checks the migrated types it read —
 * the export hands the migration nothing else — and warns. API dry run: a
 * WARNING, never an error. Live run: always checks via the API (one query,
 * raw perspective, so drafts count) and throws.
 */
export async function checkUnreferenced(
  ids: readonly string[],
  docs: readonly Doc[],
  context: MigrationContext,
  { fromExport = isFromExport(), warn = consoleWarn }: { fromExport?: boolean; warn?: Warn } = {}
): Promise<void> {
  if (!ids.length) return;
  let referencing: readonly Doc[] = docs;
  if (!(context.dryRun && (fromExport || !context.client))) {
    if (!context.client) throw new UnmappedContentError('no API client to check references');
    try {
      // References to either version count; only the exact documents this run
      // deletes are excluded (dead groups may point at each other, but a
      // surviving draft or published version still counts).
      referencing = await context.client
        .withConfig({ perspective: 'raw' })
        .fetch<Doc[]>(REFERENCING_QUERY, { refs: allVersions(ids), deleted: [...ids] });
    } catch (error) {
      if (!context.dryRun) throw error;
      warn(`WARNING nm-fixes: could not check references: ${String(error)}`);
      return;
    }
  }
  const found = findReferences(referencing, ids);
  for (const id of ids) {
    const from = found.filter((r) => publishedId(r.to) === publishedId(id)).map((r) => r.from);
    if (!from.length) continue;
    const message = `${id} is still referenced by ${[...new Set(from)].join(', ')}`;
    if (!context.dryRun) throw new UnmappedContentError(message);
    warn(`WARNING nm-fixes: ${message} (a live run would stop here)`);
  }
}

/**
 * Real run, just before the first write: re-reads the migrated types from the
 * live dataset (raw perspective, so drafts count) and refuses if a draft would
 * undo the fix — catches drafts created after the run's export was taken — or
 * if a document it is about to delete changed since the run read it (deletes
 * cannot be revision-locked like the patches).
 */
export async function assertNoFreshBlockingDrafts(
  context: MigrationContext,
  deleting: readonly Doc[] = []
): Promise<void> {
  if (!context.client) throw new UnmappedContentError('no API client to re-check drafts');
  const live = await context.client
    .withConfig({ perspective: 'raw' })
    .fetch<Doc[]>(MIGRATED_QUERY, { types: [...MIGRATED_TYPES] });
  assertNoBlockingDrafts(live, { dryRun: false, env: {} });
  const liveRev = new Map(live.map((doc) => [doc._id, doc._rev]));
  const changed = deleting.filter(
    (doc) => liveRev.has(doc._id) && liveRev.get(doc._id) !== doc._rev
  );
  if (changed.length) {
    throw new UnmappedContentError(
      `${changed.map((doc) => doc._id).join(', ')} changed since the run read it — run again`
    );
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
    if (!context.dryRun) {
      const ids = new Set(deletes);
      await assertNoFreshBlockingDrafts(
        context,
        docs.filter((doc) => ids.has(doc._id))
      );
    }
    for (const mutation of mutations) yield mutation;
  },
});
