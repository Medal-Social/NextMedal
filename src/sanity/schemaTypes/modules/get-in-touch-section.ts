/**
 * Get In Touch Section Module Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description A comprehensive contact section with a form, office info, and contact person details.
 * @changelog
 * - 1.0.1: Added header documentation
 * - 1.0.0: Initial version
 */

import { EnvelopeIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { createUidField } from './uid-input';

export default defineType({
  name: 'get-in-touch-section',
  title: 'Get In Touch Section',
  icon: EnvelopeIcon,
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'form', title: 'Form' },
    { name: 'contact', title: 'Contact Details' },
    { name: 'options', title: 'Options' },
  ],
  fields: [
    defineField({
      name: 'options',
      type: 'object',
      title: 'Advanced Options',
      group: 'options',
      fields: [createUidField()],
    }),
    defineField({
      name: 'title',
      title: 'Main Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text',
      rows: 2,
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'formTitle',
      title: 'Form Title',
      type: 'string',
      group: 'form',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'form',
      title: 'Form',
      description: 'Select a form document to display',
      type: 'reference',
      to: [{ type: 'form' }],
      group: 'form',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'officeInfo',
      title: 'Office Information',
      type: 'object',
      group: 'contact',
      fields: [
        defineField({
          name: 'title',
          title: 'Office Section Title',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'address',
          title: 'Address',
          type: 'object',
          fields: [
            defineField({
              name: 'street',
              title: 'Street',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'city',
              title: 'City',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'country',
              title: 'Country',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
        defineField({
          name: 'email',
          title: 'Email',
          type: 'string',
          validation: (Rule) => Rule.email(),
        }),
        defineField({
          name: 'phone',
          title: 'Phone',
          type: 'string',
        }),
        defineField({
          name: 'openingHours',
          title: 'Opening Hours',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'contactPerson',
      title: 'Contact Person',
      type: 'object',
      group: 'contact',
      fields: [
        defineField({
          name: 'title',
          title: 'Contact Person Section Title',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'name',
          title: 'Name',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'position',
          title: 'Position',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'description',
          title: 'Description',
          type: 'text',
          rows: 3,
        }),
        defineField({
          name: 'image',
          title: 'Profile Image',
          type: 'img',
        }),
        defineField({
          name: 'email',
          title: 'Email',
          type: 'string',
          validation: (Rule) => Rule.email(),
        }),
        defineField({
          name: 'phone',
          title: 'Phone',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'theme',
      title: 'Theme',
      type: 'string',
      group: 'options',
      options: {
        list: [
          { title: 'Light', value: 'light' },
          { title: 'Dark', value: 'dark' },
          { title: 'Auto', value: 'auto' },
        ],
      },
      initialValue: 'light',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      formFields: 'formFields',
    },
    prepare({ title, formFields }) {
      const fieldCount = formFields?.length || 0;
      return {
        title: title || 'Get In Touch Section',
        subtitle: `${fieldCount} form field${fieldCount !== 1 ? 's' : ''}`,
        media: EnvelopeIcon,
      };
    },
  },
});
