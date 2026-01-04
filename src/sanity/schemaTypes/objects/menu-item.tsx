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

import { LinkIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import resolveSlug from '@/sanity/lib/resolveSlug';
import { MenuItemInput } from '../../components/MenuItemInput';

export default defineType({
  name: 'menuItem',
  title: 'Menu Item',
  icon: LinkIcon,
  type: 'object',
  components: {
    input: MenuItemInput,
  },
  description: 'Internal or external link with optional icon and label',
  fieldsets: [
    {
      name: 'destination',
      title: 'Destination',
      options: { collapsible: false },
    },
    {
      name: 'advanced',
      title: 'Advanced Options',
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: 'label',
      title: 'Text',
      description: 'The text that will be displayed for this link',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Link Type',
      description: 'Choose where this link should point to',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          { title: 'Internal Page', value: 'internal' },
          { title: 'External Website', value: 'external' },
        ],
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'internal',
      fieldset: 'destination',
    }),
    defineField({
      name: 'internal',
      title: 'Internal Page',
      description: 'Select a page within this website',
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
      title: 'External URL',
      description: 'Enter a link to an external website',
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
      title: 'Anchor Link (Optional)',
      description:
        'Link to a specific section on the page (e.g., pricing, contact). Anchor IDs are set in each module\'s "Advanced Options".',
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
            return 'Anchor ID cannot be empty';
          }

          // Must be valid HTML ID format (alphanumeric, hyphens, underscores)
          if (!/^[a-zA-Z0-9_-]+$/.test(anchorContent)) {
            return 'Anchor ID must only contain letters, numbers, hyphens, and underscores';
          }

          return true;
        }),
      fieldset: 'destination',
    }),
    defineField({
      name: 'newTab',
      title: 'Open in new tab',
      description: 'Open link in a new browser tab',
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
      internal: 'internal.metadata.slug.current',
      params: 'params',
      external: 'external',
    },
    prepare: ({ label, title, _type, internal, params, external }) => {
      const _resolvedUrl = resolveSlug({ _type, internal, params, external });
      const linkType = external ? 'External' : 'Internal';
      const destination = external || title || internal || 'Untitled Page';

      return {
        title: label || title || 'Untitled Link',
        subtitle: `${linkType} → ${destination}`,
        media: LinkIcon,
      };
    },
  },
});
