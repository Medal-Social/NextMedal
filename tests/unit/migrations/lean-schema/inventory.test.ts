import docs from '@tests/fixtures/lean-schema/documents.json';
import { describe, expect, it } from 'vitest';
import { applyMutations, planMutations } from '$/migrations/lean-schema/index';
import { assertDeletable, type Doc, planDeletions } from '$/migrations/lean-schema/map-documents';
import { checkLosses, readAllowList } from '$/scripts/lean-schema/string-inventory';

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
  it('loses no text in the documents it keeps beyond the allow-list (count and field path)', () => {
    const before = ALL.filter((d) => kept.has(d._id));
    expect(checkLosses(before, after, allowed)).toEqual([]);
  });

  it('every allow-list entry has a reason, a count and field paths', () => {
    expect(allowed.size).toBe(11);
    for (const [text, entry] of allowed) {
      expect(entry.reason.length, text).toBeGreaterThan(10);
      expect(entry.count, text).toBeGreaterThan(0);
      expect(entry.paths?.length, text).toBeGreaterThan(0);
    }
  });

  it('a copy loss hiding behind an allowed string is caught (the 404 "Contact us" button)', () => {
    const NOT_FOUND = 'e42857f2-facd-4728-9b0c-00867fcac79f';
    expect(allowed.get('Contact us')?.paths).toEqual(['page.title']);
    const broken = after.map((d) =>
      d._id === NOT_FOUND
        ? (JSON.parse(
            JSON.stringify(d).replace('"label":"Contact us"', '"label":"Contact"')
          ) as Doc)
        : d
    );
    const before = ALL.filter((d) => kept.has(d._id));
    const where = '(form.formTitle, page.title, page.modules.ctas.link.label)';
    expect(checkLosses(before, broken, allowed)).toEqual([
      `"Contact us": lost 2, allowed 1 ${where}`,
      `"Contact us": lost outside page.title ${where}`,
    ]);
  });

  it('the count alone is not enough: a loss at another field path is caught', () => {
    const before = [
      { _type: 'page', title: 'A' },
      { _type: 'site', label: 'A' },
    ];
    const moved = [{ _type: 'page', title: 'A' }];
    const allowTitle = new Map([
      ['A', { reason: 'orphan title', count: 1, paths: ['page.title'] }],
    ]);
    expect(checkLosses(before, moved, allowTitle)).toEqual([
      '"A": lost outside page.title (site.label)',
    ]);
    expect(checkLosses(before, [{ _type: 'site', label: 'A' }], allowTitle)).toEqual([]);
  });

  it('a stale allow-list entry (nothing lost) is reported', () => {
    const docsSame = [{ _type: 'page', title: 'A' }];
    expect(checkLosses(docsSame, docsSame, new Map([['A', { reason: 'r' }]]))).toEqual([
      '"A": on the allow-list but not lost',
    ]);
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
