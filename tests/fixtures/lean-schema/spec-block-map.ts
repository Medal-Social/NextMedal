/**
 * Spec §1 block map: every stored page-module type → the block it becomes.
 * Pinned to the 2026-10-18 export so a new type in content fails loudly.
 */
export const SPEC_BLOCK_MAP: Readonly<Record<string, string>> = {
  hero: 'hero',
  videoHero: 'hero',
  richtext: 'richtext',
  callout: 'callout',
  'accordion-list': 'accordion-list',
  features: 'features',
  'product-comparison': 'product-comparison',
  'logo-cloud': 'logo-cloud',
  'pricing-list': 'pricing-list',
  'articles-frontpage': 'articles-frontpage',
  'changelog-frontpage': 'changelog-frontpage',
  'docs-frontpage': 'docs-frontpage',
  'events-frontpage': 'events-frontpage',
  'newsletter-frontpage': 'newsletter-frontpage',
  'component-gallery': 'component-gallery',
};
