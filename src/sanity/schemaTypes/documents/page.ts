/**
 * Page Schema
 * @version 1.2.0
 * @lastUpdated 2025-12-23
 * @description Defines the structure for content pages with modular sections and metadata.
 * @changelog
 * - 1.2.0: Updated to latest standards and standardized icons
 * - 1.1.0: Added improved validation, documentation, and organization
 * - 1.0.0: Initial version
 */

import {
  DocumentIcon,
  EditIcon,
  EyeClosedIcon,
  HelpCircleIcon,
  HomeIcon,
  SearchIcon,
} from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import modules from '../fragments/modules';

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  description: 'Standard page with modules for building content',
  groups: [
    { name: 'content', title: 'Content', icon: EditIcon, default: true },
    { name: 'metadata', title: 'SEO & Metadata', icon: SearchIcon },
  ],
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
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
      language: 'language',
    },
    prepare: ({ title, slug, media, noindex, language }) => {
      // Choose an appropriate icon based on the page type
      const icon =
        media ||
        (slug === 'index' && HomeIcon) ||
        (slug === '404' && HelpCircleIcon) ||
        (slug === 'search' && SearchIcon) ||
        (slug === 'blog' && EditIcon) ||
        (noindex && EyeClosedIcon) ||
        DocumentIcon;

      // Format language display
      const languageLabel =
        language === 'en' ? '🇺🇸 EN' : language === 'nb' ? '🇳🇴 NO' : language?.toUpperCase();

      // Build subtitle with language and slug
      const urlPath = slug === 'index' ? '/' : `/${slug}`;
      const subtitle = language ? `${languageLabel} • ${urlPath}` : urlPath;

      return {
        title: title || 'Untitled Page',
        subtitle,
        media: icon,
      };
    },
  },
});
