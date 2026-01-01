/**
 * Form Schema
 * @version 2.0.0
 * @lastUpdated 2025-12-31
 * @description Simplified form schema with pre-built templates for common use cases.
 * @changelog
 * - 2.0.0: Added template selector with 3 pre-configured forms (Contact, Newsletter, Event)
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
      name: 'template',
      title: 'Form Template',
      description:
        'Select a pre-configured form template. This auto-populates fields with sensible defaults.',
      type: 'string',
      options: {
        list: [
          {
            title: '📧 Contact Form',
            value: 'contact',
          },
          {
            title: '📰 Newsletter Signup',
            value: 'newsletter',
          },
          {
            title: '🎫 Event Registration',
            value: 'event',
          },
        ],
        layout: 'radio',
      },
      initialValue: 'contact',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'intent',
      title: 'Intent',
      description: 'How the form data should be processed (auto-set based on template)',
      type: 'string',
      options: {
        list: [
          { title: 'Lead Generation', value: 'lead' },
          { title: 'Newsletter Subscription', value: 'newsletter' },
          { title: 'Event Registration', value: 'event' },
        ],
      },
      readOnly: true,
      hidden: ({ parent }) => !parent?.template,
    }),
    defineField({
      name: 'fields',
      title: 'Form Fields (Auto-configured)',
      description:
        'Fields are automatically configured based on the selected template. Advanced: expand to customize field configuration.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'form-field',
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
      initialValue: [
        {
          _type: 'form-field',
          _key: 'name-field',
          label: 'Name',
          name: { _type: 'slug', current: 'name' },
          type: 'text',
          placeholder: 'Your name',
          required: true,
        },
        {
          _type: 'form-field',
          _key: 'email-field',
          label: 'Email',
          name: { _type: 'slug', current: 'email' },
          type: 'email',
          placeholder: 'your@email.com',
          required: true,
        },
        {
          _type: 'form-field',
          _key: 'phone-field',
          label: 'Phone',
          name: { _type: 'slug', current: 'phone' },
          type: 'tel',
          placeholder: 'Your phone number',
          required: false,
        },
        {
          _type: 'form-field',
          _key: 'message-field',
          label: 'Message',
          name: { _type: 'slug', current: 'message' },
          type: 'textarea',
          placeholder: 'Your message',
          required: false,
        },
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
      template: 'template',
    },
    prepare({ title, template }) {
      const templateLabels = {
        contact: '📧 Contact Form',
        newsletter: '📰 Newsletter Signup',
        event: '🎫 Event Registration',
      };
      return {
        title: title || 'Untitled Form',
        subtitle: templateLabels[template as keyof typeof templateLabels] || template,
      };
    },
  },
});
