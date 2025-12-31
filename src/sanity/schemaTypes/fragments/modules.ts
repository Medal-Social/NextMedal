/**
 * Modules Fragment
 * @version 1.2.0
 * @lastUpdated 2025-12-30
 * @description A registry of all available content modules for the page builder.
 * @changelog
 * - 1.2.0: Renamed listing modules to frontpage (articles-frontpage, etc.)
 * - 1.1.0: Added Frontpages group with articles-frontpage module
 * - 1.0.1: Added header documentation
 * - 1.0.0: Initial version
 */

import { defineField } from 'sanity';

export default defineField({
  name: 'modules',
  description: 'Page content',
  type: 'array',
  of: [
    { type: 'hero' },
    { type: 'videoHero' },
    { type: 'features' },
    { type: 'accordion-list' },
    { type: 'lead-magnet' },
    { type: 'callout' },
    { type: 'contact' },
    { type: 'richtext' },
    { type: 'logo-cloud' },
    { type: 'team' },
    { type: 'pricing-list' },
    { type: 'product-comparison' },
    { type: 'latest-articles' },
    { type: 'breadcrumbs' },
    { type: 'component-gallery' },
    // Collection frontpage modules
    { type: 'articles-frontpage' },
    { type: 'changelog-frontpage' },
    { type: 'docs-frontpage' },
    { type: 'events-frontpage' },
    { type: 'newsletter-frontpage' },
  ],
  options: {
    insertMenu: {
      views: [
        {
          name: 'grid',
          previewImageUrl: (schemaType) => `/block-previews/${schemaType}.png`,
        },
        { name: 'list' },
      ],
      groups: [
        {
          name: 'Hero Sections',
          of: ['videoHero', 'hero'],
        },
        {
          name: 'Content Sections',
          of: [
            'richtext',
            'accordion-list',
            'features',
            'logo-cloud',
            'team',
            'pricing-list',
            'product-comparison',
          ],
        },
        {
          name: 'Marketing & Leads',
          of: ['callout', 'contact', 'lead-magnet'],
        },
        {
          name: 'Frontpages',
          of: [
            'articles-frontpage',
            'changelog-frontpage',
            'docs-frontpage',
            'events-frontpage',
            'newsletter-frontpage',
          ],
        },
        {
          name: 'Utility',
          of: ['breadcrumbs', 'component-gallery', 'latest-articles'],
        },
      ],
    },
  },
});
