/**
 * Article list: all articles, newest first, with topic filters. No editor
 * fields: featured first, filters, page size and the RSS link come from
 * blockDesign (Vault spec 2026-10-18 D2, plan C13). The page holding this
 * block is the articles collection index.
 */

import { DocumentsIcon } from '@sanity/icons/Documents';
import { defineField, defineType } from 'sanity';
import { blockPreview } from '../preview';

export default defineType({
  name: 'articles-frontpage',
  title: 'Article list',
  description: 'All articles, newest first, with topic filters.',
  icon: DocumentsIcon,
  type: 'object',
  // Sanity needs one field on an object type. Hidden: nothing to fill in, nothing stored.
  fields: [defineField({ name: 'list', title: 'List', type: 'string', hidden: true })],
  preview: blockPreview('Article list'),
});
