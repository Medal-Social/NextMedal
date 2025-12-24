/**
 * Form Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description Defines the structure for forms, including fields, intents, and submission settings.
 * @changelog
 * - 1.0.1: Added header documentation
 * - 1.0.0: Initial version
 */

import { EnvelopeIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'form',
  title: 'Form',
  icon: EnvelopeIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'formTitle',
      title: 'Form Title',
      description:
        'The title shown to the user on the form and used for identification in the studio',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'intent',
      title: 'Intent',
      description: 'How the form data should be processed (e.g., lead, newsletter, download)',
      type: 'string',
      options: {
        list: [
          { title: 'Lead Generation', value: 'lead' },
          { title: 'Newsletter Subscription', value: 'newsletter' },
          { title: 'Resource Download', value: 'download' },
        ],
      },
      initialValue: 'lead',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'fields',
      title: 'Form Fields',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'name',
              title: 'Field Name (API)',
              description: 'The key used when submitting the data. Use "email", "name", etc.',
              type: 'slug',
              options: {
                source: 'label',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'type',
              title: 'Field Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Text', value: 'text' },
                  { title: 'Email', value: 'email' },
                  { title: 'Phone', value: 'tel' },
                  { title: 'Text Area', value: 'textarea' },
                  { title: 'Checkbox', value: 'checkbox' },
                ],
              },
              initialValue: 'text',
            }),
            defineField({
              name: 'placeholder',
              title: 'Placeholder',
              type: 'string',
            }),
            defineField({
              name: 'required',
              title: 'Required?',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'type',
            },
          },
        }),
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'acceptance',
      title: 'Acceptance / Consent',
      type: 'object',
      description: 'Require users to agree to terms or privacy policy',
      fields: [
        defineField({
          name: 'required',
          title: 'Is Required?',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'text',
          title: 'Checkbox Text',
          description: 'e.g. "I agree to the privacy policy"',
          type: 'string',
        }),
        defineField({
          name: 'link',
          title: 'Link (Optional)',
          description: 'Link to privacy policy or terms',
          type: 'menuItem',
        }),
      ],
    }),
    defineField({
      name: 'submitButtonText',
      title: 'Submit Button Text',
      type: 'string',
      initialValue: 'Submit',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'successMessage',
      title: 'Success Message',
      description: 'Message shown after successful submission',
      type: 'array',
      of: [{ type: 'block' }],
      initialValue: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'Thank you! We have received your submission and will get back to you shortly.',
            },
          ],
          markDefs: [],
          style: 'normal',
        },
      ],
    }),
    defineField({
      name: 'redirect',
      title: 'Redirect after submission',
      description: 'Optional destination to redirect the user to after a successful submission',
      type: 'menuItem',
    }),
  ],
  preview: {
    select: {
      title: 'formTitle',
      intent: 'intent',
    },
    prepare({ title, intent }) {
      return {
        title: title || 'Untitled Form',
        subtitle: `Intent: ${intent}`,
      };
    },
  },
});
