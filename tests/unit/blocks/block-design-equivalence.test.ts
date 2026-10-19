import docs from '@tests/fixtures/lean-schema/documents.json';
import { describe, expect, it } from 'vitest';
import { blockDesign, type DesignPage } from '@/components/blocks/modules/block-design';
import { buttonVariantFor } from '@/components/blocks/objects/cta/button-variant';
import { pageAnchors } from '@/lib/block-anchors';
import { PAGE_BLOCK_NAMES } from '@/sanity/schemaTypes/page-blocks';
import { mapAll } from '$/migrations/lean-schema/map-documents';

/**
 * blockDesign must reproduce what every rendered nextmedal.com page shows
 * today (Vault plan Task 15): component defaults applied, and for a duplicate
 * slug+language only the page GROQ `[0]` serves (lowest _id, plan C10).
 */
type Mod = Record<string, unknown> & { _type: string; _key: string };
type Doc = Omit<DesignPage, 'modules'> & { _id: string; _type: string; modules?: Mod[] };

const ALL = (docs as unknown as Doc[]).filter((d) => d._type === 'page');
const isDraft = (d: Doc) => d._id.startsWith('drafts.');
const slugLang = (d: Doc) => `${d.metadata?.slug?.current} ${d.language}`;

const SHADOWED = new Set(
  ALL.filter((d) => !isDraft(d))
    .filter((d) =>
      ALL.some((o) => !isDraft(o) && o !== d && slugLang(o) === slugLang(d) && o._id < d._id)
    )
    .map((d) => d._id)
);
const PAGES = ALL.filter((d) => !SHADOWED.has(d._id));

const look = (c: { style?: string }) => c.style ?? 'primary';
/**
 * Component defaults (src/components/blocks/modules/frontpage/…). An unset
 * `showRssLink` / `showSearch` is falsy, written here as `false`.
 * - articles  ArticlesFrontpage.tsx:165-168
 * - changelog ChangelogFrontpage.tsx:400-403
 * - newsletter NewsletterFrontpage.tsx:99-102
 * - events    EventsFrontpage.tsx:304-309
 * - docs      DocsFrontpage.tsx:206-214 (showSearch:214), DocDetail.tsx:92-93
 *             (showTableOfContents, showRelatedDocs)
 */
const LIST_DEFAULTS: Record<string, Record<string, unknown>> = {
  'articles-frontpage': {
    showFeaturedFirst: true,
    displayFilters: true,
    limit: 12,
    showRssLink: true,
  },
  'changelog-frontpage': { layout: 'timeline', groupByYear: true, limit: 0, showRssLink: false },
  'newsletter-frontpage': { layout: 'grid', columns: 3, limit: 12, showRssLink: false },
  'events-frontpage': {
    layout: 'cards',
    filterByType: 'all',
    showUpcomingFirst: true,
    hidePastEvents: false,
    limit: 50,
    showRssLink: false,
  },
  'docs-frontpage': {
    layout: 'sidebar',
    sidebarStyle: 'collapsible',
    showCategoryDescriptions: false,
    showCategoryIcons: true,
    showUncategorized: true,
    uncategorizedLabel: 'Other',
    uncategorizedPosition: 'end',
    showSearch: false,
    showTableOfContents: true,
    showRelatedDocs: true,
  },
};

type IntroBlock = { style?: string; children?: Array<{ text?: string }> };

/** The design values a module renders with (component defaults applied). */
function renderedDesign(m: Mod, anchor: string | undefined) {
  const opts = (m.options as Record<string, string> | undefined) ?? {};
  const defaults = LIST_DEFAULTS[m._type];
  return {
    anchor: anchor ?? null,
    background:
      m._type === 'hero' ? [opts.bgFrom || 'brand-vibrant', opts.bgTo || 'brand-purple'] : null,
    media: m._type === 'hero' ? ((m.videoType as string) ?? 'image') : null,
    buttons: ['hero', 'callout'].includes(m._type)
      ? ((m.ctas as Array<{ style?: string }>) ?? []).map(look)
      : null,
    list: defaults
      ? Object.fromEntries(Object.keys(defaults).map((k) => [k, m[k] ?? defaults[k]]))
      : null,
    intro:
      m._type === 'product-comparison'
        ? JSON.stringify(
            ((m.intro as IntroBlock[]) ?? []).map((b) => [
              b.style,
              b.children?.map((c) => c.text).join(''),
            ])
          )
        : null,
  };
}

const KEPT = new Set(PAGE_BLOCK_NAMES);

/**
 * Owner-approved differences (Task 32 list B), `<docId> <moduleKey> <property>`
 * → the value that property renders with after the change. Anything not listed
 * must render exactly as today.
 */
type Design = ReturnType<typeof renderedDesign>;
const NEWSLETTER_AS_LIST = (before: Design) => ({
  ...(before.list as Record<string, unknown>),
  layout: 'list',
});
const APPROVED_DIFFS = new Map<string, (before: Design) => unknown>([
  // Owner decision 2026-10-19 (Ali, GATE A): newsletter is a list in every
  // language; nb/ar rendered the component default `grid` until now.
  ['b543a3a3-6cea-4bec-b6b8-31e0f6cb42ce 61wMMR7R8VvWK2bB62zo4m list', NEWSLETTER_AS_LIST],
  ['729eaa88-335a-4fc4-88d5-ced936ae0a8b 4P2vumDw5K6pjBv4j2d5uc list', NEWSLETTER_AS_LIST],
]);
/** What a property must render after blockDesign: today's value or the approved change. */
const expected = (id: string, key: string, prop: keyof Design, before: Design) =>
  APPROVED_DIFFS.get(`${id} ${key} ${prop}`)?.(before) ?? before[prop];

describe('approved differences', () => {
  it('each approved difference is a real change on a rendered page', () => {
    const rendered = new Set(
      PAGES.flatMap((p) => (p.modules ?? []).map((m) => `${p._id} ${m._key}`))
    );
    for (const entry of APPROVED_DIFFS.keys()) {
      expect(rendered.has(entry.split(' ').slice(0, 2).join(' ')), entry).toBe(true);
    }
    for (const id of [
      'b543a3a3-6cea-4bec-b6b8-31e0f6cb42ce',
      '729eaa88-335a-4fc4-88d5-ced936ae0a8b',
    ]) {
      const page = PAGES.find((p) => p._id === id) as Doc;
      const m = page.modules?.find((x) => x._type === 'newsletter-frontpage') as Mod;
      expect(renderedDesign(m, undefined).list).toMatchObject({ layout: 'grid' });
    }
  });
});

describe('fixtures', () => {
  it('no page or placement block stores an anchor (anchors come from code only)', () => {
    const stored = (docs as unknown as Array<{ _id: string; _type: string; modules?: Mod[] }>)
      .filter((d) => d._type === 'page' || d._type === 'placement')
      .flatMap((d) =>
        (d.modules ?? [])
          .filter((m) => (m.options as { anchorId?: unknown } | undefined)?.anchorId !== undefined)
          .map((m) => `${d._id} ${m._key}`)
      );
    expect(stored).toEqual([]);
  });
});

describe('blockDesign reproduces what every rendered page shows today', () => {
  const cases = PAGES.flatMap((p) =>
    (p.modules ?? [])
      .filter((m) => KEPT.has(m._type))
      .map((m) => [`${p._id} ${m._type} ${m._key}`, p, m] as const)
  );

  it('covers every kept block on every rendered page (published and drafts)', () => {
    expect(SHADOWED).toEqual(
      new Set([
        '43a2eee5-8dfa-49ec-aabc-c9e543546e3e',
        'e43f4b4c-dff4-4d66-8956-b1916b6b25c4',
        '6ea8352f-92fe-46bd-b1f7-16af1d46e20b',
        'e54ebf4c-2b92-4ef5-832f-476bfe5e5fe8',
      ])
    );
    // 2026-10-19 export (after nm-fixes; same modules as 2026-10-18): 76 modules − 4 on shadowed pages − videoHero − component-gallery.
    expect(cases).toHaveLength(70);
  });

  it.each(cases)('%s', (_, p, m) => {
    // Today Modules.tsx (R1) gives each block its fixed anchor over the page's list.
    const before = renderedDesign(m, pageAnchors(p.modules).get(m._key));
    const designed = blockDesign(m as never, p) as unknown as Mod;
    const after = renderedDesign(
      designed,
      (designed.options as { anchorId?: string } | undefined)?.anchorId
    );
    for (const prop of Object.keys(before) as Array<keyof typeof before>) {
      expect(after[prop], prop).toEqual(expected(p._id, m._key, prop, before));
    }
  });
});

/**
 * After the lean-schema migration (Task 25 Step 4): the stored knobs are gone,
 * blockDesign must still give every block on every rendered page the design it
 * renders with today. The migration keeps the page each route renders today
 * (events included), so routes are compared page by page and block by block.
 */
describe('blockDesign after the lean-schema migration', () => {
  const MAPPED = (mapAll(docs as never) as unknown as Doc[]).filter((d) => d._type === 'page');
  const mappedById = new Map(MAPPED.map((d) => [d._id, d]));
  const renderedAfter = (d: Doc) =>
    MAPPED.filter((o) => isDraft(o) === isDraft(d) && slugLang(o) === slugLang(d)).sort((a, b) =>
      a._id < b._id ? -1 : 1
    )[0]?._id;

  it('every route renders the same page as today', () => {
    for (const page of PAGES) {
      if (isDraft(page)) continue;
      expect(renderedAfter(page), slugLang(page)).toBe(page._id);
    }
  });

  const cases = PAGES.flatMap((p) =>
    (p.modules ?? [])
      .filter((m) => KEPT.has(m._type))
      .map((m) => [`${p._id} ${m._type} ${m._key}`, p, m] as const)
  );

  it.each(cases)('%s', (_, p, m) => {
    const before = renderedDesign(m, pageAnchors(p.modules).get(m._key));
    const page = mappedById.get(p._id) as Doc;
    const mapped = page.modules?.find((x) => x._key === m._key) as Mod;
    expect(mapped._type).toBe(m._type);
    const designed = blockDesign(mapped as never, page) as unknown as Mod;
    const after = renderedDesign(
      designed,
      (designed.options as { anchorId?: string } | undefined)?.anchorId
    );
    for (const prop of Object.keys(before) as Array<keyof typeof before>) {
      expect(after[prop], prop).toEqual(expected(p._id, m._key, prop, before));
    }
  });
});

/**
 * Every button keeps its look after the migration, also the ones blockDesign
 * does not design (price plans, site header buttons, gallery items): the
 * migration removes `style`, CTA_QUERY projects it as `null`, and
 * buttonVariantFor must still give the look it renders with today.
 */
describe('every button keeps its look after the lean-schema migration', () => {
  type Cta = { _key?: string; style?: string | null };
  const MAPPED = mapAll(docs as never) as unknown as Doc[];
  const mappedById = new Map(MAPPED.map((d) => [d._id, d]));

  /**
   * `<path of _keys> → variant`, rendered the way the site renders: page modules
   * through blockDesign(module, page), gallery items through blockDesign(item,
   * { modules: [] }) (GalleryModuleRenderer).
   */
  function looks(doc: Doc): Map<string, string> {
    const out = new Map<string, string>();
    const walk = (node: unknown, path: string, galleryItem = false): void => {
      if (Array.isArray(node)) {
        for (const [i, x] of node.entries()) {
          walk(x, `${path}/${(x as Cta)?._key ?? i}`, galleryItem);
        }
        return;
      }
      if (!node || typeof node !== 'object') return;
      const rendered: object = galleryItem ? blockDesign(node as never, { modules: [] }) : node;
      for (const [k, v] of Object.entries(rendered)) {
        if (k === 'ctas' && Array.isArray(v)) {
          for (const [i, c] of (v as Cta[]).entries()) {
            out.set(`${path}/ctas/${c._key ?? i}`, buttonVariantFor(c.style ?? null));
          }
        } else walk(v, `${path}/${k}`, k === 'items' && path.includes('/groups/'));
      }
    };
    const modules = doc.modules?.map((m) => blockDesign(m as never, doc) as unknown as Mod);
    walk(modules ? { ...doc, modules } : doc, '');
    return out;
  }

  const SOURCES = (docs as unknown as Doc[]).filter(
    (d) => mappedById.has(d._id) && !SHADOWED.has(d._id)
  );
  const cases = SOURCES.flatMap((d) =>
    [...looks(d)].map(([path, look]) => [`${d._id} ${path}`, d._id, path, look] as const)
  );

  it('covers price plans, site buttons and gallery items, not only page tops and callouts', () => {
    const types = new Set(cases.map(([, id]) => mappedById.get(id)?._type));
    expect(types).toEqual(new Set(['page', 'pricing', 'site']));
    expect(cases.some(([, , path]) => path.includes('/groups/'))).toBe(true);
  });

  it.each(cases)('%s', (_, id, path, look) => {
    const after = looks(mappedById.get(id) as Doc).get(path);
    expect(after).toBe(look);
  });
});
