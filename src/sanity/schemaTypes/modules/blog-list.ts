/**
 * Blog List Module Schema
 * @version 1.0.0
 * @lastUpdated 2024-03-21
 * @description A module for displaying a list of blog posts with filtering and layout options.
 * @changelog
 * - 1.0.0: Initial version with grid/carousel layouts and category filtering
 */

import { VscEdit } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';

export default defineType({
  name: 'blog-list',
  title: 'Latest Articles',
  icon: VscEdit,
  type: 'object',
  groups: [{ name: 'content', default: true }, { name: 'filtering' }, { name: 'options' }],
  fields: [
    defineField({
      name: 'pretitle',
      title: 'Pretitle',
      description: 'Small text above the main title.',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      description: 'Introduction text/title for the blog list.',
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
      to: [{ type: 'blog.category' }],
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
