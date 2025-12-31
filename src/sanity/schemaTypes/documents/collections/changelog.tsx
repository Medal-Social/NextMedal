/**
 * Collection Changelog Document Type
 * @version 2.0.0
 * @lastUpdated 2025-12-30
 * @description Simplified changelog entry with just date and content.
 * List-only collection displayed inline on the changelog page.
 */

import { DocumentTextIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'collection.changelog',
  title: 'Changelog Entry',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    // Collection reference (parent page)
    defineField({
      name: 'collection',
      title: 'Collection',
      type: 'reference',
      to: [{ type: 'page' }],
      description: 'The changelog page this entry belongs to',
      validation: (Rule) => Rule.required(),
    }),

    // Release date
    defineField({
      name: 'publishDate',
      title: 'Release Date',
      type: 'date',
      options: {
        dateFormat: 'MMMM D, YYYY',
      },
      validation: (Rule) => Rule.required(),
    }),

    // Body content
    defineField({
      name: 'body',
      title: 'Content',
      type: 'array',
      of: [
        defineArrayMember({ type: 'block' }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
            }),
            defineField({
              name: 'caption',
              type: 'string',
              title: 'Caption',
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),

    // Language (for i18n - hidden)
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
  ],

  preview: {
    select: {
      date: 'publishDate',
      body: 'body',
    },
    prepare({ date, body }) {
      // Extract first line of text from body for subtitle
      const firstBlock = body?.find((block: { _type: string }) => block._type === 'block');
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
