/**
 * Pure document-level mapping for the lean-schema migration (Vault plan
 * 2026-10-18, Task 24): every page module through mapModule, button styles and
 * design knobs out of every migrated document, orphan documents and the
 * duplicate list pages deleted (references repointed first), old-format links
 * and the form leftovers fixed. Self-contained like map-modules.ts.
 */
import {
  canonicalJson,
  type Doc,
  findReferences,
  isFilled,
  isObject,
  mapObjects,
  publishedId,
  UnmappedContentError,
} from '../nm-fixes/shared';
import { type AnyModule, mapModule, stripCtaStyles } from './map-modules';

export type { Doc };
export type DocumentResult =
  | { action: 'delete' }
  | { action: 'skip' }
  | { action: 'patch'; next: Doc };
type Obj = Record<string, unknown>;

/** Types with no schema (spec §3) or removed from the template (D6). Reference-checked before delete. */
export const DELETE_TYPES = [
  'navigation',
  'global-module',
  'testimonial',
  'intranet.department',
  'global-layout',
  'gallery',
  'announcement',
  'sanity.assist.task.status',
  'component.library',
] as const;

/**
 * Two published en list pages share a slug (2026-01-03 copies, plan C10).
 * One goes; every reference to it is repointed to the one that stays.
 * - changelog, docs, newsletter: the copies are shadowed (GROQ `[0]` serves the
 *   lowest _id = the original) and nothing links them.
 * - events: the copy 1ddbee30 is the one /events renders (lowest _id) and the
 *   one the translation group holds; the original 6ea8352f is linked by the
 *   header menus and the 4 en events, but its intro is the placeholder h1
 *   "Homepage" and its stored calendar layout is not what renders. Keeping the
 *   rendered copy keeps /events exactly as it is (Task 32 list B).
 */
export const DUPLICATE_PAGES: ReadonlyArray<{ remove: string; keep: string; slug: string }> = [
  {
    slug: 'changelog',
    remove: '43a2eee5-8dfa-49ec-aabc-c9e543546e3e',
    keep: '1882fec2-060e-4b50-a170-30fb0f37d1ba',
  },
  {
    slug: 'docs',
    remove: 'e43f4b4c-dff4-4d66-8956-b1916b6b25c4',
    keep: 'c1dc84f2-f810-46ec-8bf2-b88635b2e37e',
  },
  {
    slug: 'events',
    remove: '6ea8352f-92fe-46bd-b1f7-16af1d46e20b',
    keep: '1ddbee30-c430-4d8a-9840-99ade65f68fe',
  },
  {
    slug: 'newsletter',
    remove: 'e54ebf4c-2b92-4ef5-832f-476bfe5e5fe8',
    keep: '31deab03-f039-4d17-bfb3-a990b629a914',
  },
];
export const DUPLICATE_PAGE_IDS = DUPLICATE_PAGES.map((d) => d.remove);
const REPOINT = new Map(DUPLICATE_PAGES.map((d) => [d.remove, d.keep]));

/** The empty redirect draft (destination type only, no source, no target). */
export const EMPTY_DRAFT_IDS = ['drafts.cb69182b-7a35-4427-b24c-e58ef4fa47e3'];

/** Types the migration rewrites; any other type is skipped. */
export const MIGRATED_TYPES = [
  'page',
  'site',
  'pricing',
  'placement',
  'redirect',
  'form',
  'banner',
  'translation.metadata',
  // `collection` on an event has no field in the events schema, yet the event
  // list depends on it: EventsFrontpage fetches events by
  // `collection->metadata.slug.current == $collectionSlug`. The 4 en events
  // point at the removed events page and are repointed to the one that stays.
  'collection.events',
] as const;

export function isDeleted(doc: Doc): boolean {
  return (
    (DELETE_TYPES as readonly string[]).includes(doc._type) ||
    DUPLICATE_PAGE_IDS.includes(publishedId(doc._id)) ||
    EMPTY_DRAFT_IDS.includes(doc._id)
  );
}

function assertEmptyDraft(doc: Doc) {
  const { destination, permanent: _permanent, ...rest } = doc;
  const content = Object.fromEntries(Object.entries(rest).filter(([key]) => !key.startsWith('_')));
  const target = isObject(destination) ? { ...destination, type: undefined } : destination;
  if (isFilled(content) || isFilled(target)) {
    throw new UnmappedContentError(`${doc._id}: the "empty" draft has content now`);
  }
}

/**
 * A translation group must already hold the page that stays: nm-fixes (run
 * first, production 2026-10-19) rewrote the groups. A group still holding a
 * removed duplicate means nm-fixes did not run — refuse rather than repoint.
 */
function assertGroupRepaired(doc: Doc) {
  const stale = DUPLICATE_PAGE_IDS.filter((id) => JSON.stringify(doc).includes(`"_ref":"${id}"`));
  if (stale.length) {
    throw new UnmappedContentError(
      `${doc._id}: translation group holds removed page(s) ${stale.join(', ')} — run nm-fixes first`
    );
  }
}

/** References to a removed duplicate page → the page that stays (weak flags kept). */
export function repointReferences<T>(value: T): T {
  return mapObjects(value, (obj) => {
    const to = typeof obj._ref === 'string' ? REPOINT.get(publishedId(obj._ref)) : undefined;
    return to ? { ...obj, _ref: to } : obj;
  }) as T;
}

/**
 * Sanity's default link shape `{ _type: 'link', href }` (footer copyright,
 * banner text) → the link the Studio edits: `{ type: 'external', external }`.
 */
export function fixHrefLinks<T>(value: T, label: string): T {
  return mapObjects(value, (obj) => {
    if (obj._type !== 'link' || obj.href === undefined) return obj;
    const { href, ...rest } = obj;
    if (isFilled(rest.internal) || (isFilled(rest.external) && rest.external !== href)) {
      throw new UnmappedContentError(`${label}: link ${String(obj._key)} has href and a target`);
    }
    if (rest.type !== undefined && rest.type !== 'external') {
      throw new UnmappedContentError(`${label}: link ${String(obj._key)} is ${String(rest.type)}`);
    }
    return { ...rest, type: 'external', external: href };
  }) as T;
}

function mapPage(doc: Doc): Doc {
  const { title, ...rest } = doc;
  const metadata = (doc.metadata ?? {}) as { title?: unknown };
  if (isFilled(title) && !isFilled(metadata.title)) {
    throw new UnmappedContentError(`${doc._id}: page title is the only name`);
  }
  if (!Array.isArray(rest.modules)) return rest as Doc;
  return { ...rest, modules: (rest.modules as AnyModule[]).map(mapModule) } as Doc;
}

const LEAD_MAGNET_FIELDS = ['content', 'image', 'buttonText', 'form'];

/** Placements keep their own small list: lead-magnet (style/options out) and callout. */
function mapPlacement(doc: Doc): Doc {
  if (!Array.isArray(doc.modules)) return doc;
  const modules = (doc.modules as AnyModule[]).map((m) => {
    const label = `${doc._id} ${m._type} ${m._key}`;
    if (m._type === 'callout') return mapModule(m);
    if (m._type !== 'lead-magnet') throw new UnmappedContentError(`${label}: placement block`);
    // LeadMagnet renders "featured" when no style is stored.
    if (m.style !== undefined && m.style !== 'featured') {
      throw new UnmappedContentError(`${label}: style ${String(m.style)} would change the look`);
    }
    if (isFilled(m.options)) throw new UnmappedContentError(`${label}: block options`);
    const { style: _style, options: _options, ...rest } = m;
    const unknown = Object.keys(rest).filter(
      (key) => !key.startsWith('_') && !LEAD_MAGNET_FIELDS.includes(key) && isFilled(rest[key])
    );
    if (unknown.length) throw new UnmappedContentError(`${label}: ${unknown.join(', ')}`);
    return rest as AnyModule;
  });
  return { ...doc, modules };
}

/** The site's per-language arrays this migration rewrites; their entries get `language` (= `_key`). */
const SITE_LANGUAGE_FIELDS = ['headerNav', 'ctas', 'copyright'];

function mapSite(doc: Doc): Doc {
  const next: Doc = { ...doc };
  for (const field of SITE_LANGUAGE_FIELDS) {
    if (!Array.isArray(doc[field])) continue;
    next[field] = (doc[field] as Obj[]).map((e) =>
      isObject(e) && e.language === undefined && typeof e._key === 'string'
        ? { ...e, language: e._key }
        : e
    );
  }
  return next;
}

function mapPricing(doc: Doc): Doc {
  const { style: _style, ...rest } = doc;
  return rest as Doc;
}

type Lang = 'en' | 'nb' | 'ar';
type LocalizedEntry = { _key: string; _type: string; language: Lang; value: string };
const entry = (language: Lang, value: string, type = 'String'): LocalizedEntry => ({
  _key: language,
  _type: `internationalizedArray${type}Value`,
  language,
  value,
});

/** A plain string (old format) → one English entry; per-language arrays stay. */
const perLanguage = (value: unknown) => (typeof value === 'string' ? [entry('en', value)] : value);

/** Owner decisions for the form leftovers (Task 32 list B). */
export const FORM_FIXES = {
  /** "lead" is not a value the schema offers; "Contact / Lead Generation" is. */
  intent: { from: 'lead', to: 'contact' },
  placeholder: { from: 'Give us your shitty email', to: 'you@example.com' },
  /** The consent link pointed at the Components page with the label "Test". */
  consentLink: {
    from: { label: 'Test', ref: '01914fd8-6f5c-4b9d-8830-065fe8f413a5' },
    to: { label: 'Privacy policy', ref: 'e77cef43-7a03-4691-8375-662f01ecad58' },
  },
  consent: {
    from: 'Test',
    to: [
      entry('en', 'I agree to the privacy policy.'),
      entry('nb', 'Jeg godtar personvernerklæringen.'),
      entry('ar', 'أوافق على سياسة الخصوصية.'),
    ],
  },
} as const;

const values = (value: unknown) =>
  Array.isArray(value) ? (value as Array<{ value?: unknown }>).map((e) => e?.value) : [value];

function mapFormField(field: Obj): Obj {
  const placeholder = perLanguage(field.placeholder);
  const fixed = Array.isArray(placeholder)
    ? (placeholder as LocalizedEntry[]).map((e) =>
        e?.value === FORM_FIXES.placeholder.from ? { ...e, value: FORM_FIXES.placeholder.to } : e
      )
    : placeholder;
  return {
    ...field,
    ...(field.label === undefined ? {} : { label: perLanguage(field.label) }),
    ...(fixed === undefined ? {} : { placeholder: fixed }),
  };
}

/** The placeholder consent link (label "Test" → Components page) → the English Privacy page. */
function consentLink(link: unknown): unknown {
  const { from, to } = FORM_FIXES.consentLink;
  const ref = isObject(link) && isObject(link.internal) ? link.internal._ref : undefined;
  if (!isObject(link) || link.label !== from.label || ref !== from.ref) return link;
  return { ...link, label: to.label, internal: { ...(link.internal as Obj), _ref: to.ref } };
}

/**
 * Form texts in the per-language shape the code reads (getLocalizedValue,
 * plugin v5 `language` field), the placeholder copy, the intent the schema
 * offers, a real consent text. `redirect` has no schema field since form v3
 * and nothing reads it: unset.
 */
function mapForm(doc: Doc): Doc {
  const { redirect: _redirect, ...next } = doc as Obj;
  if (next.formTitle !== undefined) next.formTitle = perLanguage(next.formTitle);
  if (Array.isArray(next.fields)) next.fields = (next.fields as Obj[]).map(mapFormField);
  if (next.intent === FORM_FIXES.intent.from) next.intent = FORM_FIXES.intent.to;
  if (isObject(next.acceptance)) {
    const text = values(next.acceptance.text).filter((v) => v !== undefined);
    const placeholder = text.length > 0 && text.every((v) => v === FORM_FIXES.consent.from);
    next.acceptance = {
      ...next.acceptance,
      ...(placeholder ? { text: [...FORM_FIXES.consent.to] } : {}),
      ...(next.acceptance.link === undefined ? {} : { link: consentLink(next.acceptance.link) }),
    };
  }
  return next as Doc;
}

export function mapDocument(doc: Doc): DocumentResult {
  if (isDeleted(doc)) {
    if (EMPTY_DRAFT_IDS.includes(doc._id)) assertEmptyDraft(doc);
    return { action: 'delete' };
  }
  if (!(MIGRATED_TYPES as readonly string[]).includes(doc._type)) return { action: 'skip' };
  if (doc._type === 'translation.metadata') assertGroupRepaired(doc);
  let next = repointReferences(doc);
  if (next._type === 'site') next = mapSite(next);
  if (next._type === 'page') next = mapPage(next);
  if (next._type === 'placement') next = mapPlacement(next);
  if (next._type === 'pricing') next = mapPricing(next);
  if (next._type === 'form') next = mapForm(next);
  next = fixHrefLinks(stripCtaStyles(next), doc._id);
  return canonicalJson(next) === canonicalJson(doc)
    ? { action: 'skip' }
    : { action: 'patch', next };
}

export const planDeletions = (docs: readonly Doc[]) => docs.filter(isDeleted).map((d) => d._id);

/** Every document after the mapping (deleted ones removed). */
export function mapAll(docs: readonly Doc[]): Doc[] {
  return docs.flatMap((doc) => {
    const result = mapDocument(doc);
    if (result.action === 'delete') return [];
    return [result.action === 'patch' ? result.next : doc];
  });
}

/** Throws when a document that survives the mapping still references a deleted one. */
export function assertDeletable(docs: readonly Doc[]) {
  const deleted = planDeletions(docs);
  const refs = findReferences(mapAll(docs), deleted);
  if (refs.length) {
    throw new UnmappedContentError(
      `still referenced: ${refs.map((r) => `${r.from} → ${r.to}`).join('; ')}`
    );
  }
}

/**
 * Drafts the run cannot leave in the mapped state: a draft of another type
 * than its published version (the run visits by type, so publishing it would
 * undo the patch or the delete of the published version), or a draft the
 * mapping does not settle in one pass. Every other draft is mapped (or
 * deleted) in the same run as its published version.
 */
export function blockingDrafts(docs: readonly Doc[]): string[] {
  const byId = new Map(docs.map((d) => [d._id, d]));
  return docs
    .filter((d) => d._id.startsWith('drafts.'))
    .filter((draft) => {
      const published = byId.get(publishedId(draft._id));
      if (published && published._type !== draft._type) {
        return mapDocument(published).action !== 'skip';
      }
      const result = mapDocument(draft);
      return result.action === 'patch' && mapDocument(result.next).action !== 'skip';
    })
    .map((d) => d._id);
}
