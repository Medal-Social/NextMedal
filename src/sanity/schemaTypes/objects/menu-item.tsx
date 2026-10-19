/**
 * Menu Item Schema
 * @version 2.0.0
 * @lastUpdated 2025-12-31
 * @description Simplified navigation link with clear conditional fields based on link type.
 * @changelog
 * - 2.0.0: Simplified UX with clearer field descriptions and better organization
 * - 1.5.1: Updated header documentation
 * - 1.5.0: Renamed from Link to Menu Item
 * - 1.4.0: Grouped destination fields, renamed label to Text, improved helper text
 */

import { LinkIcon } from '@sanity/icons/Link';
import { defineField, defineType } from 'sanity';
import resolveSlug from '@/sanity/lib/resolveSlug';
import { MenuItemInput } from '../../components/MenuItemInput';

export default defineType({
  name: 'menuItem',
  title: 'Link',
  icon: LinkIcon,
  type: 'object',
  components: {
    input: MenuItemInput,
  },
  description: 'A link to a page on this site or to another website.',
  fieldsets: [
    {
      name: 'destination',
      title: 'Where it goes',
      options: { collapsible: false },
    },
    {
      name: 'advanced',
      title: 'More',
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: 'label',
      title: 'Text',
      description: 'The words people click.',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Link to',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          { title: 'Page on this site', value: 'internal' },
          { title: 'Other website', value: 'external' },
        ],
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'internal',
      fieldset: 'destination',
    }),
    defineField({
      name: 'internal',
      title: 'Page',
      type: 'reference',
      to: [{ type: 'page' }, { type: 'collection.article' }],
      validation: (Rule) =>
        Rule.custom((value, context) => {
          // Only require if this is an internal link
          const parent = context.parent as { type?: string } | undefined;
          if (parent?.type === 'internal' && !value) {
            return 'Please select a page';
          }
          return true;
        }),
      fieldset: 'destination',
    }),
    defineField({
      name: 'external',
      title: 'Web address',
      placeholder: 'https://example.com',
      type: 'url',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https', 'mailto', 'tel'],
          allowRelative: true,
        }).custom((value, context) => {
          // Only require if this is an external link
          const parent = context.parent as { type?: string } | undefined;
          if (parent?.type === 'external' && !value) {
            return 'Please enter a URL';
          }
          return true;
        }),
      fieldset: 'destination',
    }),
    defineField({
      name: 'params',
      title: 'Section (optional)',
      description: 'Go straight to a section of the page, e.g. features or pricing.',
      placeholder: 'e.g., pricing, contact, features',
      type: 'string',
      validation: (Rule) =>
        Rule.custom((value) => {
          // Allow empty/undefined (field is optional)
          if (!value) return true;

          // Extract the anchor content (remove # if present)
          const anchorContent = value.startsWith('#') ? value.slice(1) : value;

          // Must have content
          if (anchorContent.length === 0) {
            return 'Please name the section';
          }

          // Must be valid HTML ID format (alphanumeric, hyphens, underscores)
          if (!/^[a-zA-Z0-9_-]+$/.test(anchorContent)) {
            return 'Use only letters, numbers, - and _';
          }

          return true;
        }),
      fieldset: 'destination',
    }),
    defineField({
      name: 'newTab',
      title: 'Open in new tab',
      description: 'Opens the link in a new browser tab.',
      type: 'boolean',
      initialValue: false,
      fieldset: 'advanced',
    }),
  ],
  preview: {
    select: {
      label: 'label',
      _type: 'internal._type',
      title: 'internal.title',
      pageName: 'internal.metadata.title',
      internal: 'internal.metadata.slug.current',
      params: 'params',
      external: 'external',
    },
    prepare: ({ label, title, pageName, _type, internal, params, external }) => {
      const _resolvedUrl = resolveSlug({ _type, internal, params, external });
      const linkType = external ? 'Other website' : 'Page on this site';
      const name = title || pageName;
      const destination = external || name || internal || 'No page chosen';

      return {
        title: label || name || 'Link',
        subtitle: `${linkType} → ${destination}`,
        media: LinkIcon,
      };
    },
  },
});
