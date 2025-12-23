/**
 * Banner Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description Defines the banner content and schedule for site-wide announcements.
 * @changelog
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Initial version with scheduling and content controls
 */

import { VscCalendar, VscPin } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';

export default defineType({
  name: 'banner',
  title: 'Banner',
  icon: VscPin,
  type: 'document',
  fieldsets: [{ name: 'schedule', options: { columns: 2 } }],
  fields: [
    defineField({
      name: 'start',
      title: 'Start',
      description: 'Date and time when the banner should start appearing.',
      type: 'datetime',
      fieldset: 'schedule',
    }),
    defineField({
      name: 'end',
      title: 'End',
      description: 'Date and time when the banner should stop appearing.',
      type: 'datetime',
      fieldset: 'schedule',
      validation: (Rule) =>
        Rule.custom((end, context) => {
          const start = (context.document as any)?.start as string | undefined;

          if (end && start && new Date(end) <= new Date(start)) {
            return 'End date must be after start date';
          }

          return true;
        }),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      description: 'Main text content for the banner.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [],
          lists: [],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
          },
        },
      ],
      validation: (Rule) =>
        Rule.custom((blocks) => {
          const text = getBlockText(blocks as any, ' ');
          return text.length > 150
            ? 'Banner content should be concise (recommended max 150 characters)'
            : true;
        }).warning(),
    }),
    defineField({
      name: 'cta',
      title: 'Link',
      description: 'Optional call-to-action link.',
      type: 'menuItem',
    }),
  ],
  preview: {
    select: {
      content: 'content',
      cta: 'cta.label',
      start: 'start',
      end: 'end',
    },
    prepare: ({ content, cta, start, end }) => ({
      title: getBlockText(content),
      subtitle: cta,
      media: (start || end) && VscCalendar,
    }),
  },
});
