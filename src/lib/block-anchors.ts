/**
 * Fixed in-page anchors (Vault spec 2026-10-18 D3). A block's id comes from
 * its type — never from a stored key or an editor field — so hash links
 * (#features, #prices, …) resolve. Pure and import-free: used by Modules.tsx
 * and blockDesign on the site, by the Studio link picker (usePageAnchors) and
 * by the content migrations, so all of them agree.
 */
export const FIXED_ANCHORS: Readonly<Record<string, string>> = {
  features: 'features',
  richtext: 'text',
  callout: 'message',
  'accordion-list': 'questions',
  'product-comparison': 'comparison',
  'logo-cloud': 'logos',
  'pricing-list': 'prices',
  flipbook: 'flipbook',
};

/** Section names editors see in the link picker (same keys as FIXED_ANCHORS). */
export const SECTION_TITLES: Readonly<Record<string, string>> = {
  features: 'Feature grid',
  richtext: 'Text',
  callout: 'Message with buttons',
  'accordion-list': 'Questions and answers',
  'product-comparison': 'Comparison table',
  'logo-cloud': 'Logo row',
  'pricing-list': 'Prices',
  flipbook: 'Flipbook',
};

export type AnchorModule = { _type?: unknown; _key?: unknown } | null | undefined;

const baseAnchor = (type: unknown): string | undefined =>
  typeof type === 'string' && Object.hasOwn(FIXED_ANCHORS, type) ? FIXED_ANCHORS[type] : undefined;

/**
 * The anchor of every anchored block on a page, by `_key`: the first block of
 * a type gets the plain anchor (#features), later ones a number (#features-2).
 */
export function pageAnchors(
  modules: readonly AnchorModule[] | null | undefined
): Map<string, string> {
  const anchors = new Map<string, string>();
  const seen = new Map<string, number>();
  for (const module of modules ?? []) {
    const base = baseAnchor(module?._type);
    const key = typeof module?._key === 'string' ? module._key : undefined;
    if (!base || !key) continue;
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    anchors.set(key, count === 1 ? base : `${base}-${count}`);
  }
  return anchors;
}

export type AnchorChoice = {
  anchor: string;
  label: string;
  type: string;
  _key: string;
  isExplicit: true;
};

/** The link picker's choices for a page (shape kept from usePageAnchors' PageAnchor). */
export function anchorChoices(modules: readonly AnchorModule[] | null | undefined): AnchorChoice[] {
  const anchors = pageAnchors(modules);
  return (modules ?? []).flatMap((module) => {
    const key = typeof module?._key === 'string' ? module._key : '';
    const anchor = anchors.get(key);
    if (!anchor) return [];
    const type = String(module?._type);
    return [
      {
        anchor,
        label: `${SECTION_TITLES[type]} (#${anchor})`,
        type,
        _key: key,
        isExplicit: true as const,
      },
    ];
  });
}
