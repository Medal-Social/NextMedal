import { stegaClean } from 'next-sanity';
import { routing } from '@/i18n/routing';
import { pageAnchors } from '@/lib/block-anchors';
import { PAGE_BLOCK_NAMES } from '@/sanity/schemaTypes/page-blocks';

/**
 * Design rules for the page blocks (Vault spec 2026-10-18 D2/D3).
 *
 * Editors choose content only. The page-top background, button looks,
 * anchors, list layouts and limits are decided here from the block type and
 * the page. Stored values are overwritten, so the site renders the same
 * whether content still carries the old knobs or not.
 */
export interface DesignPage {
  _id?: string;
  _type?: string;
  language?: string;
  metadata?: { slug?: { current?: string } };
  modules?: Array<{ _type?: string; _key?: string } | null | undefined>;
}

type AnyModule = Sanity.Module & Record<string, unknown>;
type Look = 'primary' | 'ghost';

export const DESIGNED_BLOCKS: ReadonlySet<string> = new Set(PAGE_BLOCK_NAMES);

const HOME_SLUG = 'index';
/** All 10 stored page tops (2026-10-18): vibrant → navy on Home, → purple elsewhere. */
export const PAGE_TOP_BACKGROUND = {
  from: 'brand-vibrant',
  home: 'brand-navy',
  other: 'brand-purple',
} as const;

/** List settings = what each list page renders today (Vault plan C10). */
export const ARTICLE_LIST = {
  showFeaturedFirst: true,
  displayFilters: true,
  limit: 12,
  showRssLink: true,
} as const;
export const CHANGELOG_LIST = { layout: 'timeline', groupByYear: true, limit: 0 } as const;
export const DOCS_LIST = {
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
} as const;
/**
 * /events renders the duplicate page 1ddbee30 (no stored settings → cards),
 * not 6ea8352f (calendar). Calendar is an owner choice (Task 32 list B).
 */
export const EVENTS_LIST = {
  layout: 'cards',
  filterByType: 'all',
  showUpcomingFirst: true,
  hidePastEvents: false,
  limit: 50,
  showRssLink: false,
} as const;
/**
 * en renders `list`; nb/ar render `grid` today (no stored settings → component
 * default). Reproduced as is; owner picks one layout at the gate (Task 32 list B).
 */
export const NEWSLETTER_LIST = { columns: 3, limit: 12 } as const;
export const NEWSLETTER_LAYOUT = { defaultLanguage: 'list', other: 'grid' } as const;

const clean = (value: unknown): string => (typeof value === 'string' ? stegaClean(value) : '');
const firstSolid = (index: number): Look => (index === 0 ? 'primary' : 'ghost');

function withLooks(ctas: unknown, look: (index: number) => Look): Sanity.CTA[] | undefined {
  if (!Array.isArray(ctas)) return undefined;
  return (ctas as Sanity.CTA[]).map((cta, index) => ({ ...cta, style: look(index) }));
}

/** Comparison table: Title + Text → the intro blocks the component renders (h2 + paragraphs). */
function comparisonIntro(m: AnyModule): unknown {
  const title = clean(m.title) ? (m.title as string) : '';
  const text = Array.isArray(m.text) ? m.text : [];
  if (!title && !text.length) return m.intro;
  const heading = title
    ? [
        {
          _type: 'block',
          _key: `${m._key}-title`,
          style: 'h2',
          markDefs: [],
          children: [{ _type: 'span', _key: `${m._key}-title-span`, text: title, marks: [] }],
        },
      ]
    : [];
  return [...heading, ...text];
}

export function blockDesign<M extends Sanity.Module>(module: M, page?: DesignPage): M {
  const type = clean(module?._type);
  if (!DESIGNED_BLOCKS.has(type)) return module;

  const m = module as AnyModule;
  const slug = clean(page?.metadata?.slug?.current);
  const isDefaultLanguage =
    (clean(page?.language) || routing.defaultLocale) === routing.defaultLocale;
  const anchorId = pageAnchors(page?.modules ?? [m]).get(m._key);
  const out: AnyModule = { ...m, options: anchorId ? { anchorId } : undefined };

  switch (type) {
    case 'hero':
      out.options = {
        ...(anchorId ? { anchorId } : {}),
        bgFrom: PAGE_TOP_BACKGROUND.from,
        bgTo: slug === HOME_SLUG ? PAGE_TOP_BACKGROUND.home : PAGE_TOP_BACKGROUND.other,
      };
      out.ctas = withLooks(m.ctas, firstSolid);
      out.videoType = clean(m.videoUrl) ? 'youtube' : 'image';
      break;
    case 'callout':
      out.ctas = withLooks(m.ctas, firstSolid);
      break;
    case 'product-comparison':
      out.intro = comparisonIntro(m);
      break;
    case 'articles-frontpage':
      Object.assign(out, ARTICLE_LIST);
      break;
    case 'changelog-frontpage':
      Object.assign(out, CHANGELOG_LIST, { showRssLink: isDefaultLanguage });
      break;
    case 'docs-frontpage':
      Object.assign(out, DOCS_LIST);
      break;
    case 'events-frontpage':
      Object.assign(out, EVENTS_LIST);
      break;
    case 'newsletter-frontpage':
      Object.assign(out, NEWSLETTER_LIST, {
        layout: isDefaultLanguage ? NEWSLETTER_LAYOUT.defaultLanguage : NEWSLETTER_LAYOUT.other,
        showRssLink: isDefaultLanguage,
      });
      break;
  }
  return out as M;
}
