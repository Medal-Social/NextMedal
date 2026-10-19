/**
 * Flipbook: a PDF shown as a page-turning book. Deliberately two fields:
 * look, download, "Powered by" and start page come from code/site tokens.
 */

import { BookIcon } from '@sanity/icons/Book';
import { defineField, defineType } from 'sanity';
import { blockPreview } from '../preview';

export default defineType({
  name: 'flipbook',
  title: 'Flipbook',
  description: 'A PDF shown as a book you can page through.',
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
      title: 'Title',
      type: 'string',
      description: 'Optional. Uses the file name if empty.',
    }),
  ],
  preview: blockPreview('Flipbook', { title: 'title', fallback: 'file.asset.originalFilename' }),
});
