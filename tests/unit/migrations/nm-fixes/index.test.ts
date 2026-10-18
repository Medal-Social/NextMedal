import docs from '@tests/fixtures/lean-schema/documents.json';
import { collectMigrationMutations, type MigrationContext, type Mutation } from 'sanity/migrate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import migration, {
  applyMutations,
  assertNoBlockingDrafts,
  assertNoFreshBlockingDrafts,
  checkUnreferenced,
  IGNORE_DRAFTS_ENV,
  planMutations,
} from '$/migrations/nm-fixes/index';
import { MIGRATED_TYPES } from '$/migrations/nm-fixes/map';
import type { Doc } from '$/migrations/nm-fixes/shared';
import { DEAD_GROUP_IDS } from '$/migrations/nm-fixes/translation-groups';

const ALL = docs as Doc[];
const PUBLISHED = ALL.filter((d) => !d._id.startsWith('drafts.'));
const BLOCKING = [
  'drafts.0305aaeb-eef8-4f13-b724-ebdd86591b83',
  'drafts.1bc46c05-bdff-41dc-a281-e26dcee48d6f',
  'drafts.fa6acd77-2859-4c21-add7-165e3fdbe054',
];

const count = (mutations: readonly Mutation[], type: string) =>
  mutations.filter((m) => m.type === type);

describe('planMutations', () => {
  const mutations = planMutations(ALL);

  it('plans 15 patches, 18 deletes and 4 createIfNotExists on the 2026-10-18 export', () => {
    expect(count(mutations, 'patch')).toHaveLength(15);
    expect(count(mutations, 'delete')).toHaveLength(18);
    expect(count(mutations, 'createIfNotExists')).toHaveLength(4);
    expect(mutations).toHaveLength(37);
  });

  it('deletes the dead groups and creates the four new ones', () => {
    const deleted = count(mutations, 'delete').map((m) => (m as { id: string }).id);
    expect(deleted.sort()).toEqual([...DEAD_GROUP_IDS].sort());
    const created = count(mutations, 'createIfNotExists').map(
      (m) => (m as { document: Doc }).document._id
    );
    expect(created.sort()).toEqual([
      'tm-page-contact-us',
      'tm-page-guides',
      'tm-page-our-story',
      'tm-page-terms',
    ]);
  });

  it('locks every patch to the revision it read and only touches changed fields', () => {
    for (const m of count(mutations, 'patch') as Array<{
      id: string;
      options?: { ifRevision?: string };
      patches: Array<{ path: unknown[] }>;
    }>) {
      const doc = ALL.find((d) => d._id === m.id) as Doc;
      expect(m.options?.ifRevision, m.id).toBe(doc._rev);
      expect(m.patches.length, m.id).toBeGreaterThan(0);
    }
  });

  it('does not re-create a group that already exists', () => {
    const existing = { _id: 'tm-page-terms', _type: 'translation.metadata', _rev: 'r1' } as Doc;
    const created = count(planMutations([...ALL, existing]), 'createIfNotExists').map(
      (m) => (m as { document: Doc }).document._id
    );
    expect(created).not.toContain('tm-page-terms');
    expect(created).toHaveLength(3);
  });

  it('a second run writes nothing', () => {
    expect(planMutations(applyMutations(ALL, mutations))).toEqual([]);
  });

  it('never patches a document without a revision lock', () => {
    const pricing = { _id: 'p', _type: 'pricing', price: { base: '1' } } as Doc;
    expect(() => planMutations([pricing])).toThrow(/p has no _rev/);
  });
});

describe('assertNoBlockingDrafts', () => {
  it('refuses a real run and lists the blocking drafts', () => {
    expect(() => assertNoBlockingDrafts(ALL, { dryRun: false, env: {} })).toThrow(
      new RegExp(BLOCKING.map((id) => id.replace('.', '\\.')).join('[\\s\\S]*'))
    );
  });

  it('refuses a dry run too, unless the preview flag is set', () => {
    expect(() => assertNoBlockingDrafts(ALL, { dryRun: true, env: {} })).toThrow(/drafts\./);
    const warn = vi.fn();
    expect(() =>
      assertNoBlockingDrafts(ALL, { dryRun: true, env: { [IGNORE_DRAFTS_ENV]: '1' }, warn })
    ).not.toThrow();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining(BLOCKING[0]));
  });

  it('ignores the preview flag on a real run', () => {
    expect(() =>
      assertNoBlockingDrafts(ALL, { dryRun: false, env: { [IGNORE_DRAFTS_ENV]: '1' } })
    ).toThrow(/ignored on a real run/);
  });

  it('passes once the drafts are discarded', () => {
    expect(() => assertNoBlockingDrafts(PUBLISHED, { dryRun: false, env: {} })).not.toThrow();
  });
});

type Fetch = (query: string, params: Record<string, unknown>) => Promise<unknown>;

/** A context whose client records withConfig and fetch calls. */
function fakeContext(dryRun: boolean, fetch: Fetch = async () => []) {
  const withConfig = vi.fn();
  const fetchSpy = vi.fn(fetch);
  withConfig.mockReturnValue({ fetch: fetchSpy });
  const context = { dryRun, client: { withConfig } } as unknown as MigrationContext;
  return { context, withConfig, fetch: fetchSpy };
}

describe('checkUnreferenced', () => {
  it('offline dry run checks the migrated documents it read and only warns', async () => {
    const warn = vi.fn();
    const page = { _id: 'p', _type: 'page', group: { _ref: 'dead' } } as Doc;
    await checkUnreferenced(['dead'], [page], fakeContext(true).context, {
      fromExport: true,
      warn,
    });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('dead is still referenced by p'));
  });

  it('asks once, raw perspective, for every version of every deleted document', async () => {
    const { context, withConfig, fetch } = fakeContext(false);
    await checkUnreferenced(['a', 'drafts.b'], [], context, { fromExport: false });
    expect(withConfig).toHaveBeenCalledWith({ perspective: 'raw' });
    expect(fetch).toHaveBeenCalledTimes(1);
    const [query, params] = fetch.mock.calls[0] as [string, { refs: string[]; deleted: string[] }];
    expect(query).toContain('references($refs)');
    // Only the documents this run deletes are excluded: dead groups may point at each other.
    expect(query).toContain('!(_id in $deleted)');
    expect([...params.refs].sort()).toEqual(['a', 'b', 'drafts.a', 'drafts.b']);
    expect([...params.deleted].sort()).toEqual(['a', 'drafts.b']);
  });

  it('a surviving version of a deleted document still counts as a reference', async () => {
    const warn = vi.fn();
    // Published "dead" is deleted, its draft survives and points at "other" (also deleted).
    const draft = {
      _id: 'drafts.dead',
      _type: 'translation.metadata',
      g: { _ref: 'other' },
    } as Doc;
    await checkUnreferenced(['dead', 'other'], [draft], fakeContext(true).context, {
      fromExport: true,
      warn,
    });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('other is still referenced by drafts.dead')
    );
  });

  it('API dry run warns, a real run throws, naming the referenced document', async () => {
    const referencing = async () => [{ _id: 'x', _type: 'page', link: { _ref: 'drafts.dead' } }];
    const warn = vi.fn();
    await checkUnreferenced(['dead', 'other'], [], fakeContext(true, referencing).context, {
      fromExport: false,
      warn,
    });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('dead is still referenced by x'));
    await expect(
      checkUnreferenced(['dead'], [], fakeContext(false, referencing).context, {
        fromExport: false,
      })
    ).rejects.toThrow(/dead is still referenced by x/);
  });

  it('a real run fails when the reference check fails; a dry run warns', async () => {
    const boom = async () => {
      throw new Error('boom');
    };
    await expect(
      checkUnreferenced(['dead'], [], fakeContext(false, boom).context, { fromExport: false })
    ).rejects.toThrow(/boom/);
    const warn = vi.fn();
    await checkUnreferenced(['dead'], [], fakeContext(true, boom).context, {
      fromExport: false,
      warn,
    });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('boom'));
  });

  it('the dead groups are referenced by nothing in the export', async () => {
    const warn = vi.fn();
    await checkUnreferenced(DEAD_GROUP_IDS, ALL, fakeContext(true).context, {
      fromExport: true,
      warn,
    });
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('assertNoFreshBlockingDrafts', () => {
  it('re-reads the migrated types (raw perspective) and refuses a draft created after the export', async () => {
    const { context, withConfig, fetch } = fakeContext(false, async () => ALL);
    await expect(assertNoFreshBlockingDrafts(context)).rejects.toThrow(
      /drafts\.0305aaeb-eef8-4f13-b724-ebdd86591b83/
    );
    expect(withConfig).toHaveBeenCalledWith({ perspective: 'raw' });
    expect(fetch.mock.calls[0]?.[1]).toEqual({ types: [...MIGRATED_TYPES] });
  });

  it('passes when the live dataset has no blocking drafts', async () => {
    const { context } = fakeContext(false, async () => PUBLISHED);
    await expect(assertNoFreshBlockingDrafts(context)).resolves.toBeUndefined();
  });

  it('refuses without a client', async () => {
    const context = { dryRun: false } as unknown as MigrationContext;
    await expect(assertNoFreshBlockingDrafts(context)).rejects.toThrow(/no API client/);
  });

  it('refuses when a document it will delete changed since the run read it', async () => {
    const group = { _id: 'dead', _type: 'translation.metadata', _rev: 'r1' } as Doc;
    const live = async () => [...PUBLISHED, { ...group, _rev: 'r2' }];
    const { context } = fakeContext(false, live);
    await expect(assertNoFreshBlockingDrafts(context, [group])).rejects.toThrow(
      /dead changed since the run read it/
    );
  });

  it('passes when the documents it will delete are unchanged or already gone', async () => {
    const same = { _id: 'same', _type: 'translation.metadata', _rev: 'r1' } as Doc;
    const gone = { _id: 'gone', _type: 'translation.metadata', _rev: 'r1' } as Doc;
    const { context } = fakeContext(false, async () => [...PUBLISHED, same]);
    await expect(assertNoFreshBlockingDrafts(context, [same, gone])).resolves.toBeUndefined();
  });
});

describe('the default export, end to end', () => {
  afterEach(() => vi.unstubAllEnvs());

  async function run(docs: readonly Doc[], context: MigrationContext) {
    const source = async function* () {
      for (const doc of docs) yield doc as never;
    };
    const out: Mutation[] = [];
    for await (const item of collectMigrationMutations(migration, source, context)) {
      out.push(...((Array.isArray(item) ? item : [item]) as Mutation[]));
    }
    return out;
  }

  it('a real run refuses on blocking drafts before writing anything', async () => {
    vi.stubEnv(IGNORE_DRAFTS_ENV, '1');
    const { context, fetch } = fakeContext(false);
    await expect(run(ALL, context)).rejects.toThrow(/ignored on a real run/);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('a real run refuses when a blocking draft appeared after the export', async () => {
    const { context } = fakeContext(false, async (query) =>
      query.includes('references') ? [] : ALL
    );
    await expect(run(PUBLISHED, context)).rejects.toThrow(/drafts\./);
  });

  it('a dry run with the preview flag yields 15 patches, 18 deletes, 4 creates', async () => {
    vi.stubEnv(IGNORE_DRAFTS_ENV, '1');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const context = { dryRun: true } as unknown as MigrationContext;
    const mutations = await run(ALL, context);
    expect(count(mutations, 'patch')).toHaveLength(15);
    expect(count(mutations, 'delete')).toHaveLength(18);
    expect(count(mutations, 'createIfNotExists')).toHaveLength(4);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('dry run continues'));
    warn.mockRestore();
  });

  it('a dry run without the flag refuses too', async () => {
    vi.stubEnv(IGNORE_DRAFTS_ENV, '');
    await expect(run(ALL, { dryRun: true } as unknown as MigrationContext)).rejects.toThrow(
      new RegExp(IGNORE_DRAFTS_ENV)
    );
  });
});
