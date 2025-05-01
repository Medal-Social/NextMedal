import { defineField } from 'sanity';

export default defineField({
  name: 'modules',
  description: 'Page content',
  type: 'array',
  of: [
    { type: 'videoHero' },
    { type: 'galleryHero' },
    { type: 'featuredHero' },
    { type: 'accordion-list' },
    { type: 'feature-grid' },
    { type: 'callout' },
    { type: 'hero' },
    { type: 'tabbedContent' },
    { type: 'richtext-module' },
    { type: 'logo-list' },
    { type: 'person-list' },
    { type: 'pricing-list' },
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
          previewImageUrl: (schemaType) => `/admin/thumbnails/${schemaType}.webp`,
        },
        { name: 'list' },
      ],
      groups: [
        {
          name: 'Hero Sections',
          of: ['hero', 'featuredHero', 'videoHero', 'galleryHero'],
        },
        {
          name: 'Content Blocks',
          of: ['richtext-module', 'callout', 'tabbedContent', 'accordion-list'],
        },
        {
          name: 'Feature Displays',
          of: [
            'feature-grid',
            'logo-list',
            'person-list',
            'pricing-list',
          ],
        },
        {
          name: 'Blog',
          of: [
            'blog-frontpage',
            'blog-list',
            'blog-post-content',
          ],
        },
        {
          name: 'Navigation',
          of: ['breadcrumbs'],
        },
      ],
    },
  },
});
