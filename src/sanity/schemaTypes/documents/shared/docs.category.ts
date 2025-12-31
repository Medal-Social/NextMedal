/**
 * Documentation Category Schema
 * @version 1.0.0
 * @lastUpdated 2025-12-30
 * @description Categories for organizing documentation articles.
 * Supports ordering for controlling how categories appear in the sidebar.
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
      description: 'The name of the category (e.g. "Getting Started", "API Reference").',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'URL-friendly version of the name (used for filtering/anchors).',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'Optional short description shown in the sidebar or category header.',
      type: 'text',
      rows: 2,
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
    prepare: ({ title, order, icon }) => ({
      title: icon ? `${icon} ${title}` : title || 'Untitled Category',
      subtitle: `Order: ${order || 100}`,
      media: FolderIcon,
    }),
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
