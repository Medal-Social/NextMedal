/**
 * Pure old → new page-module mapping for the lean-schema migration (Vault plan
 * 2026-10-18, Task 23). Self-contained: the Sanity CLI runs it without the
 * app's path aliases. Unit tests pin KEEP to the Studio schema and PRESETS /
 * FIELD_PRESETS to the rich-text presets.
 *
 * No-loss guard: a filled field that is neither kept nor explicitly dropped
 * throws, and so does rich text the field no longer offers (a style, list,
 * link or inline object). DROP holds design knobs only — blockDesign recreates
 * their values (equivalence-tested). Copy is never dropped.
 */
import { getYouTubeId } from '../../src/lib/youtube';
import { isFilled, isObject, UnmappedContentError } from '../nm-fixes/shared';

export { UnmappedContentError };
export type AnyModule = Record<string, unknown> & { _type: string; _key: string };
type Obj = Record<string, unknown>;

/** Editor fields of each block after Task 20 (= the schema; pinned by a test). */
export const KEEP: Readonly<Record<string, readonly string[]>> = {
  hero: ['content', 'ctas', 'image', 'videoUrl'],
  richtext: ['content'],
  callout: ['content', 'ctas'],
  'accordion-list': ['content', 'items'],
  flipbook: ['file', 'title'],
  features: ['intro', 'items'],
  'product-comparison': ['title', 'text', 'products', 'features'],
  'logo-cloud': ['content', 'logos'],
  'pricing-list': ['intro', 'tiers'],
  'articles-frontpage': [],
  'changelog-frontpage': ['intro'],
  'docs-frontpage': ['intro'],
  'events-frontpage': ['intro'],
  'newsletter-frontpage': ['intro'],
};

/** Design knobs each block loses (Task 20 / module-options); blockDesign recreates them. */
export const DROP: Readonly<Record<string, readonly string[]>> = {
  hero: ['options', 'videoType', 'anchorId'],
  richtext: ['options', 'tableOfContents', 'anchorId'],
  callout: ['anchorId', 'options'],
  'accordion-list': ['options', 'generateSchema', 'layout', 'anchorId'],
  flipbook: [],
  features: ['options', 'anchorId'],
  'product-comparison': ['options', 'anchorId'],
  'logo-cloud': ['options', 'anchorId'],
  'pricing-list': ['options', 'anchorId'],
  'articles-frontpage': ['showFeaturedFirst', 'displayFilters', 'limit', 'showRssLink', 'options'],
  'changelog-frontpage': [
    'layout',
    'groupByYear',
    'showFeaturedFirst',
    'limit',
    'showRssLink',
    'options',
  ],
  'docs-frontpage': [
    'categoryOrder',
    'showUncategorized',
    'uncategorizedLabel',
    'uncategorizedPosition',
    'layout',
    'sidebarStyle',
    'showCategoryDescriptions',
    'showCategoryIcons',
    'showSearch',
    'showTableOfContents',
    'showRelatedDocs',
    'defaultArticle',
    'options',
  ],
  'events-frontpage': [
    'layout',
    'filterByType',
    'showUpcomingFirst',
    'showFeaturedFirst',
    'hidePastEvents',
    'limit',
    'showRssLink',
    'options',
  ],
  'newsletter-frontpage': [
    'layout',
    'columns',
    'showFeaturedFirst',
    'limit',
    'showRssLink',
    'options',
  ],
};

export type Preset = {
  styles: readonly string[];
  lists: readonly string[];
  decorators: readonly string[];
  links: boolean;
};

/** Copy of src/sanity/schemaTypes/fragments/rich-text.ts (test-pinned; that file imports Sanity). */
export const PRESETS: Readonly<Record<string, Preset>> = {
  pageTop: { styles: ['normal', 'h1'], lists: [], decorators: ['strong', 'em'], links: false },
  listIntro: {
    styles: ['normal', 'h1', 'h2'],
    lists: [],
    decorators: ['strong', 'em'],
    links: false,
  },
  section: {
    styles: ['normal', 'h2', 'h3'],
    lists: [],
    decorators: ['strong', 'em'],
    links: false,
  },
  plain: { styles: ['normal'], lists: [], decorators: ['strong', 'em'], links: false },
  prose: {
    styles: ['normal', 'h2', 'h3', 'h4', 'blockquote'],
    lists: ['bullet', 'number'],
    decorators: ['strong', 'em'],
    links: true,
  },
};

/** The preset of every rich-text field in a kept block (`type.field`, `type.items.field`). */
export const FIELD_PRESETS: Readonly<Record<string, string>> = {
  'hero.content': 'pageTop',
  'richtext.content': 'prose',
  'callout.content': 'section',
  'accordion-list.content': 'section',
  'accordion-list.items.content': 'plain',
  'features.intro': 'section',
  'features.items.content': 'plain',
  'product-comparison.text': 'plain',
  'logo-cloud.content': 'section',
  'pricing-list.intro': 'section',
  'changelog-frontpage.intro': 'listIntro',
  'docs-frontpage.intro': 'listIntro',
  'events-frontpage.intro': 'listIntro',
  'newsletter-frontpage.intro': 'listIntro',
};

/** Non-block members a rich-text field accepts (the Text block keeps its pictures). */
const EXTRA_MEMBERS: Readonly<Record<string, readonly string[]>> = {
  'richtext.content': ['image'],
};

/** Array items whose schema member type is fixed; old content stores none or `object`. */
const ITEM_TYPES: Readonly<Record<string, Record<string, string>>> = {
  'accordion-list': { items: 'accordion-item' },
  features: { items: 'feature-item' },
  'product-comparison': { products: 'comparison-product', features: 'comparison-feature-row' },
};

function guard(value: Obj, keep: readonly string[], drop: readonly string[], label: string) {
  const known = new Set(['_type', '_key', ...keep, ...drop]);
  const lost = Object.keys(value).filter((key) => !known.has(key) && isFilled(value[key]));
  if (lost.length) {
    throw new UnmappedContentError(`${label}: filled field(s) with no mapping: ${lost.join(', ')}`);
  }
}

function pick(module: Obj, keep: readonly string[]): AnyModule {
  const out: AnyModule = { _type: String(module._type), _key: String(module._key) };
  for (const key of keep) {
    if (module[key] !== undefined && module[key] !== null) out[key] = module[key];
  }
  return out;
}

/** Removes `style` from every button at any depth (looks come from blockDesign). */
export function stripCtaStyles<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => stripCtaStyles(item)) as T;
  if (isObject(value)) {
    const isCta = value._type === 'cta';
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !(isCta && key === 'style'))
        .map(([key, inner]) => [key, stripCtaStyles(inner)])
    ) as T;
  }
  return value;
}

type Span = { _type?: string; marks?: string[] };

/** Throws when one block uses something the preset does not offer. */
function guardBlock(block: Obj, preset: Preset, where: string) {
  if (!preset.styles.includes(String(block.style ?? 'normal'))) {
    throw new UnmappedContentError(`${where}: style ${String(block.style)} is not offered`);
  }
  if (block.listItem !== undefined && !preset.lists.includes(String(block.listItem))) {
    throw new UnmappedContentError(`${where}: list ${String(block.listItem)} is not offered`);
  }
  const markDefs = (block.markDefs as Obj[] | undefined) ?? [];
  if (markDefs.some((def) => !preset.links || def._type !== 'link')) {
    throw new UnmappedContentError(`${where}: link or annotation is not offered`);
  }
  const defKeys = new Set(markDefs.map((def) => def._key));
  for (const span of (block.children as Span[] | undefined) ?? []) {
    if (span._type !== undefined && span._type !== 'span') {
      throw new UnmappedContentError(`${where}: inline ${String(span._type)} is not offered`);
    }
    const bad = (span.marks ?? []).filter((m) => !preset.decorators.includes(m) && !defKeys.has(m));
    if (bad.length) throw new UnmappedContentError(`${where}: mark(s) ${bad.join(', ')}`);
  }
}

/** Throws on anything in `blocks` the field's preset does not offer. */
export function guardRichText(blocks: unknown, fieldKey: string, label: string) {
  const preset = PRESETS[FIELD_PRESETS[fieldKey] ?? ''];
  if (!preset) throw new UnmappedContentError(`${label}: no preset for ${fieldKey}`);
  if (blocks === undefined || blocks === null) return;
  if (!Array.isArray(blocks)) {
    throw new UnmappedContentError(`${label}: ${fieldKey} is not rich text`);
  }
  const extra = EXTRA_MEMBERS[fieldKey] ?? [];
  for (const block of blocks as Obj[]) {
    const where = `${label} ${fieldKey} ${String(block?._key)}`;
    if (block?._type === 'block') guardBlock(block, preset, where);
    else if (!extra.includes(String(block?._type))) {
      throw new UnmappedContentError(`${where}: holds a ${String(block?._type)}`);
    }
  }
}

/** An empty menuItem (no label, no target) is not content. */
const isEmptyLink = (link: unknown) =>
  isObject(link) && !isFilled(link.label) && !isFilled(link.internal) && !isFilled(link.external);

type ItemRule = { keep: readonly string[]; drop: readonly string[]; clean?: (item: Obj) => void };

const ITEM_RULES: Readonly<Record<string, ItemRule>> = {
  'accordion-list.items': {
    keep: ['summary', 'content'],
    drop: ['open'],
    clean: (item) => {
      if (item.open === true) throw new UnmappedContentError('open by default');
    },
  },
  'features.items': {
    keep: ['icon', 'summary', 'content'],
    drop: ['link'],
    clean: (item) => {
      if (item.link !== undefined && !isEmptyLink(item.link)) {
        throw new UnmappedContentError('feature link is filled');
      }
    },
  },
  'product-comparison.products': { keep: ['name', 'highlight'], drop: [] },
  'product-comparison.features': { keep: ['name', 'featureDetails'], drop: [] },
};

function mapItems(module: AnyModule, label: string): AnyModule {
  const out: AnyModule = { ...module };
  for (const [field, itemType] of Object.entries(ITEM_TYPES[module._type] ?? {})) {
    if (!Array.isArray(module[field])) continue;
    const rule = ITEM_RULES[`${module._type}.${field}`];
    out[field] = (module[field] as Obj[]).map((raw) => {
      const where = `${label} ${field} ${String(raw?._key)}`;
      if (!isObject(raw)) throw new UnmappedContentError(`${where}: not an object`);
      if (raw._type !== undefined && raw._type !== 'object' && raw._type !== itemType) {
        throw new UnmappedContentError(`${where}: item type ${String(raw._type)}`);
      }
      try {
        rule.clean?.(raw);
      } catch (error) {
        throw new UnmappedContentError(`${where}: ${(error as Error).message}`);
      }
      guard(raw, rule.keep, rule.drop, where);
      const kept = Object.fromEntries(
        Object.entries(raw).filter(([key]) => !rule.drop.includes(key) && key !== '_type')
      );
      const contentKey = `${module._type}.${field}.content`;
      if (FIELD_PRESETS[contentKey]) guardRichText(kept.content, contentKey, where);
      return { ...kept, _type: itemType };
    });
  }
  return out;
}

/** A picture: the `img` wrapper with the image and its description. */
function guardPicture(image: unknown, label: string) {
  if (image === undefined || image === null) return;
  if (!isObject(image) || image._type !== 'img') {
    throw new UnmappedContentError(`${label}: picture is not an img`);
  }
  guard(image, ['image', 'alt'], [], `${label} image`);
}

/** Comparison table: intro (one plain h2 + plain paragraphs) → title + text. */
function comparisonTitle(module: AnyModule, label: string): AnyModule {
  if (!isFilled(module.intro)) {
    const { intro: _intro, ...rest } = module;
    return rest as AnyModule;
  }
  if (isFilled(module.title) || isFilled(module.text)) {
    throw new UnmappedContentError(`${label}: both an intro and a title/text`);
  }
  const [first, ...rest] = module.intro as Obj[];
  const spans =
    (first?.children as Array<{ _type?: string; text?: string; marks?: string[] }>) ?? [];
  const plainHeading =
    first?._type === 'block' &&
    first.style === 'h2' &&
    first.listItem === undefined &&
    !isFilled(first.markDefs) &&
    spans.every((s) => (s._type ?? 'span') === 'span' && !s.marks?.length);
  if (!plainHeading) {
    throw new UnmappedContentError(`${label}: intro must start with one plain heading`);
  }
  guardRichText(rest, 'product-comparison.text', `${label} intro`);
  const { intro: _intro, ...other } = module;
  const title = spans.map((s) => s.text ?? '').join('');
  return { ...other, title, ...(rest.length ? { text: rest } : {}) } as AnyModule;
}

function mapVideoHero(module: AnyModule, label: string): AnyModule {
  if (isFilled(module.muxVideo)) {
    throw new UnmappedContentError(`${label}: Mux video (Mux is opt-in now)`);
  }
  guard(module, ['type', 'videoId', 'thumbnail'], ['title', 'anchorId', 'muxVideo'], label);
  const out: AnyModule = { _type: 'hero', _key: module._key };
  if (module.type === 'youtube' && isFilled(module.videoId)) {
    // The old field took "YouTube URL or ID".
    const value = String(module.videoId).trim();
    const id = getYouTubeId(value) ?? (/^[\w-]{11}$/.test(value) ? value : undefined);
    if (!id) throw new UnmappedContentError(`${label}: YouTube value ${value}`);
    out.videoUrl = `https://www.youtube.com/watch?v=${id}`;
  } else if (isFilled(module.videoId)) {
    throw new UnmappedContentError(`${label}: ${String(module.type)} video id`);
  }
  if (isFilled(module.thumbnail)) out.image = { _type: 'img', image: module.thumbnail };
  return out;
}

/** Gallery items whose block type is deleted (owner decision B, 2026-10-19: team). */
export const REMOVED_GALLERY_ITEMS = ['team'];

/** The /components developer showcase (D8): kept as stored, minus deleted block types. */
function mapGallery(module: AnyModule): AnyModule {
  if (!Array.isArray(module.groups)) return module;
  const groups = (module.groups as AnyModule[]).map((group) =>
    Array.isArray(group?.items)
      ? {
          ...group,
          items: (group.items as AnyModule[]).filter(
            (item) => !REMOVED_GALLERY_ITEMS.includes(item?._type)
          ),
        }
      : group
  );
  return { ...module, groups };
}

export function mapModule(input: AnyModule): AnyModule {
  let module = stripCtaStyles(input);
  const label = `${module._type} ${module._key}`;

  if (module._type === 'videoHero') return mapVideoHero(module, label);
  // The /components developer showcase (D8): untouched apart from button styles
  // and the items of deleted block types.
  if (module._type === 'component-gallery') return mapGallery(module);

  const keep = KEEP[module._type];
  if (!keep) throw new UnmappedContentError(`${label}: no lean block for this type`);

  if (isFilled(module.muxVideo)) {
    throw new UnmappedContentError(`${label}: Mux video (Mux is opt-in now)`);
  }
  if (module._type === 'product-comparison') module = comparisonTitle(module, label);
  if (module._type === 'hero') guardPicture(module.image, label);
  module = mapItems(module, label);
  for (const field of keep) {
    const key = `${module._type}.${field}`;
    if (FIELD_PRESETS[key]) guardRichText(module[field], key, label);
  }

  guard(module, keep, [...(DROP[module._type] ?? []), 'muxVideo'], label);
  return pick(module, keep);
}
