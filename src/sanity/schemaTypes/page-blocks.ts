/**
 * The page blocks editors can add, in their insert-menu groups (Vault spec
 * 2026-10-18 §1). Pure data: imported by the Studio schema, blockDesign and
 * the guard tests. `_type` names are kept (D1); editors see titles.
 */
export const INSERT_GROUPS = [
  { name: 'Page top', of: ['hero'] },
  { name: 'Text', of: ['richtext', 'callout', 'accordion-list', 'flipbook'] },
  { name: 'Features', of: ['features', 'product-comparison', 'logo-cloud'] },
  { name: 'Prices', of: ['pricing-list'] },
  {
    name: 'Lists',
    of: [
      'articles-frontpage',
      'changelog-frontpage',
      'docs-frontpage',
      'events-frontpage',
      'newsletter-frontpage',
    ],
  },
] as const;

export type PageBlockName = (typeof INSERT_GROUPS)[number]['of'][number];
export const PAGE_BLOCK_NAMES: readonly string[] = INSERT_GROUPS.flatMap((group) => [...group.of]);

/** Accepted in the modules array, never offered: the /components developer showcase (D8). */
export const DEVELOPER_BLOCK_NAMES = ['component-gallery'] as const;

/** In stored content until prod is migrated; not insertable. Deleted in Task 35. */
export const DEPRECATED_BLOCK_NAMES = ['videoHero'] as const;

/** Placements keep their own small list (documented exception to rule 6). */
export const PLACEMENT_BLOCK_NAMES = ['lead-magnet', 'callout'] as const;

/** Blocks allowed more than 5 editor fields. None expected (spec §1). */
export const FIELD_BUDGET_ALLOWLIST: Readonly<Record<string, string>> = {};
