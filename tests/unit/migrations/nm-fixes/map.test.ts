import ids from '@tests/fixtures/lean-schema/all-ids.json';
import docs from '@tests/fixtures/lean-schema/documents.json';
import { describe, expect, it } from 'vitest';
import { pageAnchors } from '@/lib/block-anchors';
import {
  fixAnchorParam,
  groupsToCreate,
  mapDocument,
  mapForm,
  mapPricing,
} from '$/migrations/nm-fixes/map';
import { type Doc, documentLookup, isObject, publishedId } from '$/migrations/nm-fixes/shared';
import { DEAD_GROUP_IDS, TRANSLATION_GROUPS } from '$/migrations/nm-fixes/translation-groups';

type Ref = { _ref?: string };
type Entry = { _key?: string; _type?: string; language?: string; value?: Ref };

const ALL = docs as Doc[];
const getDocument = documentLookup(ALL);
const byId = (id: string) => getDocument(id) as Doc;
const allIds = (ids as Array<{ _id: string }>).map((d) => d._id);
const published = new Set(allIds.filter((id) => !id.startsWith('drafts.')));
const exists = new Set(allIds.map(publishedId));

/** Runs the mapping like the Sanity CLI would: patches, deletes, createIfNotExists. */
function migrate(all: readonly Doc[]): Doc[] {
  const lookup = documentLookup(all);
  const out: Doc[] = [];
  const seen = new Set(all.map((d) => d._id));
  for (const doc of all) {
    const r = mapDocument(doc, { getDocument: lookup });
    if (r.action !== 'delete') out.push(r.action === 'patch' ? r.next : doc);
    for (const created of groupsToCreate(doc) as Doc[]) {
      if (seen.has(created._id)) continue;
      seen.add(created._id);
      out.push(created);
    }
  }
  return out;
}

const translationsOf = (group: Doc) => (group.translations as Entry[] | undefined) ?? [];
const groupsIn = (all: readonly Doc[]) => all.filter((d) => d._type === 'translation.metadata');

/** Keys that hold structure, not words. */
const NOT_TEXT = new Set(['params', 'style', 'listItem', 'marks']);

/** Every string a person typed (keys starting with _ are system values). */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    if (value.trim()) out.push(value);
  } else if (Array.isArray(value)) {
    for (const v of value) strings(v, out);
  } else if (isObject(value)) {
    for (const [k, v] of Object.entries(value))
      if (!k.startsWith('_') && !NOT_TEXT.has(k)) strings(v, out);
  }
  return out;
}

describe('anchor params', () => {
  const features = 'b874d2a9-d0a2-46ea-b675-39e4506b00d4';
  it('rewrites a stored module key to the fixed anchor and keeps a fixed one', () => {
    expect(fixAnchorParam('#decdb3fff7cb', byId(features))).toBe('#text');
    expect(fixAnchorParam('#module-decdb3fff7cb', byId(features))).toBe('#text');
    expect(fixAnchorParam('#features', byId('fa5f631e-545e-4fc2-b6b9-bebcd32dd29e'))).toBe(
      '#features'
    );
  });

  it('leaves unknown anchors, queries and links without a target alone', () => {
    expect(fixAnchorParam('#nope', byId(features))).toBe('#nope');
    expect(fixAnchorParam('?a=1', byId(features))).toBe('?a=1');
    expect(fixAnchorParam('#decdb3fff7cb', undefined)).toBe('#decdb3fff7cb');
  });

  it('after migration every stored hash link resolves, except the two approved nb/ar Home buttons', () => {
    const after = migrate(ALL);
    const lookup = documentLookup(after);
    const unresolved: string[] = [];
    const walk = (value: unknown, from: string) => {
      if (Array.isArray(value)) {
        for (const v of value) walk(v, from);
        return;
      }
      if (!isObject(value)) return;
      if (typeof value.params === 'string' && value.params.startsWith('#')) {
        const ref = isObject(value.internal) ? value.internal._ref : undefined;
        const target = typeof ref === 'string' ? lookup(publishedId(ref)) : undefined;
        const anchors = [...pageAnchors((target?.modules as never[]) ?? []).values()];
        if (!anchors.includes(value.params.slice(1))) unresolved.push(`${from} ${value.params}`);
      }
      for (const v of Object.values(value)) walk(v, from);
    };
    for (const d of after) walk(d, d._id);
    expect(unresolved.sort()).toEqual([
      '23c8c132-1b7a-4cc8-a4e6-bea80625cd06 #features',
      '74cbf377-263d-497a-9f1d-fe93ce6d62e2 #features',
    ]);
  });

  it('fixes the Features hero button and the English header link', () => {
    const after = migrate(ALL);
    const json = JSON.stringify(after);
    expect(json).not.toContain('#decdb3fff7cb');
    const site = after.find((d) => d._id === 'site') as Doc;
    expect(JSON.stringify(site.headerNav)).toContain('"params":"#text"');
  });
});

describe('prices', () => {
  it('moves price into the fields the site reads', () => {
    const r = mapDocument(byId('6d40e2e1-1aca-47cf-9c27-ed5b290e102d'));
    if (r.action !== 'patch') throw new Error('expected a patch');
    expect(r.next).toMatchObject({ monthlyPrice: '249', currency: '$', priceSuffix: '/month' });
    expect(r.next).not.toHaveProperty('price');
  });

  it('moves a price without currency and writes no currency', () => {
    const free = mapPricing(byId('1bc46c05-bdff-41dc-a281-e26dcee48d6f'));
    expect(free).toMatchObject({ monthlyPrice: 'Free', priceSuffix: 'forever' });
    expect(free).not.toHaveProperty('currency');
    const custom = mapPricing(byId('fa6acd77-2859-4c21-add7-165e3fdbe054'));
    expect(custom).toMatchObject({ monthlyPrice: 'Custom', priceSuffix: 'tailored to you' });
  });

  it('leaves the two drafts without a price alone (owner gate: discard)', () => {
    for (const id of [
      'drafts.1bc46c05-bdff-41dc-a281-e26dcee48d6f',
      'drafts.fa6acd77-2859-4c21-add7-165e3fdbe054',
    ]) {
      expect(mapDocument(byId(id)).action).toBe('skip');
    }
  });

  it('refuses unknown price parts and conflicting values', () => {
    expect(() =>
      mapPricing({ _id: 'p', _type: 'pricing', price: { base: '1', vat: true } })
    ).toThrow(/vat/);
    expect(() =>
      mapPricing({ _id: 'p', _type: 'pricing', monthlyPrice: '2', price: { base: '1' } })
    ).toThrow(/monthlyPrice/);
  });
});

describe('form texts', () => {
  const formId = '0305aaeb-eef8-4f13-b724-ebdd86591b83';

  it('makes the button, thank-you and consent texts per language, English = stored text', () => {
    const before = byId(formId);
    const r = mapDocument(before);
    if (r.action !== 'patch') throw new Error('expected a patch');
    expect(r.next.submitButtonText).toEqual([
      { _key: 'en', _type: 'internationalizedArrayStringValue', language: 'en', value: 'Submit' },
    ]);
    expect(r.next.successMessage).toEqual([
      {
        _key: 'en',
        _type: 'internationalizedArrayTextValue',
        language: 'en',
        value: 'Thank you! We have received your submission and will get back to you shortly.',
      },
    ]);
    const acceptance = r.next.acceptance as Record<string, unknown>;
    expect(acceptance.text).toEqual([
      { _key: 'en', _type: 'internationalizedArrayStringValue', language: 'en', value: 'Test' },
    ]);
    expect(acceptance.link).toEqual((before.acceptance as Record<string, unknown>).link);
    expect(r.next.requireConsent).toBe(before.requireConsent);
  });

  it('joins paragraphs and typed line breaks with a line break', () => {
    const next = mapForm({
      _id: 'f',
      _type: 'form',
      successMessage: [
        {
          _type: 'block',
          children: [
            { _type: 'span', text: 'Thanks' },
            { _type: 'span', text: '!' },
          ],
        },
        {
          _type: 'block',
          markDefs: [],
          children: [{ _type: 'span', marks: [], text: 'Line 1\nLine 2' }],
        },
      ],
    });
    expect((next.successMessage as Entry[])[0]).toMatchObject({ value: 'Thanks!\nLine 1\nLine 2' });
  });

  it('refuses a thank-you message with formatting a plain text field would lose', () => {
    const block = (extra: Record<string, unknown>) => ({
      _id: 'f',
      _type: 'form',
      successMessage: [{ _type: 'block', children: [{ _type: 'span', text: 'x' }], ...extra }],
    });
    expect(() => mapForm(block({ listItem: 'bullet' }))).toThrow();
    expect(() => mapForm(block({ markDefs: [{ _key: 'l', _type: 'link' }] }))).toThrow();
    expect(() =>
      mapForm(block({ children: [{ _type: 'span', marks: ['strong'], text: 'x' }] }))
    ).toThrow();
    expect(() => mapForm(block({ style: 'h2' }))).toThrow();
  });

  it('moves acceptance.required to requireConsent', () => {
    const next = mapForm({ _id: 'f', _type: 'form', acceptance: { text: 'Yes', required: true } });
    expect(next.requireConsent).toBe(true);
    expect(next.acceptance).not.toHaveProperty('required');
  });

  it('leaves the draft form (no texts) alone', () => {
    expect(mapDocument(byId(`drafts.${formId}`)).action).toBe('skip');
  });
});

describe('translation groups', () => {
  const pages = new Map(ALL.filter((d) => d._type === 'page').map((d) => [d._id, d]));

  it('the table only names published pages in the language it files them under', () => {
    for (const g of TRANSLATION_GROUPS) {
      for (const [lang, id] of Object.entries(g.pages)) {
        expect(published.has(id), `${g.label} ${id}`).toBe(true);
        expect(pages.get(id)?.language, `${g.label} ${id}`).toBe(lang);
      }
    }
  });

  it('new group ids never collide with an existing document and have no dot', () => {
    for (const g of TRANSLATION_GROUPS.filter((t) => t.create)) {
      expect(exists.has(g.id), g.id).toBe(false);
      expect(g.id).not.toContain('.');
    }
    for (const g of TRANSLATION_GROUPS.filter((t) => !t.create))
      expect(published.has(g.id), g.id).toBe(true);
  });

  it('the dead list is exactly the groups with fewer than two existing documents (minus the table)', () => {
    const groups = groupsIn(ALL);
    const dead = groups
      .filter((g) => !TRANSLATION_GROUPS.some((t) => t.id === g._id))
      .filter(
        (g) => translationsOf(g).filter((t) => t.value?._ref && exists.has(t.value._ref)).length < 2
      )
      .map((g) => g._id);
    expect(dead.sort()).toEqual([...DEAD_GROUP_IDS].sort());
    expect(groups).toHaveLength(25);
    expect(TRANSLATION_GROUPS.filter((t) => !t.create)).toHaveLength(7);
    expect(TRANSLATION_GROUPS.filter((t) => t.create)).toHaveLength(4);
    expect(DEAD_GROUP_IDS).toHaveLength(18);
  });

  it('after migration: 11 groups, each page in at most one, entries carry their language', () => {
    const groups = groupsIn(migrate(ALL));
    expect(groups.map((g) => g._id).sort()).toEqual(TRANSLATION_GROUPS.map((g) => g.id).sort());
    const owner = new Map<string, string>();
    for (const g of groups) {
      expect(g.schemaTypes).toEqual(['page']);
      for (const t of translationsOf(g)) {
        const ref = t.value?._ref as string;
        expect(owner.get(ref), `${ref} in ${g._id} and ${owner.get(ref)}`).toBeUndefined();
        owner.set(ref, g._id);
        expect(t).toMatchObject({
          _key: t.language,
          _type: 'internationalizedArrayReferenceValue',
        });
        expect(pages.get(ref)?.language).toBe(t.language);
      }
    }
    expect(owner.get('74cbf377-263d-497a-9f1d-fe93ce6d62e2')).toBe(
      'a0c55c92-0c7c-4173-b7fb-8a675af62268'
    );
  });

  it('creates the new groups from their English page only', () => {
    expect(groupsToCreate(byId('c0372fc3-5780-48cf-8a6f-681a4c4adac0')).map((g) => g._id)).toEqual([
      'tm-page-our-story',
    ]);
    expect(groupsToCreate(byId('41df2c1a-ea92-4590-8126-8378f7a56530'))).toEqual([]);
    expect(groupsToCreate(byId('fa5f631e-545e-4fc2-b6b9-bebcd32dd29e'))).toEqual([]);
  });

  it('every nb/ar site menu link finds its translation or falls back to a published page', () => {
    const after = migrate(ALL);
    const groups = groupsIn(after);
    const translate = (ref: string, lang: string) =>
      groups
        .map(translationsOf)
        .find((ts) => ts.some((t) => t.value?._ref === ref))
        ?.find((t) => t.language === lang)?.value?._ref;
    const site = after.find((d) => d._id === 'site') as Doc;
    let checked = 0;
    for (const lang of ['nb', 'ar']) {
      for (const field of ['headerNav', 'footerNav', 'footerLinks']) {
        const entry = (site[field] as Entry[]).find((e) => e._key === lang);
        const refs = JSON.stringify(entry).match(/"_ref":"[^"]+"/g) ?? [];
        for (const raw of refs) {
          const ref = raw.slice(8, -1);
          const target = translate(ref, lang) ?? ref;
          expect(published.has(target), `${lang} ${field} ${ref}`).toBe(true);
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
});

describe('the whole run', () => {
  it('loses no text where text moves', () => {
    for (const doc of ALL) {
      const r = mapDocument(doc, { getDocument });
      if (r.action !== 'patch') continue;
      const after = strings(r.next);
      for (const text of strings(doc)) {
        expect(
          after.some((s) => s.includes(text)),
          `${doc._id}: "${text}"`
        ).toBe(true);
      }
    }
  });

  it('only deletes the dead groups', () => {
    const deleted = ALL.filter((d) => mapDocument(d, { getDocument }).action === 'delete').map(
      (d) => d._id
    );
    expect(deleted.sort()).toEqual([...DEAD_GROUP_IDS].sort());
  });

  it('is deterministic and idempotent', () => {
    const once = migrate(ALL);
    expect(JSON.stringify(migrate(ALL))).toBe(JSON.stringify(once));
    const twice = migrate(once);
    expect(JSON.stringify(twice)).toBe(JSON.stringify(once));
    const lookup = documentLookup(once);
    expect(once.filter((d) => mapDocument(d, { getDocument: lookup }).action !== 'skip')).toEqual(
      []
    );
  });
});
