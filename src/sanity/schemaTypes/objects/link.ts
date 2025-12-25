/**
 * Link Object Schema
 * @description Internal or external link with destination fields, used for Portable Text annotations.
 */

import { VscLink } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'link',
  title: 'Link',
  icon: VscLink,
  type: 'object',
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
      to: [{ type: 'page' }, { type: 'blog.post' }],
      validation: (Rule) =>
        Rule.custom((value, context: any) => {
          // Only require if this is an internal link
          if (context.parent?.type === 'internal' && !value) {
            return 'Please select a page';
          }
          return true;
        }),
      hidden: ({ parent }) => parent?.type !== 'internal',
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
        }).custom((value, context: any) => {
          // Only require if this is an external link
          if (context.parent?.type === 'external' && !value) {
            return 'Please enter a URL';
          }
          return true;
        }),
      hidden: ({ parent }) => parent?.type !== 'external',
    }),
  ],
});
