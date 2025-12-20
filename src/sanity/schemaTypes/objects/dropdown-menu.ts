/**
 * Drop Down Menu Schema
 * @version 1.0.0
 * @lastUpdated 2024-03-22
 * @description A list of links with a category title, used for dropdown menus.
 * @changelog
 * - 1.0.0: Renamed from Link List to Drop Down Menu
 */

import { VscFolderOpened } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';
import { count } from '@/lib/utils';

export default defineType({
  name: 'dropdownMenu',
  title: 'Drop Down Menu',
  icon: VscFolderOpened,
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Category Name',
      description: 'Title for this group of links.',
      type: 'string',
    }),
    defineField({
      name: 'links',
      title: 'Menu Links',
      description: 'List of links in this category.',
      type: 'array',
      of: [{ type: 'menuItem' }],
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





