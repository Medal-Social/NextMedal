import docs from '@tests/fixtures/lean-schema/documents.json';
import { describe, expect, it } from 'vitest';
import { blockDesign, type DesignPage } from '@/components/blocks/modules/block-design';
import { pageAnchors } from '@/lib/block-anchors';
import { PAGE_BLOCK_NAMES } from '@/sanity/schemaTypes/page-blocks';

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
 * Owner-approved differences, `<docId> <moduleKey|*> <property>` (Task 32
 * list B). Empty: blockDesign reproduces today's output, including the
 * per-language newsletter layout and the /events cards (owner choices later).
 */
const APPROVED_DIFFS = new Set<string>();
const approved = (id: string, key: string, prop: string) =>
  APPROVED_DIFFS.has(`${id} ${key} ${prop}`) || APPROVED_DIFFS.has(`${id} * ${prop}`);

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
    // 2026-10-18: 76 modules − 4 on shadowed pages − videoHero − component-gallery.
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
      if (approved(p._id, m._key, prop)) continue;
      expect(after[prop], prop).toEqual(before[prop]);
    }
  });
});
