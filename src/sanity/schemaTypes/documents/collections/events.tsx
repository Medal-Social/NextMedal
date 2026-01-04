/**
 * Collection Events Document Type
 * @version 3.0.0
 * @lastUpdated 2026-01-04
 * @description Event document type with document-level translation support for webinars, videos, and physical events.
 * Uses translation.metadata system for multi-language support (same as articles, docs, etc.).
 * @changelog
 * - 3.0.0: Converted to document-level translation (language field + translation.metadata)
 * - 2.0.0: Converted to field-level translation (title, description, body internationalized)
 * - 1.0.0: Initial version with collection reference pattern
 */

import { CalendarIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { DEFAULT_LOCALE } from '@/i18n/config';
import { isUniqueAcrossLocale } from '@/sanity/lib/isUniqueAcrossLocale';
import PageIdentityField from '@/sanity/ui/PageIdentityField';
import PageIdentityInput from '@/sanity/ui/PageIdentityInput';

// Event type icons for preview
const eventTypeIcons: Record<string, string> = {
  webinar: '🎥',
  video: '📹',
  physical: '📍',
  hybrid: '🌐',
};

export default defineType({
  name: 'collection.events',
  title: 'Event',
  type: 'document',
  icon: CalendarIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'details', title: 'Event Details' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
      initialValue: DEFAULT_LOCALE,
    }),
    // Page identity (title + slug)
    defineField({
      name: 'metadata',
      type: 'object',
      title: 'Page Identity',
      group: 'content',
      components: {
        field: PageIdentityField,
        input: PageIdentityInput,
      },
      fields: [
        defineField({
          name: 'title',
          type: 'string',
          title: 'Event Title',
          description: 'Event title',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'slug',
          type: 'slug',
          title: 'URL Slug',
          description: 'The URL path for this event (appended to /events/)',
          options: {
            source: (doc) => {
              const document = doc as { metadata?: { title?: string } };
              return document.metadata?.title || '';
            },
            maxLength: 96,
            isUnique: isUniqueAcrossLocale,
          },
          validation: (Rule) =>
            Rule.required().custom((slug) => {
              // Only ban system paths - language codes are fine since events are under /events/ prefix
              const reserved = ['studio', 'api', 'monitoring', 'rss.xml'];
              if (slug?.current && reserved.includes(slug.current.toLowerCase())) {
                return `"${slug.current}" is a reserved path.`;
              }
              if (slug?.current?.includes('/')) {
                return "Slugs cannot contain slashes. Use a flat structure (e.g., 'my-event-2025').";
              }
              return true;
            }),
        }),
        defineField({
          name: 'description',
          type: 'text',
          title: 'Description',
          description: 'Brief description for listings and SEO',
          rows: 3,
        }),
        defineField({
          name: 'image',
          type: 'image',
          title: 'Cover Image',
          description: 'Cover image for this event',
          options: { hotspot: true },
        }),
      ],
    }),

    // Event type
    defineField({
      name: 'eventType',
      title: 'Event Type',
      type: 'string',
      options: {
        list: [
          { title: '🎥 Webinar (Live Online)', value: 'webinar' },
          { title: '📹 Video (Recorded)', value: 'video' },
          { title: '📍 Physical (In-Person)', value: 'physical' },
          { title: '🌐 Hybrid (Both)', value: 'hybrid' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'webinar',
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),

    // Date and time (hidden for recorded videos)
    defineField({
      name: 'startDateTime',
      title: 'Start Date & Time',
      type: 'datetime',
      description: 'When the event starts (not needed for recorded videos)',
      initialValue: () => new Date().toISOString(),
      options: {
        dateFormat: 'MMMM D, YYYY',
        timeFormat: 'HH:mm',
      },
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { eventType?: string };
          // Required for all types except video
          if (parent?.eventType !== 'video' && !value) {
            return 'Start date & time is required for live and physical events';
          }
          return true;
        }),
      hidden: ({ parent }) => parent?.eventType === 'video',
      group: 'details',
    }),

    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'number',
      description: 'Event duration in hours (not needed for recorded videos)',
      options: {
        list: [
          { title: '30 minutes', value: 0.5 },
          { title: '1 hour', value: 1 },
          { title: '1.5 hours', value: 1.5 },
          { title: '2 hours', value: 2 },
          { title: '3 hours', value: 3 },
          { title: '4 hours (half day)', value: 4 },
          { title: '8 hours (full day)', value: 8 },
        ],
      },
      initialValue: 1,
      hidden: ({ parent }) => parent?.eventType === 'video',
      group: 'details',
    }),

    defineField({
      name: 'timezone',
      title: 'Timezone',
      type: 'string',
      description: 'Display timezone (e.g., CET, PST, UTC) - not needed for recorded videos',
      initialValue: 'CET',
      hidden: ({ parent }) => parent?.eventType === 'video',
      group: 'details',
    }),

    // Location (for physical/hybrid events)
    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      group: 'details',
      hidden: ({ parent }) =>
        !parent?.eventType || parent.eventType === 'webinar' || parent.eventType === 'video',
      fields: [
        defineField({
          name: 'venue',
          title: 'Venue Name',
          type: 'string',
        }),
        defineField({
          name: 'address',
          title: 'Address',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'city',
          title: 'City',
          type: 'string',
        }),
        defineField({
          name: 'country',
          title: 'Country',
          type: 'string',
        }),
        defineField({
          name: 'mapUrl',
          title: 'Google Maps URL',
          type: 'url',
        }),
      ],
    }),

    // Registration form reference
    defineField({
      name: 'registrationForm',
      title: 'Registration Form',
      type: 'reference',
      to: [{ type: 'form' }],
      group: 'details',
      description: 'Select a form to capture registrations (not needed for recorded videos)',
      hidden: ({ parent }) => parent?.eventType === 'video',
    }),

    // Speakers/hosts
    defineField({
      name: 'speakers',
      title: 'Speakers / Hosts',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'person' }],
        }),
      ],
      group: 'content',
    }),

    // Full content
    defineField({
      name: 'body',
      title: 'Description',
      type: 'array',
      description: 'Full event description',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Underline', value: 'underline' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                ],
              },
            ],
          },
        },
      ],
      group: 'content',
    }),

    // SEO fields
    defineField({
      name: 'seo',
      type: 'seo-metadata',
      group: 'seo',
    }),
  ],

  preview: {
    select: {
      title: 'metadata.title',
      eventType: 'eventType',
      date: 'startDateTime',
      image: 'metadata.image',
    },
    prepare({ title, eventType, date, image }) {
      const titleText = title || 'Untitled';
      const typeIcon = eventType ? eventTypeIcons[eventType] || '' : '';
      const dateStr = date ? new Date(date).toLocaleDateString() : 'No date';
      const isPast = date ? new Date(date) < new Date() : false;

      return {
        title: `${typeIcon} ${titleText}`.trim(),
        subtitle: `${isPast ? '✓ ' : ''}${dateStr}`,
        media: image || CalendarIcon,
      };
    },
  },

  orderings: [
    {
      title: 'Event Date, Upcoming',
      name: 'startDateDesc',
      by: [{ field: 'startDateTime', direction: 'asc' }],
    },
    {
      title: 'Event Date, Past',
      name: 'startDateAsc',
      by: [{ field: 'startDateTime', direction: 'desc' }],
    },
  ],
});
