import ids from '@tests/fixtures/lean-schema/all-ids.json';
import docs from '@tests/fixtures/lean-schema/documents.json';
import beforeNmFixes from '@tests/fixtures/nm-fixes/documents.json';
import { describe, expect, it } from 'vitest';
import { bannerBlocks } from '@/components/blocks/layout/banner/Banner.client';
import {
  assertDeletable,
  blockingDrafts,
  DELETE_TYPES,
  type Doc,
  DUPLICATE_PAGES,
  EMPTY_DRAFT_IDS,
  fixHrefLinks,
  mapAll,
  mapDocument,
  planDeletions,
} from '$/migrations/lean-schema/map-documents';
import { isObject, publishedId, UnmappedContentError } from '$/migrations/nm-fixes/shared';

const ALL = docs as Doc[];
const byId = (id: string) => ALL.find((d) => d._id === id) as Doc;
const next = (doc: Doc) => {
  const result = mapDocument(doc);
  if (result.action !== 'patch') throw new Error(`${doc._id}: ${result.action}`);
  return result.next;
};
const AFTER = mapAll(ALL);
const deleted = new Set(planDeletions(ALL));
const isDraft = (id: string) => id.startsWith('drafts.');

/** Every object of `type` that still stores `key`, at any depth. */
function withKey(value: unknown, type: string, key: string): unknown[] {
  if (Array.isArray(value)) return value.flatMap((item) => withKey(item, type, key));
  if (!value || typeof value !== 'object') return [];
  const obj = value as Record<string, unknown>;
  const own = obj._type === type && key in obj ? [obj] : [];
  return [...own, ...Object.values(obj).flatMap((inner) => withKey(inner, type, key))];
}

const FORM = '0305aaeb-eef8-4f13-b724-ebdd86591b83';
const EVENTS_GROUP = '0a41c124-1e2c-4a1b-a870-4163c342b0d1';

describe('deletions', () => {
  it('deletes the orphan documents, the duplicate list pages and the empty redirect draft', () => {
    expect([...deleted].sort()).toEqual(
      [
        // navigation ×2, global-module (+ draft), testimonial, gallery, announcement
        'baa0268b-aac9-44cb-a682-1ecc7d8e4a97',
        'e930bfec-6e98-4ebe-bdc1-4b9e655928de',
        '63f0df33-9319-40dd-9110-deb6fb5dba8c',
        'drafts.63f0df33-9319-40dd-9110-deb6fb5dba8c',
        '78860c2c-6944-4f91-a20a-b6f8e14949ad',
        '64bbccbf-6214-4e0a-b742-4e032e79dddb',
        '16fb6953-a47e-4abc-8a48-2e5064910b1e',
        // drafts: intranet.department, global-layout, component.library, redirect
        'drafts.d48a21ee-bd8e-4597-b020-9eaa5a6cb3d0',
        'drafts.5f787c9d-44e4-49d5-838a-d1f8f0046cb2',
        'drafts.cc148fc5-fb10-45d7-ae86-2622f40f1655',
        ...EMPTY_DRAFT_IDS,
        ...DUPLICATE_PAGES.map((d) => d.remove),
      ].sort()
    );
  });

  it('deletes sanity.assist.task.status (never in the public fixtures)', () => {
    expect(DELETE_TYPES).toContain('sanity.assist.task.status');
    expect(
      mapDocument({ _id: 'sanity.assist.status.x', _type: 'sanity.assist.task.status' })
    ).toEqual({
      action: 'delete',
    });
  });

  it('refuses to delete the redirect draft once it has content', () => {
    const draft = { ...byId(EMPTY_DRAFT_IDS[0]), source: '/old' };
    expect(() => mapDocument(draft)).toThrow(UnmappedContentError);
  });

  it('nothing that survives references a deleted document (after the repointing)', () => {
    expect(() => assertDeletable(ALL)).not.toThrow();
  });

  it('without the repointing the header menus and 4 events still reference the removed events page', () => {
    const removed = DUPLICATE_PAGES.find((d) => d.slug === 'events')?.remove as string;
    const stillLinking = ALL.filter((d) => JSON.stringify(d).includes(`"_ref":"${removed}"`))
      .map((d) => d._id)
      .filter((id) => !deleted.has(id));
    expect(stillLinking.sort()).toEqual(
      [
        'site',
        '6ef5d186-0a4a-4285-9d24-a4277d6c6233',
        '8518d91c-4d43-4356-b043-45fddc85218c',
        '910e52c9-92ea-4414-b34a-115cf9c8d746',
        'fc24e99f-3499-4a7f-a21c-88fa069f31fb',
      ].sort()
    );
    // A type the mapping does not visit keeps its reference: the check catches it.
    expect(() =>
      assertDeletable(ALL.map((d) => (d._id === 'site' ? { ...d, _type: 'site-unmapped' } : d)))
    ).toThrow(UnmappedContentError);
  });
});

describe('pages', () => {
  it('drop the orphan page.title (metadata.title names the page)', () => {
    const titled = ALL.filter(
      (d) => d._type === 'page' && d.title !== undefined && !deleted.has(d._id)
    );
    expect(titled).toHaveLength(8);
    for (const doc of titled) expect(next(doc)).not.toHaveProperty('title');
  });

  it('refuse a page title that is the only name', () => {
    expect(() =>
      mapDocument({ _id: 'p', _type: 'page', title: 'Only', metadata: { slug: { current: 'x' } } })
    ).toThrow(UnmappedContentError);
  });

  it('map every module (no knobs, no button styles, no videoHero)', () => {
    const pages = JSON.stringify(AFTER.filter((d) => d._type === 'page'));
    for (const knob of [
      '"bgFrom"',
      '"videoType"',
      '"generateSchema"',
      '"showRssLink"',
      '"videoHero"',
    ]) {
      const outsideGallery = AFTER.filter(
        (d) => d._type === 'page' && d._id !== '01914fd8-6f5c-4b9d-8830-065fe8f413a5'
      );
      expect(JSON.stringify(outsideGallery), knob).not.toContain(knob);
    }
    expect(withKey(JSON.parse(pages), 'cta', 'style')).toEqual([]);
  });

  it('the campaigns draft (Mux videoHero, no video) gets an empty page top', () => {
    const draft = next(byId('drafts.d07089e3-9594-4543-81d4-397b70cd7a8d'));
    expect(draft.modules).toEqual([{ _type: 'hero', _key: '8b183b7374ed' }]);
  });
});

describe('site, pricing, placement, banner', () => {
  it('site: no button styles; the copyright link is an external link in every language', () => {
    const site = next(byId('site'));
    expect(withKey(byId('site'), 'cta', 'style').length).toBeGreaterThan(0);
    expect(withKey(site, 'cta', 'style')).toEqual([]);
    const links = (site.copyright as Array<{ value: Array<{ markDefs: unknown[] }> }>).flatMap(
      (l) => l.value.flatMap((b) => b.markDefs)
    );
    expect(links).toEqual(
      ['en', 'nb', 'ar'].map(() => ({
        _key: 'def411e4c230',
        _type: 'link',
        type: 'external',
        external: 'https://www.medalsocial.com',
      }))
    );
  });

  it('site: every per-language entry gets its language (v5 `language` field)', () => {
    const site = next(byId('site'));
    for (const field of [
      'headerNav',
      'ctas',
      'copyright',
      'footerNav',
      'footerLinks',
      'tagline',
      'title',
    ]) {
      const entries = site[field] as Array<{ _key: string; language?: string }>;
      expect(
        entries.map((e) => [e._key, e.language]),
        field
      ).toEqual([
        ['en', 'en'],
        ['nb', 'nb'],
        ['ar', 'ar'],
      ]);
    }
    // Only `language` is added; the values are left as stored.
    const strip = (v: unknown) =>
      (v as Record<string, unknown>[]).map(({ language: _l, ...rest }) => rest);
    expect(strip(site.footerNav)).toEqual(byId('site').footerNav);
    expect(strip(site.title)).toEqual(byId('site').title);
    expect(site.socialLinks).toEqual(byId('site').socialLinks);
  });

  it('banner draft: its href link becomes an external link', () => {
    const banner = next(byId('drafts.751a3c7d-1982-4b18-94cb-e9df4628fccc'));
    expect(JSON.stringify(banner)).toContain('"type":"external","external":"https://google.com"');
    expect(JSON.stringify(banner)).not.toContain('"href"');
  });

  const BANNERS = ALL.filter((d) => d._type === 'banner');
  const bannerOut = (doc: Doc) => {
    const result = mapDocument(doc);
    return result.action === 'patch' ? result.next : doc;
  };

  it('banner: content stored as plain blocks becomes one English entry (published + drafts)', () => {
    expect(BANNERS).toHaveLength(4);
    for (const doc of BANNERS) {
      const content = bannerOut(doc).content as Record<string, unknown>[];
      expect(
        content.map((e) => [e._key, e._type, e.language]),
        doc._id
      ).toEqual([['en', 'internationalizedArrayBlockContentValue', 'en']]);
      const plain = (doc.content as Array<{ _type: string }>).filter((b) => b._type === 'block');
      expect(JSON.stringify(content[0].value), doc._id).toBe(
        JSON.stringify(fixHrefLinks(plain, doc._id))
      );
    }
  });

  it('banner: every language shows the same blocks as before the migration', () => {
    for (const doc of BANNERS) {
      for (const locale of ['en', 'nb', 'ar']) {
        const before = bannerBlocks(fixHrefLinks(doc.content, doc._id) as never, locale);
        const after = bannerBlocks(bannerOut(doc).content as never, locale);
        expect(after, `${doc._id} ${locale}`).toEqual(before);
      }
    }
  });

  it('banner: refuses plain blocks next to a filled English entry', () => {
    const block = { _key: 'b', _type: 'block', children: [{ _type: 'span', text: 'x' }] };
    const doc = {
      _id: 'b1',
      _type: 'banner',
      content: [
        block,
        { _key: 'en', _type: 'internationalizedArrayBlockContentValue', value: [block] },
      ],
    } as Doc;
    expect(() => mapDocument(doc)).toThrow(UnmappedContentError);
  });

  it('a gallery intro link keeps its href (the gallery schema edits href links)', () => {
    const components = byId('01914fd8-6f5c-4b9d-8830-065fe8f413a5');
    const link = { _key: 'l1', _type: 'link', href: 'https://example.com' };
    const gallery = (components.modules as Record<string, unknown>[])[0];
    const doc = {
      ...components,
      modules: [
        {
          ...gallery,
          intro: [
            {
              _key: 'i1',
              _type: 'block',
              markDefs: [link],
              children: [{ _key: 's1', _type: 'span', marks: ['l1'], text: 'Docs' }],
            },
          ],
        },
      ],
    } as Doc;
    const out = mapDocument(doc);
    const mapped = out.action === 'patch' ? out.next : doc;
    const intro = (mapped.modules as Array<{ intro: Array<{ markDefs: unknown[] }> }>)[0].intro;
    expect(intro[0].markDefs).toEqual([link]);
  });

  it('fixHrefLinks refuses a link with an href and another target', () => {
    expect(() =>
      fixHrefLinks({ _type: 'link', href: 'https://a', internal: { _ref: 'x' } }, 't')
    ).toThrow(UnmappedContentError);
    expect(() => fixHrefLinks({ _type: 'link', href: 'https://a', type: 'internal' }, 't')).toThrow(
      UnmappedContentError
    );
  });

  it('pricing: drops style and button styles, keeps the prices', () => {
    for (const doc of ALL.filter((d) => d._type === 'pricing')) {
      const result = mapDocument(doc);
      const out = result.action === 'patch' ? result.next : doc;
      expect(out).not.toHaveProperty('style');
      expect(withKey(out, 'cta', 'style')).toEqual([]);
      expect(out.monthlyPrice).toBe(doc.monthlyPrice);
    }
  });

  it('placement: the download offer loses style "featured" (the rendered default), nothing else', () => {
    const placement = ALL.find((d) => d._type === 'placement') as Doc;
    const [before] = placement.modules as Record<string, unknown>[];
    const [after] = next(placement).modules as Record<string, unknown>[];
    const { style: _style, ...rest } = before;
    expect(after).toEqual(rest);
  });

  it('placement: refuses another download-offer look and filled options', () => {
    const with_ = (m: Record<string, unknown>) => ({
      _id: 'pl',
      _type: 'placement',
      modules: [{ _type: 'lead-magnet', _key: 'l', ...m }],
    });
    expect(() => mapDocument(with_({ style: 'sidebar' }))).toThrow(UnmappedContentError);
    expect(() => mapDocument(with_({ options: { uid: 'x' } }))).toThrow(UnmappedContentError);
    expect(() => mapDocument(with_({ mystery: 'x' }))).toThrow(UnmappedContentError);
  });
});

describe('form leftovers (owner: clean up in R2)', () => {
  const form = next(byId(FORM));
  type Entry = { _key: string; language: string; value: string };

  it('title, field label and placeholder are per language (v5 `language` field)', () => {
    expect(form.formTitle).toEqual([
      {
        _key: 'en',
        _type: 'internationalizedArrayStringValue',
        language: 'en',
        value: 'Contact us',
      },
    ]);
    const [field] = form.fields as Array<{ label: Entry[]; placeholder: Entry[] }>;
    expect(field.label).toEqual([
      { _key: 'en', _type: 'internationalizedArrayStringValue', language: 'en', value: 'Email' },
    ]);
    expect(field.placeholder).toEqual([
      {
        _key: 'en',
        _type: 'internationalizedArrayStringValue',
        language: 'en',
        value: 'you@example.com',
      },
    ]);
  });

  it('intent "lead" becomes "contact" (the schema offers "Contact / Lead Generation")', () => {
    expect(byId(FORM).intent).toBe('lead');
    expect(form.intent).toBe('contact');
  });

  it('consent "Test" becomes plain wording in en, nb and ar', () => {
    const acceptance = form.acceptance as { text: Entry[] };
    expect(acceptance.text.map((e) => [e.language, e.value])).toEqual([
      ['en', 'I agree to the privacy policy.'],
      ['nb', 'Jeg godtar personvernerklæringen.'],
      ['ar', 'أوافق على سياسة الخصوصية.'],
    ]);
  });

  it('the consent link goes to the English Privacy page, labelled "Privacy policy"', () => {
    const privacy = byId('e77cef43-7a03-4691-8375-662f01ecad58');
    expect(privacy).toMatchObject({ _type: 'page', language: 'en' });
    expect((privacy.metadata as { slug: { current: string } }).slug.current).toBe('privacy');
    const link = (form.acceptance as { link: Record<string, unknown> }).link;
    expect(link).toEqual({
      _type: 'menuItem',
      type: 'internal',
      label: 'Privacy policy',
      internal: { _ref: 'e77cef43-7a03-4691-8375-662f01ecad58', _type: 'reference' },
    });
  });

  it('keeps a consent link an editor pointed somewhere real', () => {
    const own = {
      ...byId(FORM),
      acceptance: {
        link: { _type: 'menuItem', type: 'internal', label: 'Terms', internal: { _ref: 't' } },
      },
    };
    const result = mapDocument(own);
    const out = result.action === 'patch' ? result.next : own;
    expect((out.acceptance as { link: { label: string } }).link.label).toBe('Terms');
  });

  it('leaves a field without a label without one', () => {
    const own = { ...byId(FORM), fields: [{ _key: 'f', name: { current: 'x' }, type: 'text' }] };
    const out = next(own);
    expect((out.fields as object[])[0]).not.toHaveProperty('label');
  });

  it('drops the orphan redirect (no schema field since form v3, read by nothing)', () => {
    expect(byId(FORM)).toHaveProperty('redirect');
    expect(form).not.toHaveProperty('redirect');
  });

  it('keeps an editor-written consent text', () => {
    const own = {
      ...byId(FORM),
      acceptance: { text: [{ _key: 'en', language: 'en', value: 'I accept.' }] },
    };
    const result = mapDocument(own);
    const out = result.action === 'patch' ? result.next : own;
    expect((out.acceptance as { text: Entry[] }).text[0].value).toBe('I accept.');
  });
});

describe('translation groups and links after the mapping', () => {
  const surviving = new Set(
    (ids as Array<{ _id: string }>).map((d) => d._id).filter((id) => !deleted.has(id))
  );
  const pages = AFTER.filter((d) => d._type === 'page' && !isDraft(d._id));
  const slugLang = (d: Doc) =>
    `${(d.metadata as { slug?: { current?: string } })?.slug?.current} ${d.language}`;
  const rendered = (id: string) => {
    const page = pages.find((p) => p._id === id);
    if (!page) return true; // not a page (article, event, …)
    const first = pages
      .filter((p) => slugLang(p) === slugLang(page))
      .sort((a, b) => (a._id < b._id ? -1 : 1))[0];
    return first._id === id;
  };

  it('no two published pages share a slug and language any more', () => {
    const keys = pages.map(slugLang);
    expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
  });

  /** Every internal link target in the published menus, buttons and texts. */
  function internalTargets(docsToScan: readonly Doc[]) {
    const out: Array<{ from: string; to: string }> = [];
    const walk = (value: unknown, from: string) => {
      if (Array.isArray(value)) for (const item of value) walk(item, from);
      else if (isObject(value)) {
        const ref = isObject(value.internal) ? value.internal._ref : undefined;
        if (typeof ref === 'string') out.push({ from, to: ref });
        for (const inner of Object.values(value)) walk(inner, from);
      }
    };
    for (const doc of docsToScan) walk(doc, doc._id);
    return out;
  }

  it('every published menu link, button and text link goes to a page that exists and renders', () => {
    const scanned = AFTER.filter(
      (d) =>
        !isDraft(d._id) && d._type !== 'translation.metadata' && d._type !== 'collection.events'
    );
    const targets = internalTargets(scanned);
    expect(targets.length).toBeGreaterThan(40);
    expect(targets.filter((t) => !surviving.has(publishedId(t.to)))).toEqual([]);
    expect(targets.filter((t) => !rendered(publishedId(t.to)))).toEqual([]);
  });

  it('drafts: the only dangling link is the test banner draft (owner gate list B)', () => {
    const targets = internalTargets(AFTER.filter((d) => isDraft(d._id)));
    expect(targets.filter((t) => !surviving.has(publishedId(t.to)))).toEqual([
      {
        from: 'drafts.751a3c7d-1982-4b18-94cb-e9df4628fccc',
        to: '34d5ce75-ee49-434c-ac67-9798f17fab7f',
      },
    ]);
  });

  it('every group holds existing, rendered pages in their own language (language switch works)', () => {
    type Entry = { language?: string; _key: string; value?: { _ref?: string } };
    const groups = AFTER.filter((d) => d._type === 'translation.metadata');
    expect(groups).toHaveLength(11);
    for (const group of groups) {
      for (const e of group.translations as Entry[]) {
        const id = e.value?._ref as string;
        const page = pages.find((p) => p._id === id);
        expect(page, `${group._id} ${e._key}`).toBeTruthy();
        expect(page?.language).toBe(e.language ?? e._key);
        expect(rendered(id), `${group._id} ${id}`).toBe(true);
      }
    }
  });

  it('refuses a translation group that still holds a removed duplicate (nm-fixes must run first)', () => {
    const oldGroups = (beforeNmFixes as Doc[]).filter(
      (d) =>
        d._type === 'translation.metadata' &&
        DUPLICATE_PAGES.some((dup) => JSON.stringify(d).includes(`"_ref":"${dup.remove}"`))
    );
    expect(oldGroups.length).toBeGreaterThan(0);
    for (const group of oldGroups) expect(() => mapDocument(group)).toThrow(/nm-fixes/);
  });

  it('the events group keeps the page /events renders; menus and events link that page too', () => {
    const keep = DUPLICATE_PAGES.find((d) => d.slug === 'events')?.keep as string;
    const group = AFTER.find((d) => d._id === EVENTS_GROUP) as Doc;
    expect(JSON.stringify(group)).toContain(`"_ref":"${keep}"`);
    const linking = AFTER.filter((d) => JSON.stringify(d).includes(`"_ref":"${keep}"`)).map(
      (d) => d._id
    );
    expect(linking.sort()).toEqual(
      [
        EVENTS_GROUP,
        'site',
        '6ef5d186-0a4a-4285-9d24-a4277d6c6233',
        '8518d91c-4d43-4356-b043-45fddc85218c',
        '910e52c9-92ea-4414-b34a-115cf9c8d746',
        'fc24e99f-3499-4a7f-a21c-88fa069f31fb',
      ].sort()
    );
  });
});

describe('drafts and re-runs', () => {
  it('no blocking drafts: every draft is mapped in the same run as its published version', () => {
    expect(blockingDrafts(ALL)).toEqual([]);
  });

  it('flags a draft of another type than its published version (the run visits by type)', () => {
    const removed = DUPLICATE_PAGES[0].remove;
    const all = [...ALL, { _id: `drafts.${removed}`, _type: 'site' } as Doc];
    expect(blockingDrafts(all)).toEqual([`drafts.${removed}`]);
  });

  it('is idempotent: every mapped document maps to skip', () => {
    for (const doc of AFTER) expect(mapDocument(doc), doc._id).toEqual({ action: 'skip' });
  });

  it('touches only the migrated and deleted types', () => {
    const changed = ALL.filter((d) => mapDocument(d).action !== 'skip').map((d) => d._type);
    expect([...new Set(changed)].sort()).toEqual(
      [
        'announcement',
        'banner',
        'collection.events',
        'component.library',
        'form',
        'gallery',
        'global-layout',
        'global-module',
        'intranet.department',
        'navigation',
        'page',
        'placement',
        'pricing',
        'redirect',
        'site',
        'testimonial',
      ].sort()
    );
  });
});
