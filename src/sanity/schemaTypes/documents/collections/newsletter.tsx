/**
 * Collection Newsletter Schema
 * @version 2.0.0
 * @lastUpdated 2026-01-03
 * @description Newsletter issues with field-level translation support.
 * Single document contains all language versions for simpler management.
 * @changelog
 * - 2.0.0: Converted to field-level translation (title, preheader, body internationalized)
 * - 1.0.0: Initial version with collection reference pattern
 */

import { ControlsIcon, EnvelopeIcon, EyeClosedIcon, SearchIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import PageIdentityField from '@/sanity/ui/PageIdentityField';
import PageIdentityInput from '@/sanity/ui/PageIdentityInput';

export default defineType({
  name: 'collection.newsletter',
  title: 'Newsletter Issue',
  icon: EnvelopeIcon,
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', icon: EnvelopeIcon, default: true },
    { name: 'seo', title: 'SEO', icon: SearchIcon },
    { name: 'advanced', title: 'Advanced Options', icon: ControlsIcon },
  ],
  fields: [
    // Issue Number (shared across languages)
    defineField({
      name: 'issueNumber',
      title: 'Issue Number',
      description: 'The newsletter issue number - shared across all languages (e.g., #42)',
      type: 'number',
      validation: (Rule) => Rule.integer().positive(),
      group: 'content',
    }),
    // Newsletter Identity
    defineField({
      name: 'metadata',
      type: 'object',
      group: 'content',
      components: {
        field: PageIdentityField,
        input: PageIdentityInput,
      },
      fields: [
        defineField({
          name: 'title',
          title: 'Subject Line',
          description: 'The newsletter subject line / title - localized per language',
          type: 'internationalizedArrayString',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'slug',
          title: 'URL Slug',
          type: 'slug',
          description: 'The URL path for this newsletter issue - shared across all languages',
          options: {
            source: (doc) => {
              const document = doc as { metadata?: { title?: Array<{ value?: string }> } };
              // Extract first available language value for slug generation
              return document.metadata?.title?.[0]?.value || '';
            },
          },
          validation: (Rule) =>
            Rule.required().custom((slug) => {
              // Only ban system paths - language codes are fine since newsletters are under /newsletter/ prefix
              const reserved = ['studio', 'api', 'monitoring', 'rss.xml'];
              if (slug?.current && reserved.includes(slug.current.toLowerCase())) {
                return `"${slug.current}" is a reserved path.`;
              }
              if (slug?.current?.includes('/')) {
                return "Slugs cannot contain slashes. Use a flat structure (e.g., 'issue-42').";
              }
              return true;
            }),
        }),
      ],
    }),
    // Preheader / Preview text
    defineField({
      name: 'preheader',
      title: 'Preview Text',
      description:
        'Short preview text shown in email clients - localized per language (40-100 characters)',
      type: 'internationalizedArrayString',
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: 'Content',
      description: 'The main content of the newsletter - localized per language',
      type: 'internationalizedArrayBlockContent',
      group: 'content',
    }),
    defineField({
      name: 'publishDate',
      title: 'Send Date',
      description: 'Date when the newsletter was sent.',
      type: 'date',
      initialValue: () => new Date().toISOString().split('T')[0],
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    // SEO Settings
    defineField({
      name: 'seo',
      type: 'seo-metadata',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      issueNumber: 'issueNumber',
      title: 'metadata.title',
      slug: 'metadata.slug.current',
      publishDate: 'publishDate',
      media: 'seo.image',
      noindex: 'seo.noIndex',
    },
    prepare: ({ title, issueNumber, slug, publishDate, media, noindex }) => {
      // Extract first available language value from internationalized array
      const titleText =
        Array.isArray(title) && title.length > 0 ? title[0].value || 'Untitled' : 'Untitled';

      const subtitle = [publishDate, `/${slug || 'no-slug'}`].filter(Boolean).join(' - ');

      const displayTitle = [issueNumber && `#${issueNumber}`, titleText].filter(Boolean).join(' ');

      return {
        title: displayTitle,
        subtitle,
        media: media || (noindex ? EyeClosedIcon : EnvelopeIcon),
      };
    },
  },
  orderings: [
    {
      title: 'Issue Number',
      name: 'issueNumber',
      by: [{ field: 'issueNumber', direction: 'desc' }],
    },
    {
      title: 'Date',
      name: 'date',
      by: [{ field: 'publishDate', direction: 'desc' }],
    },
    {
      title: 'Title',
      name: 'seo.title',
      by: [{ field: 'seo.title', direction: 'asc' }],
    },
  ],
});
