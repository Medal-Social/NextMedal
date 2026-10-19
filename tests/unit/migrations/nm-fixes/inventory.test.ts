import docs from '@tests/fixtures/lean-schema/documents.json';
import { describe, expect, it } from 'vitest';
import { applyMutations, planMutations } from '$/migrations/nm-fixes/index';
import type { Doc } from '$/migrations/nm-fixes/shared';
import { DEAD_GROUP_IDS } from '$/migrations/nm-fixes/translation-groups';
import { inventory, lostStrings, readAllowList } from '$/scripts/lean-schema/string-inventory';

const ALL = docs as Doc[];
const after = applyMutations(ALL, planMutations(ALL));
const kept = new Set(after.map((d) => d._id));

describe('nm-fixes string inventory', () => {
  it('loses no text in the documents it keeps (allow-list stays empty)', () => {
    const allowed = readAllowList('migrations/nm-fixes/allowed-losses.txt');
    expect(allowed.size).toBe(0);
    const before = ALL.filter((d) => kept.has(d._id));
    expect(lostStrings(inventory(before), inventory(after), allowed)).toEqual([]);
  });

  it('removes exactly the 18 dead translation groups', () => {
    const removed = ALL.filter((d) => !kept.has(d._id)).map((d) => d._id);
    expect(removed.sort()).toEqual([...DEAD_GROUP_IDS].sort());
  });

  it('a second run plans nothing', () => {
    expect(planMutations(after)).toEqual([]);
  });
});
