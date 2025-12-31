/**
 * Breadcrumbs Module Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description Automatically generated breadcrumbs based on page structure.
 * @changelog
 * - 1.0.1: Added header documentation
 * - 1.0.0: Initial version
 */

import { MenuIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'breadcrumbs',
  title: 'Breadcrumbs',
  icon: MenuIcon,
  type: 'object',
  fields: [
    defineField({
      name: 'crumbs',
      title: 'Custom Breadcrumb Trail',
      type: 'array',
      of: [{ type: 'menuItem', initialValue: { type: 'internal' } }],
      description:
        'Optional parent pages to show before the current page. Leave empty to only show the current page title.',
    }),
    defineField({
      name: 'hideCurrent',
      title: 'Hide current page from trail',
      type: 'boolean',
      description: 'Only show parent pages in the breadcrumb, not the current page',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      crumbs: 'crumbs',
    },
    prepare: ({ crumbs }) => {
      const crumbCount = Array.isArray(crumbs) ? crumbs.length : 0;
      return {
        title:
          crumbCount === 0
            ? 'Current page'
            : `${crumbCount} crumb${crumbCount === 1 ? '' : 's'} + Current page`,
        subtitle: 'Breadcrumbs',
      };
    },
  },
});
