/**
 * Newsletter Frontpage Module Schema
 * @version 1.0.0
 * @lastUpdated 2025-12-30
 * @description Displays a list of newsletter issues from a collection. When added to a page,
 * that page becomes a newsletter archive and newsletter issues can reference it.
 * @changelog
 * - 1.0.0: Initial version with collection-based filtering
 */

import { EnvelopeIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';

export default defineType({
  name: 'newsletter-frontpage',
  title: 'Newsletter Frontpage',
  icon: EnvelopeIcon,
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'display', title: 'Display Options' },
    { name: 'filtering', title: 'Filtering' },
  ],
  fields: [
    defineField({
      name: 'intro',
      title: 'Introduction',
      description: 'Optional intro text displayed above the newsletter list.',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content',
    }),
    defineField({
      name: 'layout',
      title: 'Layout Style',
      description: 'Choose how the newsletters are displayed.',
      type: 'string',
      options: {
        list: [
          { title: 'Grid', value: 'grid' },
          { title: 'List', value: 'list' },
          { title: 'Carousel', value: 'carousel' },
        ],
        layout: 'radio',
      },
      initialValue: 'list',
      group: 'display',
    }),
    defineField({
      name: 'columns',
      title: 'Grid Columns',
      description: 'Number of columns in grid layout (on desktop).',
      type: 'number',
      options: {
        list: [2, 3, 4],
      },
      initialValue: 3,
      hidden: ({ parent }) => parent?.layout !== 'grid',
      group: 'display',
    }),
    defineField({
      name: 'showFeaturedFirst',
      title: 'Show featured issues first',
      description: 'If enabled, issues marked as "Featured" will appear at the top.',
      type: 'boolean',
      initialValue: true,
      group: 'filtering',
    }),
    defineField({
      name: 'limit',
      title: 'Issues per page',
      description: 'Number of newsletter issues to show per page.',
      type: 'number',
      initialValue: 12,
      validation: (Rule) => Rule.min(1).integer(),
      group: 'filtering',
    }),
    defineField({
      name: 'showRssLink',
      title: 'Show RSS feed link',
      description: 'Display a link to the RSS feed for this newsletter.',
      type: 'boolean',
      initialValue: true,
      group: 'display',
    }),
  ],
  preview: {
    select: {
      intro: 'intro',
      layout: 'layout',
      limit: 'limit',
    },
    prepare: ({ intro, layout, limit }) => {
      const introText = getBlockText(intro);
      const subtitle = ['Newsletter Archive', layout && `(${layout})`, limit && `${limit} per page`]
        .filter(Boolean)
        .join(' - ');

      return {
        title: introText || 'Newsletter Frontpage',
        subtitle,
        media: EnvelopeIcon,
      };
    },
  },
});
