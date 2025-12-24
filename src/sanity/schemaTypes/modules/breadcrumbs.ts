/**
 * Breadcrumbs Module Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description Automatically generated breadcrumbs based on page structure.
 * @changelog
 * - 1.0.1: Added header documentation
 * - 1.0.0: Initial version
 */

import { BsBarChartSteps } from 'react-icons/bs';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'breadcrumbs',
  title: 'Breadcrumbs',
  icon: BsBarChartSteps,
  type: 'object',
  fields: [
    defineField({
      name: 'crumbs',
      type: 'array',
      of: [{ type: 'menuItem', initialValue: { type: 'internal' } }],
      description: 'Current page is automatically included',
    }),
    defineField({
      name: 'hideCurrent',
      title: 'Hide current page',
      type: 'boolean',
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
