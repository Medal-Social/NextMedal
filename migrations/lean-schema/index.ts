/**
 * `sanity migrations run lean-schema` (Vault plan 2026-10-18, Task 25). Needs
 * nm-fixes to have run first (production: 2026-10-19). Decisions live in the
 * pure mapDocument; this file only turns them into mutations. Filters by type
 * only, so drafts and published documents are both visited. A second run
 * writes nothing.
 *
 * Async-iterable migration (like nm-fixes) because the guards need the whole
 * document set before the first write:
 * - blocking drafts (see blockingDrafts): a real run refuses while there are
 *   any. A dry run refuses too, unless LEAN_SCHEMA_DRY_RUN_IGNORE_DRAFTS=1 —
 *   then it warns and prints the planned mutations (ignored on a real run).
 * - references: nothing is deleted while a document that survives the run
 *   still references it (judged on that document as this run leaves it).
 *   Live run: throws; API dry run: warns; offline dry run: checks the
 *   migrated types it read (`--from-export` hands it nothing else).
 * - live re-check, real run only, just before the first write: refuses when a
 *   migrated document changed or appeared since the run read it.
 */
import {
  at,
  defineMigration,
  del,
  type MigrationContext,
  type Mutation,
  type NodePatch,
  patch,
  set,
  unset,
} from 'sanity/migrate';
import { isFromExport } from '../nm-fixes/index';
import {
  canonicalJson,
  findReferences,
  publishedId,
  UnmappedContentError,
} from '../nm-fixes/shared';
import {
  blockingDrafts,
  DELETE_TYPES,
  type Doc,
  MIGRATED_TYPES,
  mapDocument,
} from './map-documents';

export { applyMutations } from '../nm-fixes/index';

export const IGNORE_DRAFTS_ENV = 'LEAN_SCHEMA_DRY_RUN_IGNORE_DRAFTS';
export const DOCUMENT_TYPES = [...MIGRATED_TYPES, ...DELETE_TYPES] as const;

type Warn = (message: string) => void;
// biome-ignore lint/suspicious/noConsole: CLI migration output; warnings must reach the operator.
const consoleWarn: Warn = (message) => console.warn(message);

/** One top-level set/unset per changed field, locked to the revision this run read. */
function patchFor(doc: Doc, next: Doc): Mutation[] {
  const before = doc as Record<string, unknown>;
  const after = next as Record<string, unknown>;
  const keys = new Set(
    [...Object.keys(before), ...Object.keys(after)].filter((key) => !key.startsWith('_'))
  );
  const patches = [...keys].flatMap((key): NodePatch[] => {
    if (!(key in after)) return [at(key, unset())];
    if (canonicalJson(before[key]) === canonicalJson(after[key])) return [];
    return [at(key, set(after[key]))];
  });
  if (!patches.length) return [];
  if (!doc._rev) throw new UnmappedContentError(`${doc._id} has no _rev to lock the patch to`);
  return [patch(doc._id, patches, { ifRevision: doc._rev })];
}

/**
 * Every mutation the run makes: all patches first (they repoint references),
 * then the deletes.
 */
export function planMutations(docs: readonly Doc[]): Mutation[] {
  const patches: Mutation[] = [];
  const deletes: Mutation[] = [];
  for (const doc of docs) {
    const result = mapDocument(doc);
    if (result.action === 'delete') deletes.push(del(doc._id));
    else if (result.action === 'patch') patches.push(...patchFor(doc, result.next));
  }
  return [...patches, ...deletes];
}

/** The documents as this run leaves them, by id (patched ones replaced, deleted ones absent). */
function plannedState(docs: readonly Doc[]): Map<string, Doc> {
  const out = new Map<string, Doc>();
  for (const doc of docs) {
    const result = mapDocument(doc);
    if (result.action === 'patch') out.set(doc._id, result.next);
    else if (result.action === 'skip') out.set(doc._id, doc);
  }
  return out;
}

/** Refuses while a draft would bring the old shape back (dry run: preview flag). */
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
  const message = `lean-schema: ${blocking.length} draft(s) would bring the old shape back when published — discard or fix them first:\n${list}`;
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

const REFERENCING_QUERY = '*[references($refs) && !(_id in $deleted)]';
const LIVE_QUERY = '*[_type in $types]';

const allVersions = (ids: readonly string[]) => [
  ...new Set(ids.flatMap((id) => [publishedId(id), `drafts.${publishedId(id)}`])),
];

/**
 * Never delete a document something still references once this run is done.
 * A referencing document this run patches is judged as the run leaves it
 * (only when the live revision is the one the run read; the patch is locked
 * to it). Offline dry run: the documents it read; API dry run: warns.
 */
export async function checkUnreferenced(
  ids: readonly string[],
  docs: readonly Doc[],
  context: MigrationContext,
  { fromExport = isFromExport(), warn = consoleWarn }: { fromExport?: boolean; warn?: Warn } = {}
): Promise<void> {
  if (!ids.length) return;
  const planned = plannedState(docs);
  const read = new Map(docs.map((d) => [d._id, d._rev]));
  let referencing: readonly Doc[] = docs;
  if (!(context.dryRun && (fromExport || !context.client))) {
    if (!context.client) throw new UnmappedContentError('no API client to check references');
    try {
      referencing = await context.client
        .withConfig({ perspective: 'raw' })
        .fetch<Doc[]>(REFERENCING_QUERY, { refs: allVersions(ids), deleted: [...ids] });
    } catch (error) {
      if (!context.dryRun) throw error;
      warn(`WARNING lean-schema: could not check references: ${String(error)}`);
      return;
    }
  }
  const after = referencing.flatMap((doc) => {
    if (!read.has(doc._id) || read.get(doc._id) !== doc._rev) return [doc];
    const next = planned.get(doc._id);
    return next ? [next] : [];
  });
  const found = findReferences(after, ids);
  for (const id of ids) {
    const from = found.filter((r) => publishedId(r.to) === publishedId(id)).map((r) => r.from);
    if (!from.length) continue;
    const message = `${id} is still referenced by ${[...new Set(from)].join(', ')}`;
    if (!context.dryRun) throw new UnmappedContentError(message);
    warn(`WARNING lean-schema: ${message} (a live run would stop here)`);
  }
}

/**
 * Real run, just before the first write: re-reads the migrated and deleted
 * types (raw perspective, so drafts count). Refuses on a blocking draft, and
 * when a document the mapping would change is new or changed since the run
 * read it (it would be missed, or a delete could not be revision-locked).
 */
export async function assertNoFreshChanges(
  context: MigrationContext,
  read: readonly Doc[]
): Promise<void> {
  if (!context.client) throw new UnmappedContentError('no API client to re-check the dataset');
  const live = await context.client
    .withConfig({ perspective: 'raw' })
    .fetch<Doc[]>(LIVE_QUERY, { types: [...DOCUMENT_TYPES] });
  assertNoBlockingDrafts(live, { dryRun: false, env: {} });
  const readRev = new Map(read.map((doc) => [doc._id, doc._rev]));
  const changed = live.filter(
    (doc) => readRev.get(doc._id) !== doc._rev && mapDocument(doc).action !== 'skip'
  );
  if (changed.length) {
    throw new UnmappedContentError(
      `${changed.map((doc) => doc._id).join(', ')} changed since the run read it — run again`
    );
  }
}

export default defineMigration({
  title: 'NextMedal lean schema: 14 blocks, design in code, orphans removed',
  documentTypes: [...DOCUMENT_TYPES],
  async *migrate(documents, context) {
    const docs: Doc[] = [];
    for await (const doc of documents()) docs.push(doc as unknown as Doc);
    assertNoBlockingDrafts(docs, { dryRun: context.dryRun });
    const mutations = planMutations(docs);
    const deletes = mutations.flatMap((m) => (m.type === 'delete' ? [m.id] : []));
    await checkUnreferenced(deletes, docs, context);
    if (!context.dryRun) await assertNoFreshChanges(context, docs);
    for (const mutation of mutations) yield mutation;
  },
});
