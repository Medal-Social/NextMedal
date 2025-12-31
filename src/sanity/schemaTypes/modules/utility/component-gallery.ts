/**
 * Component Gallery Module Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description A visual gallery of all available UI components for demonstration and testing.
 * @changelog
 * - 1.0.1: Added header documentation
 * - 1.0.0: Initial version
 */

import { ImagesIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'component-gallery',
  title: 'Component Gallery',
  icon: ImagesIcon,
  type: 'object',
  fields: [
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 1', value: 'h1' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Heading 4', value: 'h4' },
          ],
          lists: [], // Disable lists
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'groups',
      title: 'Component Groups',
      type: 'array',
      of: [
        {
          name: 'component-group',
          type: 'object',
          title: 'Group',
          fields: [
            defineField({
              name: 'title',
              title: 'Group Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'items',
              title: 'Items',
              description: 'Add modules to this group. The module type will be used as the title.',
              type: 'array',
              of: [
                { type: 'videoHero' },
                { type: 'hero' },
                { type: 'accordion-list' },
                { type: 'features' },
                { type: 'callout' },
                { type: 'richtext' },
                { type: 'logo-cloud' },
                { type: 'team' },
                { type: 'pricing-list' },
                { type: 'product-comparison' },
                { type: 'latest-articles' },
                { type: 'breadcrumbs' },
                { type: 'component-gallery' },
              ],
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      groupCount: 'groups.length',
    },
    prepare({ groupCount }) {
      return {
        title: 'Component Gallery',
        subtitle: `${groupCount || 0} group${groupCount === 1 ? '' : 's'}`,
        media: ImagesIcon,
      };
    },
  },
});
