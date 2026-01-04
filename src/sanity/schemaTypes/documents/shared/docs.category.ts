/**
 * Documentation Category Schema
 * @version 1.1.0
 * @lastUpdated 2026-01-03
 * @description Categories for organizing documentation articles.
 * Supports ordering for controlling how categories appear in the sidebar.
 * @changelog
 * - 1.1.0: Added language field for translation support
 * - 1.0.0: Initial version
 */

import { FolderIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'docs.category',
  title: 'Documentation Category',
  type: 'document',
  icon: FolderIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Name',
      description:
        'The name of the category (e.g. "Getting Started", "API Reference") - localized per language',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description:
        'URL-friendly version of the name (shared across all languages, used for filtering/anchors).',
      type: 'slug',
      options: {
        source: (doc) => {
          const document = doc as { title?: Array<{ value?: string }> };
          // Use first available language value for slug generation
          return document.title?.[0]?.value || '';
        },
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description:
        'Optional short description shown in the sidebar or category header - localized per language',
      type: 'internationalizedArrayText',
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      description: 'Optional emoji or icon name for the category.',
      type: 'string',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      description: 'Controls the display order in the sidebar (lower numbers appear first).',
      type: 'number',
      initialValue: 100,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      order: 'order',
      icon: 'icon',
    },
    prepare: ({ title, order, icon }) => {
      // Extract first available language value from internationalized array
      const titleText =
        Array.isArray(title) && title.length > 0
          ? title[0].value || 'Untitled Category'
          : 'Untitled Category';

      return {
        title: icon ? `${icon} ${titleText}` : titleText,
        subtitle: `Order: ${order || 100}`,
        media: FolderIcon,
      };
    },
  },
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
});
