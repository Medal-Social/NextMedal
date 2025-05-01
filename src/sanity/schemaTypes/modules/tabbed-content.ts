/**
 * Tabbed Content Module Schema
 * @version 1.1.0
 * @lastUpdated 2024-03-27
 * @changelog
 * - 1.1.0: Updated tab content to only allow Featured Hero modules with strict validation
 * - 1.0.0: Initial version
 */

import { TfiLayoutTab } from 'react-icons/tfi';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'tabbedContent',
  title: 'Tabbed Content',
  icon: TfiLayoutTab,
  type: 'object',
  groups: [
    { name: 'tabs', title: 'Tabs', default: true },
    { name: 'options', title: 'Layout Options' },
  ],
  fields: [
    defineField({
      name: 'options',
      type: 'module-options',
      group: 'options',
    }),
    defineField({
      name: 'pretitle',
      type: 'string',
      description: 'Optional pretitle/badge text shown above the content',
      group: 'tabs',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      description: 'The first element becomes the title, the second becomes the subtitle',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'tabs',
    }),
    defineField({
      name: 'tabs',
      title: 'Tabs',
      description: 'Add tabs with content',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Tab',
          fields: [
            defineField({
              name: 'title',
              title: 'Tab Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'icon',
              title: 'Tab Icon',
              type: 'icon',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'content',
              title: 'Tab Content',
              description: 'Add a Featured Hero section to this tab',
              type: 'array',
              of: [{ type: 'featuredHero' }],
              validation: (Rule) =>
                Rule.required().length(1).error('Exactly one Featured Hero is required per tab'),
            }),
          ],
          preview: {
            select: {
              title: 'title',
              contentType: 'content.0._type',
              media: 'icon',
            },
            prepare: ({ title, contentType, media }) => {
              return {
                title: title || 'Untitled Tab',
                subtitle: contentType ? `Content type: ${contentType}` : 'No content',
                media,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1).error('At least one tab is required'),
      group: 'tabs',
    }),
  ],
  preview: {
    select: {
      content: 'content',
      pretitle: 'pretitle',
      tabs: 'tabs',
    },
    prepare: ({ content, pretitle, tabs = [] }) => {
      const title =
        content && content.length > 0 ? content[0].children?.[0]?.text : 'Tabbed Content';
      return {
        title: title || 'Tabbed Content',
        subtitle: `${tabs.length} tab${tabs.length === 1 ? '' : 's'}${pretitle ? ` | ${pretitle}` : ''}`,
        media: TfiLayoutTab,
      };
    },
  },
});
