import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import fixtureDocuments from '@tests/fixtures/lean-schema/documents.json';
import { describe, expect, it } from 'vitest';
import { schemaTypes } from '@/sanity/schemaTypes';
import modulesField from '@/sanity/schemaTypes/fragments/modules';
import {
  DEPRECATED_BLOCK_NAMES,
  DEVELOPER_BLOCK_NAMES,
  FIELD_BUDGET_ALLOWLIST,
  PAGE_BLOCK_NAMES,
} from '@/sanity/schemaTypes/page-blocks';

type Field = {
  name: string;
  type: string;
  fieldset?: string;
  hidden?: unknown;
  fields?: Field[];
  of?: Array<{ type: string; name?: string; fields?: Field[] }>;
};
type Block = {
  name: string;
  title?: string;
  description?: string;
  fields: Field[];
  groups?: unknown[];
  preview?: { select?: Record<string, string> };
};

/** Vault spec 2026-10-18 §1: no design knobs on any page block. */
const KNOB =
  /^(tone|variant|layout|style|options|anchorId|headlineSize|show[A-Z]\w*|limit\w*|dark|bg[A-Z]\w*|columns|groupByYear|filterByType|hidePastEvents|sidebarStyle|uncategorized\w*|categoryOrder|defaultArticle|videoType|open|generateSchema)$/;
const BUDGET = 5;
const HARD_CAP = 9;

/** Blocks not yet stripped of their knobs (plan Task 20 empties this). */
const NOT_YET_LEAN = new Set<string>(PAGE_BLOCK_NAMES);

const registered = new Map((schemaTypes as unknown as Block[]).map((type) => [type.name, type]));
const block = (name: string) => registered.get(name) as Block;

/** Editor-visible units: each field outside a fieldset, plus one per fieldset. */
function editorUnits(b: Block): number {
  const fieldsets = new Set<string>();
  let fields = 0;
  for (const f of b.fields) {
    if (f.hidden === true) continue;
    if (f.fieldset) fieldsets.add(f.fieldset);
    else fields++;
  }
  return fields + fieldsets.size;
}

function fieldNames(fields: Field[] = []): string[] {
  return fields.flatMap((f) => [
    f.name,
    ...fieldNames(f.fields),
    ...(f.of ?? []).flatMap((member) => fieldNames(member.fields)),
  ]);
}

/** Every lean-check failure for a block (empty = lean). */
function leanProblems(name: string): string[] {
  const b = block(name);
  const problems: string[] = [];
  if (!/^[A-Z][a-z]+( [a-z]+)*$/.test(b.title ?? ''))
    problems.push(`title "${b.title}" is not plain`);
  if ((b.description?.length ?? 0) <= 20) problems.push('no description');
  if (!b.preview?.select) problems.push('no list preview');
  if (b.groups) problems.push('tabs hide fields; use collapsed fieldsets');
  const knobs = fieldNames(b.fields).filter((n) => KNOB.test(n));
  if (knobs.length) problems.push(`design knobs: ${knobs.join(', ')}`);
  const units = editorUnits(b);
  if (units > HARD_CAP) problems.push(`${units} fields, hard cap ${HARD_CAP}`);
  if (units > BUDGET && !FIELD_BUDGET_ALLOWLIST[name]) {
    problems.push(`${units} fields, budget ${BUDGET}, not allowlisted`);
  }
  return problems;
}

const PREVIEWS = resolve(__dirname, '../../../public/block-previews');

/** Width and height from a PNG's IHDR chunk. */
function pngSize(file: string): { width: number; height: number } {
  const bytes = readFileSync(file);
  expect(bytes.subarray(1, 4).toString('ascii')).toBe('PNG');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe('the page modules array', () => {
  const field = modulesField as unknown as {
    of: Array<{ type: string }>;
    options: { insertMenu: { groups: Array<{ name: string; of: string[] }> } };
  };
  const groups = field.options.insertMenu.groups;
  const accepted = field.of.map((m) => m.type);

  it('holds the 14 blocks plus the developer and deprecated types', () => {
    expect(PAGE_BLOCK_NAMES).toHaveLength(14);
    expect([...accepted].sort()).toEqual(
      [...PAGE_BLOCK_NAMES, ...DEVELOPER_BLOCK_NAMES, ...DEPRECATED_BLOCK_NAMES].sort()
    );
  });

  it('accepts every block stored on the fixture pages', () => {
    type Page = { _type: string; modules?: Array<{ _type: string }> };
    const pages = (fixtureDocuments as Page[]).filter((doc) => doc._type === 'page');
    const stored = new Set(pages.flatMap((doc) => (doc.modules ?? []).map((m) => m._type)));
    expect(stored.size).toBeGreaterThan(0);
    expect([...stored].filter((type) => !accepted.includes(type))).toEqual([]);
  });

  // enabled in Task 24: the same check over the pages after mapDocument
  // (import { mapDocument } from '$/migrations/lean-schema/map-documents').

  it('offers the five insert groups in order', () => {
    expect(groups.map((g) => g.name)).toEqual(['Page top', 'Text', 'Features', 'Prices', 'Lists']);
  });

  it.each(PAGE_BLOCK_NAMES)('%s is in exactly one insert group', (name) => {
    expect(groups.filter((g) => g.of.includes(name))).toHaveLength(1);
  });

  it('offers no developer or deprecated type in any group', () => {
    const offered = groups.flatMap((g) => g.of);
    for (const name of [...DEVELOPER_BLOCK_NAMES, ...DEPRECATED_BLOCK_NAMES])
      expect(offered).not.toContain(name);
  });
});

describe('insert-menu preview images', () => {
  it('has no orphan preview for a type the menu does not offer', () => {
    const names = readdirSync(PREVIEWS)
      .filter((file) => file.endsWith('.png'))
      .map((file) => file.replace(/\.png$/, ''));
    const known = new Set<string>(PAGE_BLOCK_NAMES);
    expect(names.filter((name) => !known.has(name))).toEqual([]);
  });
});

describe.each(PAGE_BLOCK_NAMES)('block %s', (name) => {
  it('is registered and has a grid preview image of at most 600 x 420', () => {
    expect(registered.has(name)).toBe(true);
    const file = resolve(PREVIEWS, `${name}.png`);
    expect(existsSync(file)).toBe(true);
    const { width, height } = pngSize(file);
    expect(width).toBeLessThanOrEqual(600);
    expect(height).toBeLessThanOrEqual(420);
  });

  it.skipIf(NOT_YET_LEAN.has(name))(
    'is lean: plain title, description, list preview, no knobs, within budget',
    () => {
      expect(leanProblems(name)).toEqual([]);
    }
  );

  it('is not labelled "Old"', () => {
    expect(block(name).title).not.toMatch(/^Old\b/);
  });
});

describe('field budget allowlist', () => {
  it('is empty: every block fits in 5 fields (spec §1)', () => {
    expect(Object.keys(FIELD_BUDGET_ALLOWLIST)).toEqual([]);
  });
});
