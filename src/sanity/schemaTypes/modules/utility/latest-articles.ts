/**
 * Latest Articles Module Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description Displays a list of recent articles with filtering options.
 * @changelog
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Initial version with grid/carousel layouts and category filtering
 */

import { EditIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';

export default defineType({
  name: 'latest-articles',
  title: 'Latest Articles',
  icon: EditIcon,
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'filtering', title: 'Filtering' },
    { name: 'options', title: 'Advanced Options' },
  ],
  fields: [
    defineField({
      name: 'intro',
      title: 'Intro',
      description: 'Introduction text/title for the article list.',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content',
    }),
    defineField({
      name: 'layout',
      title: 'Layout Style',
      description: 'Choose how the posts are displayed.',
      type: 'string',
      options: {
        list: ['grid', 'carousel'],
        layout: 'radio',
      },
      initialValue: 'carousel',
      group: 'options',
    }),
    defineField({
      name: 'showFeaturedPostsFirst',
      title: 'Show featured posts first',
      description: 'If enabled, posts marked as "Featured" will appear at the top.',
      type: 'boolean',
      initialValue: true,
      group: 'filtering',
    }),
    defineField({
      name: 'displayFilters',
      title: 'Display category filter buttons',
      description: 'Allows for on-page filtering of posts by category',
      type: 'boolean',
      initialValue: false,
      group: 'filtering',
      hidden: ({ parent }) => !!parent.filteredCategory,
    }),
    defineField({
      name: 'limit',
      title: 'Number of posts to show',
      description: 'Leave empty to show all posts',
      type: 'number',
      initialValue: 6,
      validation: (Rule) => Rule.min(1).integer(),
      group: 'filtering',
    }),
    defineField({
      name: 'filteredCategory',
      title: 'Filter posts by a category',
      description: 'Leave empty to show all posts',
      type: 'reference',
      to: [{ type: 'article.category' }],
      group: 'filtering',
    }),
  ],
  preview: {
    select: {
      intro: 'intro',
    },
    prepare: ({ intro }) => ({
      title: getBlockText(intro),
      subtitle: 'Latest Articles',
    }),
  },
});
