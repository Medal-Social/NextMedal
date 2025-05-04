import { count } from '@/lib/utils';
import { VscFolderOpened } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'link.categories',
  title: 'Link categories',
  icon: VscFolderOpened,
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'categories',
      type: 'array',
      of: [{ type: 'link.categories.list' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      categories: 'categories',
    },
    prepare: ({ title, categories }) => ({
      title: title,
      subtitle: count(categories, 'category', 'categories'),
    }),
  },
});
