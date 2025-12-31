/**
 * Events Frontpage Module Schema
 * @version 1.0.0
 * @lastUpdated 2025-12-30
 * @description Displays a list of events from a collection. When added to a page,
 * that page becomes a collection index for events (webinars, videos, physical events).
 */

import { CalendarIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'events-frontpage',
  title: 'Events Frontpage',
  icon: CalendarIcon,
  type: 'object',
  fields: [
    defineField({
      name: 'intro',
      title: 'Introduction',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Optional introduction text above the events list',
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Calendar View', value: 'calendar' },
          { title: 'Grid Cards', value: 'cards' },
          { title: 'List View', value: 'list' },
          { title: 'Timeline', value: 'timeline' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'cards',
    }),
    defineField({
      name: 'filterByType',
      title: 'Filter by Event Type',
      type: 'string',
      options: {
        list: [
          { title: 'All Events', value: 'all' },
          { title: 'Webinars Only', value: 'webinar' },
          { title: 'Videos Only', value: 'video' },
          { title: 'Physical Only', value: 'physical' },
          { title: 'Hybrid Only', value: 'hybrid' },
        ],
      },
      initialValue: 'all',
    }),
    defineField({
      name: 'showUpcomingFirst',
      title: 'Show upcoming events first',
      description: 'If enabled, upcoming events appear at the top, past events at the bottom.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showFeaturedFirst',
      title: 'Show featured events first',
      description: 'If enabled, featured events appear before non-featured.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'hidePastEvents',
      title: 'Hide past events',
      description: 'If enabled, only upcoming and current events are shown.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'limit',
      title: 'Events per page',
      description: 'Number of events to show per page. Set to 0 for unlimited.',
      type: 'number',
      initialValue: 12,
      validation: (Rule) => Rule.min(0).integer(),
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
      layout: 'layout',
      limit: 'limit',
      filterByType: 'filterByType',
    },
    prepare: ({ layout, limit, filterByType }) => {
      const subtitle = [
        layout && `${layout} view`,
        limit && `${limit} per page`,
        filterByType && filterByType !== 'all' && `${filterByType} only`,
      ]
        .filter(Boolean)
        .join(' · ');

      return {
        title: 'Events Frontpage',
        subtitle: subtitle || 'Events Frontpage',
        media: CalendarIcon,
      };
    },
  },
});
