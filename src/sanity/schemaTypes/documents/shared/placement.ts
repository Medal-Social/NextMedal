/**
 * Placement Rule Schema
 * @version 1.0.0
 * @lastUpdated 2024-12-23
 * @description Defines rules for placing global content modules in specific layout slots based on content scope.
 */

import { InsertAboveIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'placement',
  title: 'Placement Rule',
  type: 'document',
  icon: InsertAboveIcon,
  fields: [
    defineField({
      name: 'scope',
      title: 'Apply to',
      type: 'string',
      description: 'Choose the content type this rule applies to.',
      options: {
        list: [
          { title: 'Articles', value: 'articles-frontpage' },
          { title: 'Changelog', value: 'changelog-frontpage' },
          { title: 'Documentation', value: 'docs-frontpage' },
          { title: 'Newsletter', value: 'newsletter-frontpage' },
          { title: 'All Pages', value: 'page' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Where should this content appear?',
      options: {
        list: [
          { title: 'Sidebar (Right)', value: 'sidebar' },
          { title: 'In-Content (Injection)', value: 'injection' },
          { title: 'Bottom (Footer)', value: 'bottom' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'injectionConfig',
      title: 'Injection Settings',
      type: 'object',
      hidden: ({ parent }) => parent?.location !== 'injection',
      fields: [
        defineField({
          name: 'afterParagraph',
          title: 'Insert after paragraph number',
          type: 'number',
          initialValue: 3,
          validation: (Rule) => Rule.min(1).integer(),
        }),
      ],
    }),
    defineField({
      name: 'modules',
      title: 'Content Modules',
      description: 'The modules to display in this placement.',
      type: 'array',
      of: [{ type: 'lead-magnet' }, { type: 'callout' }, { type: 'latest-articles' }],
    }),
  ],
  preview: {
    select: {
      scope: 'scope',
      location: 'location',
      modules: 'modules',
    },
    prepare: ({ scope, location, modules }) => {
      const scopeMap: Record<string, string> = {
        'articles-frontpage': 'Articles',
        'changelog-frontpage': 'Changelog',
        'docs-frontpage': 'Documentation',
        'newsletter-frontpage': 'Newsletter',
        page: 'Pages',
      };
      const locationMap: Record<string, string> = {
        sidebar: 'Sidebar',
        injection: 'Injection',
        bottom: 'Bottom',
      };
      const moduleCount = modules?.length || 0;

      return {
        title: `${scopeMap[scope] || scope} • ${locationMap[location] || location}`,
        subtitle: `${moduleCount} module${moduleCount === 1 ? '' : 's'}`,
        media: InsertAboveIcon,
      };
    },
  },
});
