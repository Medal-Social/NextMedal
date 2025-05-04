/**
 * Page Schema
 * @version 1.1.0
 * @lastUpdated 2024-03-13
 * @description Defines the structure for content pages with modular sections and metadata.
 * @changelog
 * - 1.1.0: Added improved validation, documentation, and organization
 * - 1.0.0: Initial version
 */

import {
  VscEdit,
  VscEyeClosed,
  VscFile,
  VscHome,
  VscMortarBoard,
  VscQuestion,
  VscSearch,
} from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';
import modules from '../fragments/modules';

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: VscFile,
  description: 'Standard page with modules for building content',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'metadata', title: 'SEO & Metadata' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      description: 'The main title of the page',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      ...modules,
      title: 'Page Content',
      description: 'Add content modules to build the page',
      group: 'content',
    }),
    defineField({
      name: 'metadata',
      title: 'SEO & Metadata',
      description: 'Search engine optimization settings',
      type: 'metadata',
      group: 'metadata',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'metadata.slug.current',
      media: 'metadata.image',
      noindex: 'metadata.noIndex',
    },
    prepare: ({ title, slug, media, noindex }) => {
      // Choose an appropriate icon based on the page type
      const icon =
        media ||
        (slug === 'index' && VscHome) ||
        (slug === '404' && VscQuestion) ||
        (slug === 'search' && VscSearch) ||
        (slug === 'blog' && VscEdit) ||
        (slug?.startsWith('docs') && VscMortarBoard) ||
        (noindex && VscEyeClosed) ||
        VscFile;

      return {
        title: title || 'Untitled Page',
        subtitle: slug ? (slug === 'index' ? '/' : `/${slug}`) : '(No URL path)',
        media: icon,
      };
    },
  },
});
