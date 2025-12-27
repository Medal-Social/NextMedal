/**
 * Modules Fragment
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description A registry of all available content modules for the page builder.
 * @changelog
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
    { type: 'blog-frontpage' },
    { type: 'latest-articles' },
    { type: 'breadcrumbs' },
    { type: 'component-gallery' },
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
          name: 'Utility',
          of: ['breadcrumbs', 'component-gallery', 'blog-frontpage', 'latest-articles'],
        },
      ],
    },
  },
});
