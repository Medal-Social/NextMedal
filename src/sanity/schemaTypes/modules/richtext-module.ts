import { getBlockText } from '@/sanity/lib/utils';
import { VscSymbolKeyword } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';
import { admonition, imageBlock } from '../fragments';

export default defineType({
  name: 'richtext-module',
  title: 'Richtext module',
  icon: VscSymbolKeyword,
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'options', title: 'Options' },
  ],
  fields: [
    defineField({
      name: 'options',
      type: 'module-options',
      group: 'options',
    }),
    defineField({
      name: 'content',
      type: 'array',
      of: [{ type: 'block' }, imageBlock, admonition],
      group: 'content',
    }),
    defineField({
      name: 'tableOfContents',
      type: 'boolean',
      initialValue: false,
      group: 'options',
    }),
    defineField({
      name: 'tocPosition',
      type: 'string',
      options: {
        list: ['left', 'right'],
        layout: 'radio',
      },
      hidden: ({ parent }) => !parent.tableOfContents,
      initialValue: 'right',
      group: 'options',
    }),
    defineField({
      name: 'stretch',
      type: 'boolean',
      initialValue: false,
      hidden: ({ parent }) => parent.tableOfContents,
      group: 'options',
    }),
  ],
  preview: {
    select: {
      content: 'content',
    },
    prepare: ({ content }) => ({
      title: getBlockText(content),
      subtitle: 'Richtext module',
    }),
  },
});
