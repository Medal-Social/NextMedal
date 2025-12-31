/**
 * Documentation Frontpage Module Schema
 * @version 2.0.0
 * @lastUpdated 2025-12-30
 * @description Displays documentation navigation on a page. When added to a page,
 * that page becomes a documentation collection root and doc articles can reference it.
 * @changelog
 * - 2.0.0: Added category ordering and sidebar organization options
 * - 1.0.0: Initial version with collection-based filtering
 */

import { BookIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';

export default defineType({
  name: 'docs-frontpage',
  title: 'Documentation Frontpage',
  icon: BookIcon,
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'categories', title: 'Categories' },
    { name: 'display', title: 'Display Options' },
  ],
  fields: [
    defineField({
      name: 'intro',
      title: 'Introduction',
      description: 'Optional intro text displayed above the documentation navigation.',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content',
    }),

    // Category ordering
    defineField({
      name: 'categoryOrder',
      title: 'Category Order',
      description:
        'Drag to reorder categories in the sidebar. Categories not listed here will appear at the end sorted by their default order.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'categoryRef',
          type: 'reference',
          to: [{ type: 'docs.category' }],
        }),
      ],
      group: 'categories',
    }),

    defineField({
      name: 'showUncategorized',
      title: 'Show Uncategorized Articles',
      description: 'Display articles without a category in a separate section.',
      type: 'boolean',
      initialValue: true,
      group: 'categories',
    }),

    defineField({
      name: 'uncategorizedLabel',
      title: 'Uncategorized Label',
      description: 'Label for the uncategorized section.',
      type: 'string',
      initialValue: 'Other',
      hidden: ({ parent }) => !parent?.showUncategorized,
      group: 'categories',
    }),

    defineField({
      name: 'uncategorizedPosition',
      title: 'Uncategorized Position',
      description: 'Where to show uncategorized articles in the sidebar.',
      type: 'string',
      options: {
        list: [
          { title: 'At the end', value: 'end' },
          { title: 'At the beginning', value: 'start' },
        ],
        layout: 'radio',
      },
      initialValue: 'end',
      hidden: ({ parent }) => !parent?.showUncategorized,
      group: 'categories',
    }),

    defineField({
      name: 'layout',
      title: 'Layout Style',
      description: 'Choose how the documentation is displayed.',
      type: 'string',
      options: {
        list: [
          { title: 'Sidebar Navigation', value: 'sidebar' },
          { title: 'Card Grid', value: 'cards' },
          { title: 'Categorized List', value: 'categorized' },
        ],
        layout: 'radio',
      },
      initialValue: 'sidebar',
      group: 'display',
    }),

    defineField({
      name: 'sidebarStyle',
      title: 'Sidebar Style',
      description: 'How categories appear in the sidebar.',
      type: 'string',
      options: {
        list: [
          { title: 'Collapsible sections', value: 'collapsible' },
          { title: 'Always expanded', value: 'expanded' },
          { title: 'Flat list (no category headers)', value: 'flat' },
        ],
        layout: 'radio',
      },
      initialValue: 'collapsible',
      hidden: ({ parent }) => parent?.layout !== 'sidebar',
      group: 'display',
    }),

    defineField({
      name: 'showCategoryDescriptions',
      title: 'Show Category Descriptions',
      description: 'Display category descriptions in the sidebar or cards.',
      type: 'boolean',
      initialValue: false,
      group: 'display',
    }),

    defineField({
      name: 'showCategoryIcons',
      title: 'Show Category Icons',
      description: 'Display category icons/emojis in the sidebar.',
      type: 'boolean',
      initialValue: true,
      group: 'display',
    }),

    defineField({
      name: 'showSearch',
      title: 'Show Search',
      description:
        'Display a search box for filtering documentation. Note: Full-text search requires custom implementation.',
      type: 'boolean',
      initialValue: false,
      group: 'display',
    }),

    defineField({
      name: 'showTableOfContents',
      title: 'Show Table of Contents',
      description: 'Display a table of contents on article pages.',
      type: 'boolean',
      initialValue: true,
      group: 'display',
    }),

    defineField({
      name: 'showRelatedDocs',
      title: 'Show Related Docs',
      description: 'Display related documentation at the bottom of articles.',
      type: 'boolean',
      initialValue: true,
      group: 'display',
    }),

    defineField({
      name: 'defaultArticle',
      title: 'Default Article',
      description: 'Article to display when visiting the documentation root.',
      type: 'reference',
      to: [{ type: 'collection.documentation' }],
      group: 'content',
    }),
  ],
  preview: {
    select: {
      intro: 'intro',
      layout: 'layout',
      categoryCount: 'categoryOrder',
    },
    prepare: ({ intro, layout, categoryCount }) => {
      const introText = getBlockText(intro);
      const categoryInfo = categoryCount?.length ? `${categoryCount.length} categories` : '';
      const subtitle = ['Documentation', layout && `(${layout})`, categoryInfo]
        .filter(Boolean)
        .join(' - ');

      return {
        title: introText || 'Documentation Frontpage',
        subtitle,
        media: BookIcon,
      };
    },
  },
});
