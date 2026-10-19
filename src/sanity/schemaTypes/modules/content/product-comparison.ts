/**
 * Product Comparison Module Schema
 * @version 2.0.0
 * @lastUpdated 2025-12-23
 * @description A comparison table for products/features with customizable details for each cell.
 * @changelog
 * - 3.0.0: Lean — no anchor option; plain labels
 * - 2.0.0: Title and Text replace the positional intro (h2 + paragraphs)
 * - 1.3.1: Updated header documentation
 * - 1.3.0: Fixed validation logic to properly access parent module
 * - 1.2.0: Updated field descriptions for improved UX and clarity
 * - 1.1.0: Removed options field and options group for simplified schema
 * - 1.0.0: Initial version with basic comparison functionality
 */

import { LinkIcon } from '@sanity/icons/Link';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { richTextField } from '../../fragments/rich-text';
import { blockPreview } from '../preview';

export default defineType({
  name: 'product-comparison',
  title: 'Comparison table',
  description: 'A table that compares products or plans, feature by feature.',
  icon: LinkIcon,
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    richTextField('text', 'Text', 'plain', { description: 'Shown under the title.' }),
    // Old positional intro (h2 + paragraphs): shown read-only only while it has
    // content. The lean-schema migration moves it to Title and Text; Task 35 deletes it.
    defineField({
      ...richTextField('intro', 'Intro', 'section', {
        description: 'Old intro — move it into Title and Text.',
      }),
      hidden: ({ value }) => !value,
      readOnly: true,
      deprecated: { reason: 'Moved to Title and Text by the lean-schema migration.' },
    }),
    defineField({
      name: 'products',
      title: 'Columns',
      description: 'The products or plans, one column each.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'comparison-product',
          type: 'object',
          title: 'Column',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'highlight',
              title: 'Highlight this column',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: { name: 'name', highlight: 'highlight' },
            prepare: ({ name, highlight }) => ({
              title: name,
              subtitle: highlight ? 'Highlighted' : undefined,
            }),
          },
        }),
      ],
      validation: (Rule) => Rule.min(1).error('Add at least one column'),
    }),
    defineField({
      name: 'features',
      title: 'Rows',
      description: 'One row per feature, with a value for each column.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'comparison-feature-row',
          type: 'object',
          title: 'Row',
          fields: [
            defineField({
              name: 'name',
              title: 'Feature',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'featureDetails',
              title: 'Values',
              description: 'One value per column, in the same order.',
              type: 'array',
              of: [defineArrayMember({ type: 'string', title: 'Value' })],
            }),
          ],
          preview: {
            select: { name: 'name' },
            prepare: ({ name }) => ({ title: name }),
          },
        }),
      ],
      validation: (Rule) => Rule.min(1).error('Add at least one row'),
    }),
  ],
  preview: blockPreview('Comparison table', { title: 'title' }),
});
