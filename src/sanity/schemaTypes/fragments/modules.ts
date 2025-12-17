import { defineField } from 'sanity';

export default defineField({
  name: 'modules',
  description: 'Page content',
  type: 'array',
  of: [
    { type: 'videoHero' },
    { type: 'component-gallery' },
    { type: 'galleryHero' },
    { type: 'featuredHero' },
    { type: 'hero' },
    { type: 'accordion-list' },
    { type: 'feature-grid' },
    { type: 'callout' },
    { type: 'richtext-module' },
    { type: 'logo-list' },
    { type: 'person-list' },
    { type: 'pricing-list' },
    { type: 'product-comparison' },
    { type: 'blog-frontpage' },
    { type: 'blog-list' },
    { type: 'blog-post-content' },
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
          of: ['featuredHero', 'videoHero', 'galleryHero', 'hero'],
        },
        {
          name: 'Components',
          of: ['component-gallery'],
        },
        {
          name: 'Content Blocks',
          of: ['richtext-module', 'callout', 'accordion-list'],
        },
        {
          name: 'Feature Displays',
          of: ['feature-grid', 'logo-list', 'person-list', 'pricing-list', 'product-comparison'],
        },
        {
          name: 'Blog',
          of: ['blog-frontpage', 'blog-list', 'blog-post-content'],
        },
        {
          name: 'Navigation',
          of: ['breadcrumbs'],
        },
      ],
    },
  },
});
