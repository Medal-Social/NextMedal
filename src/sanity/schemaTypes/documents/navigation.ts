/**
 * Navigation Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description Defines the structure for site navigation with menu items and links.
 * @changelog
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Initial version with menu structure and link management
 */

import { IoShareSocialOutline } from 'react-icons/io5';
import { VscLayoutMenubar, VscLayoutPanelLeft, VscMap } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';
import { count } from '@/lib/utils';

export default defineType({
  name: 'navigation',
  title: 'Navigation',
  icon: VscMap,
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'items',
      type: 'array',
      of: [{ type: 'menuItem' }, { type: 'dropdownMenu' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      items: 'items',
    },
    prepare: ({ title, items }) => {
      const t = title.toLowerCase();

      return {
        title,
        subtitle: count(items),
        media: t.includes('social')
          ? IoShareSocialOutline
          : t.includes('header')
            ? VscLayoutMenubar
            : t.includes('footer')
              ? VscLayoutPanelLeft
              : null,
      };
    },
  },
});
