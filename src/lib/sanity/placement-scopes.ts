/**
 * Where a placement rule applies. Import-free: the Studio schema, the route
 * queries and the lean-schema migration share it.
 */
export const PAGE_PLACEMENT_SCOPE = 'page';
export const ARTICLE_PLACEMENT_SCOPE = 'articles-frontpage';

export const PLACEMENT_SCOPE_TITLES = {
  [ARTICLE_PLACEMENT_SCOPE]: 'Articles',
  'changelog-frontpage': 'Changelog',
  'docs-frontpage': 'Documentation',
  'newsletter-frontpage': 'Newsletter',
  [PAGE_PLACEMENT_SCOPE]: 'All Pages',
} as const;

export const PLACEMENT_SCOPES = Object.keys(PLACEMENT_SCOPE_TITLES) as Array<
  keyof typeof PLACEMENT_SCOPE_TITLES
>;
