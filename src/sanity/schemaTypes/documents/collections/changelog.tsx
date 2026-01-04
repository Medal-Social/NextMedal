/**
 * Collection Changelog Document Type
 * @version 3.0.0
 * @lastUpdated 2026-01-03
 * @description Simplified changelog entry with field-level translation support.
 * Single document contains all language versions. List-only collection displayed inline on changelog page.
 * @changelog
 * - 3.0.0: Converted to field-level translation (body content internationalized)
 * - 2.0.0: Simplified to just date and content
 */

import { DocumentTextIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'collection.changelog',
  title: 'Changelog Entry',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    // Release date (shared across languages)
    defineField({
      name: 'publishDate',
      title: 'Release Date',
      type: 'date',
      description: 'Release date - shared across all languages',
      initialValue: () => new Date().toISOString().split('T')[0],
      options: {
        dateFormat: 'MMMM D, YYYY',
      },
      validation: (Rule) => Rule.required(),
    }),

    // Body content (localized)
    defineField({
      name: 'body',
      title: 'Content',
      type: 'internationalizedArrayBlockContent',
      description: 'Changelog content - localized per language',
      validation: (Rule) => Rule.required(),
    }),
  ],

  preview: {
    select: {
      date: 'publishDate',
      body: 'body',
    },
    prepare({ date, body }) {
      // Extract first available language value from internationalized array
      const bodyArray = Array.isArray(body) && body.length > 0 ? body[0].value : null;

      // Extract first line of text from body for subtitle
      const firstBlock = bodyArray?.find((block: { _type: string }) => block._type === 'block');
      const text =
        firstBlock?.children?.map((child: { text?: string }) => child.text).join('') || '';
      const preview = text.length > 60 ? `${text.slice(0, 60)}...` : text;

      return {
        title: date
          ? new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'No date',
        subtitle: preview || 'No content',
        media: DocumentTextIcon,
      };
    },
  },

  orderings: [
    {
      title: 'Release Date, Newest',
      name: 'publishDateDesc',
      by: [{ field: 'publishDate', direction: 'desc' }],
    },
    {
      title: 'Release Date, Oldest',
      name: 'publishDateAsc',
      by: [{ field: 'publishDate', direction: 'asc' }],
    },
  ],
});
