/**
 * Navigation Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description Defines the structure for site navigation with menu items and links.
 * @changelog
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Initial version with menu structure and link management
 */

import { EarthGlobeIcon, MasterDetailIcon, MenuIcon, UsersIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { count } from '@/lib/utils/index';

export default defineType({
  name: 'navigation',
  title: 'Navigation',
  icon: EarthGlobeIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Menu Name',
      type: 'string',
      description:
        'Internal name to identify this navigation menu (e.g., "Header Navigation", "Footer Links", "Social Links")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Menu Items',
      type: 'array',
      description: 'Links and dropdown menus that appear in this navigation',
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
          ? UsersIcon
          : t.includes('header')
            ? MenuIcon
            : t.includes('footer')
              ? MasterDetailIcon
              : null,
      };
    },
  },
});
