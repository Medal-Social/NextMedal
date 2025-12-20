import { VscSymbolMisc } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';
import { createUidField } from './uid-input';

export default defineType({
  name: 'logo-list',
  title: 'Logo Cloud',
  icon: VscSymbolMisc,
  type: 'object',
  groups: [{ name: 'content', default: true }, { name: 'options' }],
  fields: [
    defineField({
      name: 'options',
      type: 'object',
      title: 'Options',
      group: 'options',
      fields: [createUidField()],
    }),
    defineField({
      name: 'pretitle',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'intro',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content',
    }),
    defineField({
      name: 'logos',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'logo' }] }],
      description: 'Leave empty to display all logos',
      group: 'content',
    }),
    defineField({
      name: 'logoType',
      type: 'string',
      options: {
        layout: 'radio',
        list: ['default', 'light', 'dark'],
      },
      initialValue: 'default',
      group: 'options',
    }),
  ],
  preview: {
    select: {
      pretitle: 'pretitle',
      intro: 'intro',
    },
    prepare: ({ pretitle, intro }) => ({
      title: getBlockText(intro) || pretitle,
      subtitle: 'Logo Cloud',
    }),
  },
});
