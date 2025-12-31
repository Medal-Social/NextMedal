/**
 * Contact Module Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description Standard contact module with reusable form support and contact details.
 * @changelog
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Initial version
 */

import { EnvelopeIcon, PinIcon, UserIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'contact',
  title: 'Contact',
  icon: EnvelopeIcon,
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'details', title: 'Contact Details' },
    { name: 'options', title: 'Advanced Options' },
  ],
  fields: [
    defineField({
      name: 'options',
      type: 'module-options',
      group: 'options',
    }),
    defineField({
      name: 'intro',
      title: 'Introduction',
      description: 'Text shown at the top of the contact section',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content',
    }),
    defineField({
      name: 'form',
      title: 'Form',
      description: 'Select the form document to display',
      type: 'reference',
      to: [{ type: 'form' }],
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'officeInfo',
      title: 'Office Information',
      type: 'object',
      group: 'details',
      icon: PinIcon,
      fields: [
        defineField({
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'Our Office',
        }),
        defineField({
          name: 'address',
          title: 'Address',
          type: 'object',
          fields: [
            defineField({ name: 'street', type: 'string' }),
            defineField({ name: 'city', type: 'string' }),
            defineField({ name: 'country', type: 'string' }),
          ],
        }),
        defineField({ name: 'email', type: 'string' }),
        defineField({ name: 'phone', type: 'string' }),
        defineField({ name: 'openingHours', type: 'string' }),
      ],
    }),
    defineField({
      name: 'contactPerson',
      title: 'Contact Person',
      type: 'object',
      group: 'details',
      icon: UserIcon,
      fields: [
        defineField({
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'Direct Contact',
        }),
        defineField({ name: 'name', type: 'string' }),
        defineField({ name: 'position', type: 'string' }),
        defineField({ name: 'description', type: 'text', rows: 2 }),
        defineField({ name: 'image', type: 'img' }),
        defineField({ name: 'email', type: 'string' }),
        defineField({ name: 'phone', type: 'string' }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'intro',
      formTitle: 'form.title',
    },
    prepare({ title, formTitle }) {
      return {
        title: title ? 'Contact Section' : 'Untitled Contact Section',
        subtitle: formTitle ? `Form: ${formTitle}` : 'No form selected',
        media: EnvelopeIcon,
      };
    },
  },
});
