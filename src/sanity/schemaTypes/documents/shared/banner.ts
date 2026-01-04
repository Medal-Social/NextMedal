/**
 * Banner Schema
 * @version 2.0.0
 * @lastUpdated 2026-01-03
 * @description Site-wide banner with field-level translation support.
 * @changelog
 * - 2.0.0: Converted content to field-level translation with internationalizedArrayBlockContent
 * - 1.0.0: Initial version
 */

import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'banner',
  type: 'document',
  title: 'Banner',
  fields: [
    defineField({
      name: 'start',
      type: 'datetime',
      description: 'Optional start date for scheduling the banner (shared across all languages).',
    }),
    defineField({
      name: 'end',
      type: 'datetime',
      description: 'Optional end date for scheduling the banner (shared across all languages).',
    }),
    defineField({
      name: 'content',
      type: 'internationalizedArrayBlockContent',
      title: 'Banner Content',
      description: 'The banner content - localized per language.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cta',
      type: 'menuItem',
      description: 'Optional call-to-action link.',
    }),
  ],
  preview: {
    select: {
      content: 'content',
      start: 'start',
      end: 'end',
    },
    prepare: ({ content, start, end }) => {
      // Extract first available language value from internationalized array
      const contentArray = Array.isArray(content) && content.length > 0 ? content[0].value : null;
      const text =
        contentArray?.[0]?.children
          ?.map((child: { text?: string }) => child.text)
          .filter(Boolean)
          .join(' ') || 'Banner';
      const schedule =
        start || end
          ? ` (${start ? `from ${new Date(start).toLocaleDateString()}` : ''}${start && end ? ' ' : ''}${end ? `to ${new Date(end).toLocaleDateString()}` : ''})`
          : '';
      return {
        title: text,
        subtitle: schedule,
      };
    },
  },
});
