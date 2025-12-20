import { defineField } from 'sanity';

export default defineField({
  name: 'modules',
  description: 'Page content',
  type: 'array',
  of: [
    { type: 'videoHero' },
    { type: 'component-gallery' },
    { type: 'hero' },
    { type: 'accordion-list' },
    { type: 'features' },
    { type: 'callout' },
    { type: 'richtext' },
    { type: 'logo-cloud' },
    { type: 'team' },
    { type: 'pricing-list' },
    { type: 'product-comparison' },
    { type: 'blog-frontpage' },
    { type: 'latest-articles' },
    { type: 'breadcrumbs' },
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
          name: 'Content Blocks',
          of: [
            'richtext',
            'callout',
            'accordion-list',
            'features',
            'logo-cloud',
            'team',
            'pricing-list',
            'product-comparison',
          ],
        },
        {
          name: 'Blog',
          of: ['blog-frontpage', 'latest-articles'],
        },
        {
          name: 'Utility',
          of: ['breadcrumbs', 'component-gallery'],
        },
      ],
    },
  },
});
