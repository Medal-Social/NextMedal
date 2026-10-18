import docs from '@tests/fixtures/lean-schema/documents.json';
import type { MigrationContext } from 'sanity/migrate';
import { describe, expect, it, vi } from 'vitest';
import {
  applyMutations,
  assertNoBlockingDrafts,
  checkUnreferenced,
  IGNORE_DRAFTS_ENV,
  planMutations,
} from '$/migrations/nm-fixes/index';
import type { Doc } from '$/migrations/nm-fixes/shared';
import { DEAD_GROUP_IDS } from '$/migrations/nm-fixes/translation-groups';

const ALL = docs as Doc[];
const PUBLISHED = ALL.filter((d) => !d._id.startsWith('drafts.'));
const BLOCKING = [
  'drafts.0305aaeb-eef8-4f13-b724-ebdd86591b83',
  'drafts.1bc46c05-bdff-41dc-a281-e26dcee48d6f',
  'drafts.fa6acd77-2859-4c21-add7-165e3fdbe054',
];

const count = (mutations: ReturnType<typeof planMutations>, type: string) =>
  mutations.filter((m) => m.type === type);

describe('planMutations', () => {
  const mutations = planMutations(ALL);

  it('plans 13 patches, 18 deletes and 4 createIfNotExists on the 2026-10-18 export', () => {
    expect(count(mutations, 'patch')).toHaveLength(13);
    expect(count(mutations, 'delete')).toHaveLength(18);
    expect(count(mutations, 'createIfNotExists')).toHaveLength(4);
    expect(mutations).toHaveLength(35);
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
    const existing = { _id: 'tm-page-terms', _type: 'translation.metadata' } as Doc;
    const created = count(planMutations([...ALL, existing]), 'createIfNotExists').map(
      (m) => (m as { document: Doc }).document._id
    );
    expect(created).not.toContain('tm-page-terms');
    expect(created).toHaveLength(3);
  });

  it('a second run writes nothing', () => {
    expect(planMutations(applyMutations(ALL, mutations))).toEqual([]);
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

describe('checkUnreferenced', () => {
  const context = (dryRun: boolean, refs: string[] | Error = []) =>
    ({
      dryRun,
      client: {
        withConfig: () => ({
          fetch: async () => {
            if (refs instanceof Error) throw refs;
            return refs;
          },
        }),
      },
    }) as unknown as MigrationContext;

  it('offline dry run checks the export itself and only warns', async () => {
    const warn = vi.fn();
    const page = { _id: 'p', _type: 'page', group: { _ref: 'dead' } } as Doc;
    await checkUnreferenced(['dead'], [page], context(true), { fromExport: true, warn });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('dead is still referenced by p'));
  });

  it('API dry run warns, a real run throws', async () => {
    const warn = vi.fn();
    await checkUnreferenced(['dead'], [], context(true, ['x']), { fromExport: false, warn });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('dead is still referenced by x'));
    await expect(
      checkUnreferenced(['dead'], [], context(false, ['x']), { fromExport: false, warn })
    ).rejects.toThrow(/dead is still referenced by x/);
  });

  it('a real run fails when the reference check fails', async () => {
    await expect(
      checkUnreferenced(['dead'], [], context(false, new Error('boom')), { fromExport: false })
    ).rejects.toThrow(/boom/);
  });

  it('the dead groups are referenced by nothing in the export', async () => {
    const warn = vi.fn();
    await checkUnreferenced(DEAD_GROUP_IDS, ALL, context(true), { fromExport: true, warn });
    expect(warn).not.toHaveBeenCalled();
  });
});
