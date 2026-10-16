/**
 * Flipbook Module Schema
 * @version 1.0.0
 * @lastUpdated 2026-10-16
 * @description A PDF shown as a page-turning flipbook. Deliberately two fields:
 * look, download, "Powered by" and start page come from code/site tokens.
 */

import { BookIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'flipbook',
  title: 'Flipbook',
  type: 'object',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'file',
      title: 'PDF',
      type: 'file',
      options: { accept: 'application/pdf' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      description: 'Optional. Uses the file name if empty.',
    }),
  ],
  preview: {
    select: { title: 'title', filename: 'file.asset.originalFilename' },
    prepare: ({ title, filename }) => ({
      title: (title as string) || (filename as string) || 'Flipbook',
      subtitle: 'Flipbook',
    }),
  },
});
