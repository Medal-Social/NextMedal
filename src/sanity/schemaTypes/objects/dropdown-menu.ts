/**
 * Drop Down Menu Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description A list of links with a category title, used for dropdown menus.
 * @changelog
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Renamed from Link List to Drop Down Menu
 */

import { FolderIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { count } from '@/lib/utils/index';

export default defineType({
  name: 'dropdownMenu',
  title: 'Dropdown Menu',
  icon: FolderIcon,
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
