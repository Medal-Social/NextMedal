/**
 * Collection Events Document Type
 * @version 1.0.0
 * @lastUpdated 2025-12-30
 * @description Event document type for webinars, videos, and physical events.
 * References a parent collection page for dynamic URL resolution.
 */

import { CalendarIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { isUniqueAcrossLocale } from '@/sanity/lib/isUniqueAcrossLocale';
import PageIdentityField from '@/sanity/ui/PageIdentityField';

// Flag emoji for preview
const languageFlags: Record<string, string> = {
  en: '🇬🇧',
  nb: '🇳🇴',
};

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
    // Collection reference (parent page)
    defineField({
      name: 'collection',
      title: 'Collection',
      type: 'reference',
      to: [{ type: 'page' }],
      description: 'The collection page this event belongs to (determines URL)',
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),

    // Page identity (title + slug)
    defineField({
      name: 'metadata',
      type: 'object',
      title: 'Page Identity',
      group: 'content',
      components: {
        field: PageIdentityField,
      },
      fields: [
        defineField({
          name: 'title',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'slug',
          type: 'slug',
          options: {
            source: 'metadata.title',
            maxLength: 96,
            isUnique: isUniqueAcrossLocale,
          },
          validation: (Rule) =>
            Rule.required().custom((slug) => {
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
          rows: 3,
          title: 'Description',
          description: 'Brief description for listings and SEO',
        }),
        defineField({
          name: 'image',
          type: 'image',
          title: 'Cover Image',
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

    // Featured
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'string',
      options: {
        list: [
          { title: 'Standard', value: 'standard' },
          { title: 'Featured', value: 'featured' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'standard',
      group: 'content',
    }),

    // Date and time
    defineField({
      name: 'startDateTime',
      title: 'Start Date & Time',
      type: 'datetime',
      options: {
        dateFormat: 'MMMM D, YYYY',
        timeFormat: 'HH:mm',
      },
      validation: (Rule) => Rule.required(),
      group: 'details',
    }),

    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'number',
      description: 'Event duration in hours',
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
      group: 'details',
    }),

    defineField({
      name: 'timezone',
      title: 'Timezone',
      type: 'string',
      description: 'Display timezone for the event (e.g., CET, PST, UTC)',
      initialValue: 'CET',
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
      description: 'Select a form to capture registrations. Leave empty for no registration.',
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
      group: 'content',
    }),

    // SEO fields
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({ name: 'title', type: 'string', title: 'SEO Title' }),
        defineField({
          name: 'description',
          type: 'text',
          title: 'SEO Description',
          rows: 3,
        }),
        defineField({
          name: 'image',
          type: 'image',
          title: 'OG Image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'noIndex',
          type: 'boolean',
          title: 'No Index',
          description: 'Prevent this page from being indexed by search engines',
        }),
      ],
    }),

    // Language (for i18n)
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
  ],

  preview: {
    select: {
      title: 'metadata.title',
      eventType: 'eventType',
      date: 'startDateTime',
      language: 'language',
      image: 'metadata.image',
    },
    prepare({ title, eventType, date, language, image }) {
      const flag = language ? languageFlags[language] || '' : '';
      const typeIcon = eventType ? eventTypeIcons[eventType] || '' : '';
      const dateStr = date ? new Date(date).toLocaleDateString() : 'No date';
      const isPast = date ? new Date(date) < new Date() : false;

      return {
        title: `${flag} ${typeIcon} ${title || 'Untitled'}`.trim(),
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
