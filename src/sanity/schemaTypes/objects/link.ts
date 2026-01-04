/**
 * Link Object Schema
 * @description Internal or external link with destination fields, used for Portable Text annotations.
 */

import { LinkIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { LinkAnnotationInput } from '../../components/LinkAnnotationInput';

export default defineType({
  name: 'link',
  title: 'Link',
  icon: LinkIcon,
  type: 'object',
  components: {
    input: LinkAnnotationInput,
  },
  fields: [
    defineField({
      name: 'type',
      title: 'Link Type',
      description: 'Choose where this link should point to',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          { title: 'Internal Page', value: 'internal' },
          { title: 'External Website', value: 'external' },
        ],
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'internal',
    }),
    defineField({
      name: 'internal',
      title: 'Internal Page',
      description: 'Select a page within this website',
      type: 'reference',
      to: [{ type: 'page' }, { type: 'collection.article' }],
      validation: (Rule) =>
        Rule.custom((value, context) => {
          // Only require if this is an internal link
          const parent = context.parent as { type?: string } | undefined;
          if (parent?.type === 'internal' && !value) {
            return 'Please select a page';
          }
          return true;
        }),
    }),
    defineField({
      name: 'external',
      title: 'External URL',
      description: 'Enter a link to an external website',
      placeholder: 'https://example.com',
      type: 'url',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https', 'mailto', 'tel'],
          allowRelative: true,
        }).custom((value, context) => {
          // Only require if this is an external link
          const parent = context.parent as { type?: string } | undefined;
          if (parent?.type === 'external' && !value) {
            return 'Please enter a URL';
          }
          return true;
        }),
    }),
  ],
});
