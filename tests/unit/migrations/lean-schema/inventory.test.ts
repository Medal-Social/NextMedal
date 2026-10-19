import docs from '@tests/fixtures/lean-schema/documents.json';
import { describe, expect, it } from 'vitest';
import { applyMutations, planMutations } from '$/migrations/lean-schema/index';
import { assertDeletable, type Doc, planDeletions } from '$/migrations/lean-schema/map-documents';
import { inventory, lostStrings, readAllowList } from '$/scripts/lean-schema/string-inventory';

/** Production after nm-fixes (2026-10-19 export) → after lean-schema. */
const ALL = docs as Doc[];
const after = applyMutations(ALL, planMutations(ALL));
const kept = new Set(after.map((d) => d._id));
const allowed = readAllowList('migrations/lean-schema/allowed-losses.txt');

/** The developer showcase (/components) keeps its stored previews (D8). */
const GALLERY_PAGE = '01914fd8-6f5c-4b9d-8830-065fe8f413a5';

/** Every object of `type` that still stores `key`, at any depth. */
function withKey(value: unknown, type: string, key: string): unknown[] {
  if (Array.isArray(value)) return value.flatMap((item) => withKey(item, type, key));
  if (!value || typeof value !== 'object') return [];
  const obj = value as Record<string, unknown>;
  const own = obj._type === type && key in obj ? [obj] : [];
  return [...own, ...Object.values(obj).flatMap((inner) => withKey(inner, type, key))];
}

describe('lean-schema string inventory', () => {
  it('loses no text in the documents it keeps, except the allow-list', () => {
    const before = ALL.filter((d) => kept.has(d._id));
    expect(lostStrings(inventory(before), inventory(after), allowed)).toEqual([]);
  });

  it('every allow-list entry has a reason and is really lost (no stale entries)', () => {
    const before = ALL.filter((d) => kept.has(d._id));
    const lost = lostStrings(inventory(before), inventory(after));
    for (const [text, reason] of allowed) {
      expect(reason.length, text).toBeGreaterThan(10);
      expect(lost, text).toContain(text);
    }
  });

  it('removes exactly the planned documents', () => {
    const removed = ALL.filter((d) => !kept.has(d._id)).map((d) => d._id);
    expect(removed.sort()).toEqual(planDeletions(ALL).sort());
    expect(() => assertDeletable(ALL)).not.toThrow();
  });

  it('leaves no button style anywhere and no design knob on any page block', () => {
    expect(withKey(ALL, 'cta', 'style').length).toBeGreaterThan(30);
    expect(withKey(after, 'cta', 'style')).toEqual([]);
    const pages = JSON.stringify(
      after.filter((d) => d._type === 'page' && d._id !== GALLERY_PAGE).map((d) => d.modules)
    );
    for (const knob of [
      '"options"',
      '"bgFrom"',
      '"videoType"',
      '"generateSchema"',
      '"showRssLink"',
      '"layout"',
      '"limit"',
      '"open"',
      '"anchorId"',
      '"uid"',
      '"videoHero"',
    ]) {
      expect(pages, knob).not.toContain(knob);
    }
    expect(withKey(after, 'lead-magnet', 'style')).toEqual([]);
  });

  it('a second run plans nothing', () => {
    expect(planMutations(after)).toEqual([]);
  });
});
