/**
 * Lead Document Type
 * @version 1.0.0
 * @lastUpdated 2025-12-30
 * @description Stores captured leads from event registrations and gated content.
 */

import { UserIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'lead',
  title: 'Lead',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
    }),
    defineField({
      name: 'jobTitle',
      title: 'Job Title',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'object',
      fields: [
        defineField({
          name: 'type',
          title: 'Type',
          type: 'string',
          options: {
            list: [
              { title: 'Event Registration', value: 'event' },
              { title: 'Newsletter', value: 'newsletter' },
              { title: 'Download', value: 'download' },
              { title: 'Contact Form', value: 'contact' },
              { title: 'Other', value: 'other' },
            ],
          },
        }),
        defineField({
          name: 'reference',
          title: 'Reference',
          type: 'reference',
          to: [{ type: 'collection.events' }, { type: 'collection.newsletter' }],
          description: 'The event or content this lead registered for',
        }),
        defineField({
          name: 'url',
          title: 'Page URL',
          type: 'string',
          description: 'The page where the lead signed up',
        }),
      ],
    }),
    defineField({
      name: 'consent',
      title: 'Marketing Consent',
      type: 'boolean',
      description: 'Whether the lead opted in to marketing communications',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
  ],

  preview: {
    select: {
      email: 'email',
      name: 'name',
      company: 'company',
      sourceType: 'source.type',
      createdAt: 'createdAt',
    },
    prepare({ email, name, company, sourceType, createdAt }) {
      const subtitle = [
        company,
        sourceType,
        createdAt ? new Date(createdAt).toLocaleDateString() : null,
      ]
        .filter(Boolean)
        .join(' · ');

      return {
        title: name || email,
        subtitle,
      };
    },
  },

  orderings: [
    {
      title: 'Newest First',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      title: 'Email',
      name: 'emailAsc',
      by: [{ field: 'email', direction: 'asc' }],
    },
  ],
});
