/**
 * Form Schema
 * @version 3.0.0
 * @lastUpdated 2026-01-03
 * @description Simplified form schema with localized fields and i18n-based UI text.
 * @changelog
 * - 3.0.0: Major simplification - removed templates, localized fields, simplified consent, removed redirects
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
        'The title shown to the user on the form and used for identification in the studio - localized per language',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'intent',
      title: 'Form Intent',
      description: 'How should this form submission be processed?',
      type: 'string',
      options: {
        list: [
          { title: 'Contact / Lead Generation', value: 'contact' },
          { title: 'Newsletter Subscription', value: 'newsletter' },
          { title: 'Event Registration', value: 'event' },
          { title: 'Resource Download', value: 'download' },
        ],
        layout: 'radio',
      },
      initialValue: 'contact',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'fields',
      title: 'Form Fields',
      description: 'Add and configure form fields with localized labels and placeholders.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'form-field',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'internationalizedArrayString',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'name',
              title: 'Field Name (API)',
              description: 'The key used when submitting the data. Use "email", "name", etc.',
              type: 'slug',
              options: {
                source: (doc) => {
                  const label = doc?.label;
                  if (Array.isArray(label) && label.length > 0) {
                    return label[0].value || '';
                  }
                  return '';
                },
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
              type: 'internationalizedArrayString',
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
              label: 'label',
              type: 'type',
            },
            prepare({ label, type }) {
              const labelText =
                Array.isArray(label) && label.length > 0 ? label[0].value : 'Untitled Field';
              return {
                title: labelText,
                subtitle: type,
              };
            },
          },
        }),
      ],
      initialValue: [
        {
          _type: 'form-field',
          _key: 'name-field',
          label: [
            { _key: 'en', value: 'Name' },
            { _key: 'nb', value: 'Navn' },
            { _key: 'ar', value: 'الاسم' },
          ],
          name: { _type: 'slug', current: 'name' },
          type: 'text',
          placeholder: [
            { _key: 'en', value: 'Your name' },
            { _key: 'nb', value: 'Ditt navn' },
            { _key: 'ar', value: 'اسمك' },
          ],
          required: true,
        },
        {
          _type: 'form-field',
          _key: 'email-field',
          label: [
            { _key: 'en', value: 'Email' },
            { _key: 'nb', value: 'E-post' },
            { _key: 'ar', value: 'البريد الإلكتروني' },
          ],
          name: { _type: 'slug', current: 'email' },
          type: 'email',
          placeholder: [
            { _key: 'en', value: 'your@email.com' },
            { _key: 'nb', value: 'din@epost.no' },
            { _key: 'ar', value: 'email@example.com' },
          ],
          required: true,
        },
        {
          _type: 'form-field',
          _key: 'phone-field',
          label: [
            { _key: 'en', value: 'Phone' },
            { _key: 'nb', value: 'Telefon' },
            { _key: 'ar', value: 'الهاتف' },
          ],
          name: { _type: 'slug', current: 'phone' },
          type: 'tel',
          placeholder: [
            { _key: 'en', value: 'Your phone number' },
            { _key: 'nb', value: 'Ditt telefonnummer' },
            { _key: 'ar', value: 'رقم هاتفك' },
          ],
          required: false,
        },
        {
          _type: 'form-field',
          _key: 'message-field',
          label: [
            { _key: 'en', value: 'Message' },
            { _key: 'nb', value: 'Melding' },
            { _key: 'ar', value: 'الرسالة' },
          ],
          name: { _type: 'slug', current: 'message' },
          type: 'textarea',
          placeholder: [
            { _key: 'en', value: 'Your message' },
            { _key: 'nb', value: 'Din melding' },
            { _key: 'ar', value: 'رسالتك' },
          ],
          required: false,
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'requireConsent',
      title: 'Require Privacy Consent?',
      description:
        'If enabled, users must accept the privacy policy before submitting. Consent text comes from translation files.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'formTitle',
      intent: 'intent',
    },
    prepare({ title, intent }) {
      // Extract first available language value from internationalized array
      const titleText =
        Array.isArray(title) && title.length > 0
          ? title[0].value || 'Untitled Form'
          : 'Untitled Form';

      const intentLabels = {
        contact: '📧 Contact',
        newsletter: '📰 Newsletter',
        event: '🎫 Event',
        download: '📥 Download',
      };
      return {
        title: titleText,
        subtitle: intentLabels[intent as keyof typeof intentLabels] || intent,
      };
    },
  },
});
