import docs from '@tests/fixtures/lean-schema/documents.json';
import {
  collectMigrationMutations,
  type MigrationContext,
  type Mutation,
  type Transaction,
} from 'sanity/migrate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import migration, {
  applyMutations,
  assertLeadsExported,
  assertNoBlockingDrafts,
  assertNoFreshChanges,
  checkUnreferenced,
  DOCUMENT_TYPES,
  IGNORE_DRAFTS_ENV,
  LEADS_EXPORTED_ENV,
  lockedDelete,
  planMutations,
} from '$/migrations/lean-schema/index';
import { type Doc, DUPLICATE_PAGES, planDeletions } from '$/migrations/lean-schema/map-documents';

const ALL = docs as Doc[];
const EVENTS = DUPLICATE_PAGES.find((d) => d.slug === 'events') as { remove: string; keep: string };
/** A draft of another type than its (deleted) published version: blocks. */
const BLOCKING = { _id: `drafts.${EVENTS.remove}`, _type: 'site', _rev: 'd1' } as Doc;

const count = (mutations: readonly Mutation[], type: string) =>
  mutations.filter((m) => m.type === type);
const ids = (mutations: readonly Mutation[]) => mutations.map((m) => (m as { id: string }).id);

describe('planMutations', () => {
  const mutations = planMutations(ALL);

  it('plans 38 patches and 15 deletes on the fixtures (2026-10-19 export)', () => {
    expect(count(mutations, 'patch')).toHaveLength(38);
    expect(count(mutations, 'delete')).toHaveLength(15);
    expect(mutations).toHaveLength(53);
  });

  it('deletes exactly the planned documents, after every patch', () => {
    expect(ids(count(mutations, 'delete')).sort()).toEqual(planDeletions(ALL).sort());
    const firstDelete = mutations.findIndex((m) => m.type === 'delete');
    expect(mutations.slice(firstDelete).every((m) => m.type === 'delete')).toBe(true);
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
      for (const p of m.patches) expect(p.path).toHaveLength(1);
    }
  });

  it('a second run writes nothing', () => {
    expect(planMutations(applyMutations(ALL, mutations))).toEqual([]);
  });

  it('never patches a document without a revision lock', () => {
    const pricing = { _id: 'p', _type: 'pricing', style: 'default' } as Doc;
    expect(() => planMutations([pricing])).toThrow(/p has no _rev/);
  });
});

describe('assertNoBlockingDrafts', () => {
  it('passes on the 2026-10-19 export: every draft is mapped with its published version', () => {
    expect(() => assertNoBlockingDrafts(ALL, { dryRun: false, env: {} })).not.toThrow();
  });

  it('refuses a real run and lists the blocking drafts', () => {
    expect(() => assertNoBlockingDrafts([...ALL, BLOCKING], { dryRun: false, env: {} })).toThrow(
      BLOCKING._id
    );
  });

  it('refuses a dry run too, unless the preview flag is set', () => {
    const all = [...ALL, BLOCKING];
    expect(() => assertNoBlockingDrafts(all, { dryRun: true, env: {} })).toThrow(IGNORE_DRAFTS_ENV);
    const warn = vi.fn();
    expect(() =>
      assertNoBlockingDrafts(all, { dryRun: true, env: { [IGNORE_DRAFTS_ENV]: '1' }, warn })
    ).not.toThrow();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining(BLOCKING._id));
  });

  it('ignores the preview flag on a real run', () => {
    expect(() =>
      assertNoBlockingDrafts([...ALL, BLOCKING], {
        dryRun: false,
        env: { [IGNORE_DRAFTS_ENV]: '1' },
      })
    ).toThrow(/ignored on a real run/);
  });
});

type Fetch = (query: string, params: Record<string, unknown>) => Promise<unknown>;

function fakeContext(dryRun: boolean, fetch: Fetch = async () => []) {
  const withConfig = vi.fn();
  const fetchSpy = vi.fn(fetch);
  withConfig.mockReturnValue({ fetch: fetchSpy });
  const context = { dryRun, client: { withConfig } } as unknown as MigrationContext;
  return { context, withConfig, fetch: fetchSpy };
}

describe('checkUnreferenced', () => {
  const deletes = planDeletions(ALL);

  it('offline: nothing references a deleted document once the run has repointed it', async () => {
    const warn = vi.fn();
    await checkUnreferenced(deletes, ALL, fakeContext(true).context, { fromExport: true, warn });
    expect(warn).not.toHaveBeenCalled();
  });

  it('judges a document this run patches as the run leaves it (same revision only)', async () => {
    const site = ALL.find((d) => d._id === 'site') as Doc;
    const live = async () => [site];
    await expect(
      checkUnreferenced([EVENTS.remove], ALL, fakeContext(false, live).context, {
        fromExport: false,
      })
    ).resolves.toBeUndefined();
    // Edited since the run read it: the repointing patch would fail, so the reference counts.
    const edited = async () => [{ ...site, _rev: 'newer' }];
    await expect(
      checkUnreferenced([EVENTS.remove], ALL, fakeContext(false, edited).context, {
        fromExport: false,
      })
    ).rejects.toThrow(`${EVENTS.remove} is still referenced by site`);
  });

  it('asks once, raw perspective, for every version of every deleted document', async () => {
    const { context, withConfig, fetch } = fakeContext(false);
    await checkUnreferenced(['a', 'drafts.b'], [], context, { fromExport: false });
    expect(withConfig).toHaveBeenCalledWith({ perspective: 'raw' });
    expect(fetch).toHaveBeenCalledTimes(1);
    const [query, params] = fetch.mock.calls[0] as [string, { refs: string[]; deleted: string[] }];
    expect(query).toContain('references($refs)');
    expect([...params.refs].sort()).toEqual(['a', 'b', 'drafts.a', 'drafts.b']);
    expect([...params.deleted].sort()).toEqual(['a', 'drafts.b']);
  });

  it('a document outside the run that references a deleted one: API dry run warns, real run throws', async () => {
    const referencing = async () => [
      { _id: 'art', _type: 'collection.article', l: { _ref: 'dead' } },
    ];
    const warn = vi.fn();
    await checkUnreferenced(['dead'], [], fakeContext(true, referencing).context, {
      fromExport: false,
      warn,
    });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('dead is still referenced by art'));
    await expect(
      checkUnreferenced(['dead'], [], fakeContext(false, referencing).context, {
        fromExport: false,
      })
    ).rejects.toThrow(/dead is still referenced by art/);
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
});

describe('assertNoFreshChanges', () => {
  it('re-reads the migrated and deleted types (raw) and passes when nothing changed', async () => {
    const { context, withConfig, fetch } = fakeContext(false, async () => ALL);
    await expect(assertNoFreshChanges(context, ALL)).resolves.toBeUndefined();
    expect(withConfig).toHaveBeenCalledWith({ perspective: 'raw' });
    expect(fetch.mock.calls[0]?.[1]).toEqual({ types: [...DOCUMENT_TYPES] });
  });

  it('refuses a blocking draft created after the run read the dataset', async () => {
    const { context } = fakeContext(false, async () => [...ALL, BLOCKING]);
    await expect(assertNoFreshChanges(context, ALL)).rejects.toThrow(BLOCKING._id);
  });

  it('refuses an old-shape document that changed or appeared since the run read it', async () => {
    const fresh = {
      _id: 'drafts.new',
      _type: 'pricing',
      _rev: 'n1',
      style: 'default',
    } as Doc;
    const { context } = fakeContext(false, async () => [...ALL, fresh]);
    await expect(assertNoFreshChanges(context, ALL)).rejects.toThrow(
      /drafts\.new changed since the run read it/
    );
  });

  it('ignores a new document the mapping would not touch', async () => {
    const fresh = { _id: 'new', _type: 'pricing', _rev: 'n1', title: 'Pro' } as Doc;
    const { context } = fakeContext(false, async () => [...ALL, fresh]);
    await expect(assertNoFreshChanges(context, ALL)).resolves.toBeUndefined();
  });

  it('refuses without a client', async () => {
    const context = { dryRun: false } as unknown as MigrationContext;
    await expect(assertNoFreshChanges(context, ALL)).rejects.toThrow(/no API client/);
  });
});

describe('assertLeadsExported', () => {
  const LEAD = { _id: 'lead-1', _type: 'lead', _rev: 'l1', email: 'a@example.com' } as Doc;

  it('passes when the dataset holds no lead documents (fixtures, 2026-10-19 export)', () => {
    expect(ALL.some((d) => d._type === 'lead')).toBe(false);
    expect(() => assertLeadsExported(ALL, { dryRun: false, env: {} })).not.toThrow();
  });

  it('a real run refuses while lead documents exist (they may be the only record)', () => {
    expect(() => assertLeadsExported([...ALL, LEAD], { dryRun: false, env: {} })).toThrow(
      LEADS_EXPORTED_ENV
    );
  });

  it('a dry run warns and continues', () => {
    const warn = vi.fn();
    expect(() =>
      assertLeadsExported([...ALL, LEAD], { dryRun: true, env: {}, warn })
    ).not.toThrow();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('lead-1'));
  });

  it('continues once the operator confirms the leads were exported', () => {
    const warn = vi.fn();
    expect(() =>
      assertLeadsExported([...ALL, LEAD], {
        dryRun: false,
        env: { [LEADS_EXPORTED_ENV]: '1' },
        warn,
      })
    ).not.toThrow();
    expect(warn).toHaveBeenCalled();
  });

  it('the default export refuses a real run with a lead before asking the API anything', async () => {
    const { context, fetch } = fakeContext(false);
    const source = async function* () {
      for (const doc of [...ALL, LEAD]) yield doc as never;
    };
    await expect(
      (async () => {
        for await (const _ of collectMigrationMutations(migration, source, context)) {
          // drain
        }
      })()
    ).rejects.toThrow(LEADS_EXPORTED_ENV);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('lockedDelete', () => {
  it('deletes in one transaction with a no-op patch that fails on a newer revision', () => {
    const t = lockedDelete({ _id: 'x', _type: 'page', _rev: 'r1' } as Doc);
    expect(t.type).toBe('transaction');
    const [guard, del] = t.mutations as Record<string, unknown>[];
    expect(guard).toMatchObject({ type: 'patch', id: 'x', options: { ifRevision: 'r1' } });
    expect((guard.patches as Array<{ op: { type: string } }>).map((p) => p.op.type)).toEqual([
      'unset',
    ]);
    expect(del).toEqual({ type: 'delete', id: 'x' });
  });

  it('refuses a document without a revision', () => {
    expect(() => lockedDelete({ _id: 'x', _type: 'page' } as Doc)).toThrow(/_rev/);
  });
});

describe('the default export, end to end', () => {
  afterEach(() => vi.unstubAllEnvs());

  async function yielded(input: readonly Doc[], context: MigrationContext) {
    const source = async function* () {
      for (const doc of input) yield doc as never;
    };
    const out: Array<Mutation | Transaction> = [];
    for await (const item of collectMigrationMutations(migration, source, context)) {
      out.push(...((Array.isArray(item) ? item : [item]) as Array<Mutation | Transaction>));
    }
    return out;
  }

  /** The yielded mutations, a locked delete counted as its delete. */
  async function run(input: readonly Doc[], context: MigrationContext) {
    return (await yielded(input, context)).map((m) =>
      m.type === 'transaction' ? (m.mutations[1] as Mutation) : m
    );
  }

  it('every delete is yielded revision-locked to the version the run read', async () => {
    const context = { dryRun: true } as unknown as MigrationContext;
    const out = await yielded(ALL, context);
    const locked = out.filter((m): m is Transaction => m.type === 'transaction');
    expect(locked).toHaveLength(15);
    expect(out.some((m) => m.type === 'delete')).toBe(false);
    for (const t of locked) {
      const id = (t.mutations[1] as { id: string }).id;
      expect(t.mutations).toEqual(lockedDelete(ALL.find((d) => d._id === id) as Doc).mutations);
    }
  });

  it('visits the migrated and the deleted types', () => {
    expect(migration.documentTypes).toEqual([...DOCUMENT_TYPES]);
  });

  it('a dry run yields 38 patches and 15 deletes, then a re-run yields nothing', async () => {
    const context = { dryRun: true } as unknown as MigrationContext;
    const mutations = await run(ALL, context);
    expect(count(mutations, 'patch')).toHaveLength(38);
    expect(count(mutations, 'delete')).toHaveLength(15);
    expect(await run(applyMutations(ALL, mutations), context)).toEqual([]);
  });

  it('a real run refuses on blocking drafts before asking the API anything', async () => {
    vi.stubEnv(IGNORE_DRAFTS_ENV, '1');
    const { context, fetch } = fakeContext(false);
    await expect(run([...ALL, BLOCKING], context)).rejects.toThrow(/ignored on a real run/);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('a real run refuses when the live dataset changed after the read', async () => {
    const fresh = { _id: 'drafts.new', _type: 'pricing', _rev: 'n1', style: 'x' } as Doc;
    const { context } = fakeContext(false, async (query) =>
      query.includes('references') ? [] : [...ALL, fresh]
    );
    await expect(run(ALL, context)).rejects.toThrow(/changed since the run read it/);
  });

  it('a real run on an unchanged dataset yields the planned mutations', async () => {
    const { context } = fakeContext(false, async (query) =>
      query.includes('references') ? [] : ALL
    );
    expect(await run(ALL, context)).toEqual(planMutations(ALL));
  });
});
