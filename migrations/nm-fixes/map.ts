/**
 * Phase-1 content fixes (Vault plan 2026-10-18, Task 11): stored hash links
 * point at fixed anchors, prices move to the fields the site reads, form
 * texts become per-language, translation groups are repaired. Pure and
 * deterministic: a second run on migrated content changes nothing.
 */
import { type AnchorModule, pageAnchors } from '../../src/lib/block-anchors';
import {
  canonicalJson,
  type Doc,
  documentLookup,
  isFilled,
  isObject,
  mapObjects,
  publishedId,
  UnmappedContentError,
} from './shared';
import { DEAD_GROUP_IDS, groupDocument, TRANSLATION_GROUPS } from './translation-groups';

export const MIGRATED_TYPES = ['page', 'site', 'pricing', 'form', 'translation.metadata'] as const;
export type FixContext = { getDocument?: (id: string) => Doc | undefined };
export type FixResult = { action: 'skip' } | { action: 'delete' } | { action: 'patch'; next: Doc };

/** '#<moduleKey>' / '#module-<moduleKey>' → the block's fixed anchor on the linked page. */
export function fixAnchorParam(params: unknown, target: Doc | undefined): unknown {
  if (typeof params !== 'string' || !params.startsWith('#') || !target) return params;
  const modules = Array.isArray(target.modules) ? (target.modules as AnchorModule[]) : [];
  const anchors = pageAnchors(modules);
  const wanted = params.slice(1);
  if ([...anchors.values()].includes(wanted)) return params;
  const fixed = anchors.get(wanted.replace(/^module-/, ''));
  return fixed ? `#${fixed}` : params;
}

/**
 * GATE A (Ali, 2026-10-19): the nb and ar Home "features" buttons point at
 * `#features`, which those Homes do not have. They link to the English
 * Features page instead, without an anchor.
 */
export const RETARGETED_BUTTONS: Readonly<Record<string, { params: string; to: string }>> = {
  '74cbf377-263d-497a-9f1d-fe93ce6d62e2': {
    params: '#features',
    to: 'b874d2a9-d0a2-46ea-b675-39e4506b00d4',
  },
  '23c8c132-1b7a-4cc8-a4e6-bea80625cd06': {
    params: '#features',
    to: 'b874d2a9-d0a2-46ea-b675-39e4506b00d4',
  },
};

function retargetButtons(doc: Doc): Doc {
  const rule = RETARGETED_BUTTONS[publishedId(doc._id)];
  if (!rule) return doc;
  return mapObjects(doc, (obj) => {
    const isLink = obj._type === 'menuItem' || obj._type === 'link';
    if (!isLink || obj.type !== 'internal' || obj.params !== rule.params) return obj;
    const { params: _params, ...rest } = obj;
    return { ...rest, internal: { _ref: rule.to, _type: 'reference' } };
  }) as Doc;
}

function fixLinks(doc: Doc, context: FixContext): Doc {
  return mapObjects(retargetButtons(doc), (obj) => {
    const isLink = obj._type === 'menuItem' || obj._type === 'link';
    const ref = isObject(obj.internal) ? obj.internal._ref : undefined;
    if (!isLink || typeof ref !== 'string' || typeof obj.params !== 'string') return obj;
    const params = fixAnchorParam(obj.params, context.getDocument?.(publishedId(ref)));
    return params === obj.params ? obj : { ...obj, params };
  }) as Doc;
}

/** price { base, currency, suffix } → monthlyPrice / currency / priceSuffix (what PricingList reads). */
export function mapPricing(doc: Doc): Doc {
  if (!isObject(doc.price)) return doc;
  const { base, currency, suffix, _type, ...rest } = doc.price;
  if (isFilled(rest)) {
    throw new UnmappedContentError(`${doc._id}: price has ${Object.keys(rest).join(', ')}`);
  }
  const moves: [string, unknown][] = [
    ['monthlyPrice', base],
    ['currency', currency],
    ['priceSuffix', suffix],
  ];
  for (const [field, value] of moves) {
    if (isFilled(value) && isFilled(doc[field]) && doc[field] !== value) {
      throw new UnmappedContentError(
        `${doc._id}: ${field} already "${String(doc[field])}", price says "${String(value)}"`
      );
    }
  }
  const { price: _price, ...next } = doc;
  for (const [field, value] of moves) if (isFilled(value)) next[field] = value;
  return next as Doc;
}

/** One English entry of an internationalized array (plugin v5 shape; `_key` fixed for re-runs). */
const localized = (value: string, type: 'String' | 'Text') => [
  { _key: 'en', _type: `internationalizedArray${type}Value`, language: 'en', value },
];

type Span = { _type?: string; text?: string; marks?: string[] };

/**
 * Plain paragraphs → their text, a line break between paragraphs (typed line
 * breaks inside a span stay). Anything a plain text field would lose — a list,
 * a heading, bold, a link, an inline object — is refused.
 */
function plainText(blocks: unknown, label: string): string {
  const list = Array.isArray(blocks) ? (blocks as Record<string, unknown>[]) : [];
  return list
    .map((block) => {
      const spans = (block.children as Span[] | undefined) ?? [];
      const formatted =
        block._type !== 'block' ||
        !!block.listItem ||
        (block.style !== undefined && block.style !== 'normal') ||
        !!(block.markDefs as unknown[] | undefined)?.length ||
        spans.some((s) => s._type !== 'span' || !!s.marks?.length);
      if (formatted) {
        throw new UnmappedContentError(
          `${label}: thank-you message has formatting that a plain text field would lose`
        );
      }
      return spans.map((s) => s.text ?? '').join('');
    })
    .join('\n');
}

/** Form texts become per-language (English = what is stored today). */
export function mapForm(doc: Doc): Doc {
  const next: Doc = { ...doc };
  if (typeof doc.submitButtonText === 'string') {
    next.submitButtonText = localized(doc.submitButtonText, 'String');
  }
  const message = doc.successMessage as { _type?: string }[] | string | undefined;
  if (typeof message === 'string') {
    next.successMessage = localized(message, 'Text');
  } else if (Array.isArray(message) && message[0]?._type === 'block') {
    next.successMessage = localized(plainText(message, doc._id), 'Text');
  }
  if (isObject(doc.acceptance)) {
    const { required, ...acceptance } = doc.acceptance;
    if (required === true && doc.requireConsent !== true) next.requireConsent = true;
    if (typeof acceptance.text === 'string') acceptance.text = localized(acceptance.text, 'String');
    next.acceptance = acceptance;
  }
  return next;
}

const GROUPS = new Map(TRANSLATION_GROUPS.map((g) => [g.id, g]));

export function mapTranslationGroup(doc: Doc): FixResult {
  if (DEAD_GROUP_IDS.includes(doc._id)) return { action: 'delete' };
  const group = GROUPS.get(doc._id);
  if (!group) return { action: 'skip' };
  const { _id, _type, ...wanted } = groupDocument(group);
  const next = { ...doc, ...wanted } as Doc;
  return canonicalJson(next) === canonicalJson(doc)
    ? { action: 'skip' }
    : { action: 'patch', next };
}

/** New groups, created (createIfNotExists) when the migration visits the group's English page. */
export function groupsToCreate(doc: Doc) {
  if (doc._type !== 'page' || doc._id.startsWith('drafts.')) return [];
  return TRANSLATION_GROUPS.filter((g) => g.create && g.pages.en === doc._id).map(groupDocument);
}

export function mapDocument(doc: Doc, context: FixContext = {}): FixResult {
  if (doc._type === 'translation.metadata') return mapTranslationGroup(doc);
  if (!(MIGRATED_TYPES as readonly string[]).includes(doc._type)) return { action: 'skip' };
  let next = fixLinks(doc, context);
  if (next._type === 'pricing') next = mapPricing(next);
  if (next._type === 'form') next = mapForm(next);
  return canonicalJson(next) === canonicalJson(doc)
    ? { action: 'skip' }
    : { action: 'patch', next };
}

/**
 * Drafts that would undo the fix when published: the published document is
 * patched, and its draft (after the same mapping) differs in a patched field.
 * index.ts refuses to run while this is not empty — discard or fix them first.
 */
export function blockingDrafts(docs: readonly Doc[]): string[] {
  const context = { getDocument: documentLookup(docs) };
  const drafts = new Map(docs.filter((d) => d._id.startsWith('drafts.')).map((d) => [d._id, d]));
  const blocking: string[] = [];
  for (const doc of docs) {
    const draft = drafts.get(`drafts.${doc._id}`);
    if (!draft) continue;
    const result = mapDocument(doc, context);
    if (result.action !== 'patch') continue;
    const draftResult = mapDocument(draft, context);
    const draftNext = draftResult.action === 'patch' ? draftResult.next : draft;
    const patched = [...new Set([...Object.keys(doc), ...Object.keys(result.next)])].filter(
      (key) => !key.startsWith('_') && canonicalJson(doc[key]) !== canonicalJson(result.next[key])
    );
    if (patched.some((key) => canonicalJson(draftNext[key]) !== canonicalJson(result.next[key]))) {
      blocking.push(draft._id);
    }
  }
  return blocking;
}
