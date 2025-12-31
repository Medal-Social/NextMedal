/**
 * Articles Frontpage Module Schema
 * @version 1.1.0
 * @lastUpdated 2025-12-30
 * @description Displays a list of articles from a collection. When added to a page,
 * that page becomes a collection index and articles can reference it.
 * Use for: Articles, Press, News, Studio posts, or any article-based content.
 * @changelog
 * - 1.1.0: Removed unused fields (layout, columns, filterByCategory)
 * - 1.0.0: Initial version with collection-based filtering
 */

import { DocumentsIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'articles-frontpage',
  title: 'Articles Frontpage',
  icon: DocumentsIcon,
  type: 'object',
  fields: [
    defineField({
      name: 'showFeaturedFirst',
      title: 'Show featured articles first',
      description: 'If enabled, articles marked as "Featured" will appear at the top.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'displayFilters',
      title: 'Display filters and view toggle',
      description: 'Show category filters and grid/list view toggle bar.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'limit',
      title: 'Articles per page',
      description: 'Number of articles to show per page.',
      type: 'number',
      initialValue: 12,
      validation: (Rule) => Rule.min(1).integer(),
    }),
    defineField({
      name: 'showRssLink',
      title: 'Show RSS feed link',
      description: 'Display a link to the RSS feed for this collection.',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      limit: 'limit',
      displayFilters: 'displayFilters',
    },
    prepare: ({ limit, displayFilters }) => {
      const subtitle = [
        'Articles Frontpage',
        limit && `${limit} per page`,
        displayFilters === false && 'no filters',
      ]
        .filter(Boolean)
        .join(' · ');

      return {
        title: 'Articles Frontpage',
        subtitle,
        media: DocumentsIcon,
      };
    },
  },
});
