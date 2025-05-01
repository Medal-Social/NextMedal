import { count } from '@/lib/utils';
import { VscFolderOpened } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'link.categories.list',
  title: 'Link categories list',
  icon: VscFolderOpened,
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'links',
      type: 'array',
      of: [{ type: 'link' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      links: 'links',
    },
    prepare: ({ title, links }) => ({
      title: title,
      subtitle: count(links, 'link'),
    }),
  },
});
