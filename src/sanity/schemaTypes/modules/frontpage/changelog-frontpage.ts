/**
 * Changelog Frontpage Module
 * @version 1.0.0
 * @lastUpdated 2025-12-30
 * @description Module for displaying a changelog/release notes on a page.
 * This module enables a page to act as a changelog collection index.
 */

import { DocumentTextIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';

export default defineType({
  name: 'changelog-frontpage',
  title: 'Changelog Frontpage',
  type: 'object',
  icon: DocumentTextIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'display', title: 'Display Options' },
  ],
  fields: [
    defineField({
      name: 'intro',
      title: 'Introduction',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Optional introduction text above the changelog',
      group: 'content',
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Timeline', value: 'timeline' },
          { title: 'Cards', value: 'cards' },
          { title: 'Compact', value: 'compact' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'timeline',
      group: 'display',
    }),
    defineField({
      name: 'groupByYear',
      title: 'Group by Year',
      type: 'boolean',
      description: 'Group changelog entries by year',
      initialValue: true,
      group: 'display',
    }),
    defineField({
      name: 'showFeaturedFirst',
      title: 'Show Featured First',
      type: 'boolean',
      description: 'Display featured entries at the top',
      initialValue: false,
      group: 'display',
    }),
    defineField({
      name: 'limit',
      title: 'Limit',
      type: 'number',
      description: 'Maximum number of entries to display (0 for all)',
      initialValue: 0,
      validation: (Rule) => Rule.min(0).integer(),
      group: 'display',
    }),
    defineField({
      name: 'showRssLink',
      title: 'Show RSS Link',
      type: 'boolean',
      description: 'Display a link to the RSS feed',
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
      const subtitle = ['Changelog', layout && `(${layout})`, limit ? `max ${limit}` : '']
        .filter(Boolean)
        .join(' - ');

      return {
        title: introText || 'Changelog Frontpage',
        subtitle,
        media: DocumentTextIcon,
      };
    },
  },
});
