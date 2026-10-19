import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import fixtureDocuments from '@tests/fixtures/lean-schema/documents.json';
import { describe, expect, it } from 'vitest';
import { schemaTypes } from '@/sanity/schemaTypes';
import modulesField from '@/sanity/schemaTypes/fragments/modules';
import {
  DEVELOPER_BLOCK_NAMES,
  FIELD_BUDGET_ALLOWLIST,
  PAGE_BLOCK_NAMES,
} from '@/sanity/schemaTypes/page-blocks';
import { mapAll } from '$/migrations/lean-schema/map-documents';

type Field = {
  name: string;
  type: string;
  title?: string;
  description?: string;
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

  it('holds the 14 blocks plus the developer showcase', () => {
    expect(PAGE_BLOCK_NAMES).toHaveLength(14);
    expect([...accepted].sort()).toEqual([...PAGE_BLOCK_NAMES, ...DEVELOPER_BLOCK_NAMES].sort());
  });

  it('accepts every block stored on the migrated fixture pages (prod is migrated)', () => {
    type Page = { _type: string; modules?: Array<{ _type: string }> };
    const pages = (mapAll(fixtureDocuments as never) as unknown as Page[]).filter(
      (doc) => doc._type === 'page'
    );
    const stored = new Set(pages.flatMap((doc) => (doc.modules ?? []).map((m) => m._type)));
    expect(stored.size).toBeGreaterThan(0);
    expect([...stored].filter((type) => !accepted.includes(type))).toEqual([]);
  });

  it('after the lean-schema migration, pages store only offered or developer blocks', () => {
    type Page = { _type: string; modules?: Array<{ _type: string }> };
    const pages = (mapAll(fixtureDocuments as never) as unknown as Page[]).filter(
      (doc) => doc._type === 'page'
    );
    const stored = new Set(pages.flatMap((doc) => (doc.modules ?? []).map((m) => m._type)));
    const allowed = [...PAGE_BLOCK_NAMES, ...DEVELOPER_BLOCK_NAMES] as string[];
    expect([...stored].filter((type) => !allowed.includes(type))).toEqual([]);
  });

  it('offers the five insert groups in order', () => {
    expect(groups.map((g) => g.name)).toEqual(['Page top', 'Text', 'Features', 'Prices', 'Lists']);
  });

  it.each(PAGE_BLOCK_NAMES)('%s is in exactly one insert group', (name) => {
    expect(groups.filter((g) => g.of.includes(name))).toHaveLength(1);
  });

  it('offers no developer type in any group', () => {
    const offered = groups.flatMap((g) => g.of);
    for (const name of DEVELOPER_BLOCK_NAMES) expect(offered).not.toContain(name);
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

  it('is lean: plain title, description, list preview, no knobs, within budget', () => {
    expect(leanProblems(name)).toEqual([]);
  });

  it('is not labelled "Old"', () => {
    expect(block(name).title).not.toMatch(/^Old\b/);
  });
});

describe('field budget allowlist', () => {
  it('is empty: every block fits in 5 fields (spec §1)', () => {
    expect(Object.keys(FIELD_BUDGET_ALLOWLIST)).toEqual([]);
  });
});

type Labelled = { title?: string; description?: string; fields?: Labelled[]; of?: Labelled[] };

/** Every title and description an editor reads on a type, its fields and members. */
function labels(type: Labelled | undefined): string[] {
  if (!type) return [];
  return [
    type.title,
    type.description,
    ...(type.fields ?? []).flatMap(labels),
    ...(type.of ?? []).flatMap(labels),
  ].filter((text): text is string => typeof text === 'string');
}

/** Words non-technical editors should never read (skill rule 4). */
const JARGON =
  /\b(CTA|Call-to-actions?|Hero|Advanced Options|Anchor ID|Ghost|Lead Magnet|Frontpage|Logo Cloud|variant|UID)\b/i;

describe('plain labels', () => {
  it.each([...PAGE_BLOCK_NAMES, 'cta', 'img', 'lead-magnet', 'pricing'])(
    '%s uses no developer words',
    (name) => {
      expect(labels(registered.get(name) as Labelled).filter((text) => JARGON.test(text))).toEqual(
        []
      );
    }
  );
});

describe('buttons', () => {
  it('cta has no style field (looks come from blockDesign)', () => {
    expect(fieldNames(block('cta').fields)).not.toContain('style');
  });

  it('cta is called "Button or link"', () => {
    expect(block('cta').title).toBe('Button or link');
  });
});

describe('pictures', () => {
  it('img asks to describe the picture', () => {
    const alt = block('img').fields.find((f) => f.name === 'alt');
    expect(alt).toMatchObject({ type: 'string', title: 'Describe the picture' });
    expect(block('img').title).toBe('Picture');
  });
});

describe('placement blocks', () => {
  it('lead-magnet has no design knobs', () => {
    expect(fieldNames(block('lead-magnet').fields).filter((n) => KNOB.test(n))).toEqual([]);
  });

  it('price plan has no card style', () => {
    expect(fieldNames(block('pricing').fields)).not.toContain('style');
  });
});

describe('developer types', () => {
  it('component-gallery says it is not for editors', () => {
    expect(block('component-gallery')).toMatchObject({
      title: 'Component gallery',
      description: 'Developer showcase used on /components. Not for editors.',
    });
  });
});
