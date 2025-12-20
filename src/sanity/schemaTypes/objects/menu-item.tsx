/**
 * Menu Item Schema
 * @version 1.5.0
 * @lastUpdated 2024-03-22
 * @changelog
 * - 1.5.0: Renamed from Link to Menu Item
 * - 1.4.0: Grouped destination fields, renamed label to Text, improved helper text
 * - 1.3.0: Removed description, renamed params to Jump to Section, removed advanced group
 * - 1.2.0: Improved usability with streamlined layout and reorganized fields
 * - 1.1.0: Added improved validation and documentation
 * - 1.0.0: Initial version
 */

import { VscLink } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';
import resolveSlug from '@/sanity/lib/resolveSlug';

export default defineType({
  name: 'menuItem',
  title: 'Menu Item',
  icon: VscLink,
  type: 'object',
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
      to: [{ type: 'page' }, { type: 'blog.post' }],
      validation: (Rule) =>
        Rule.custom((value, context: any) => {
          // Only require if this is an internal link
          if (context.parent?.type === 'internal' && !value) {
            return 'Please select a page';
          }
          return true;
        }),
      hidden: ({ parent }) => parent?.type !== 'internal',
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
        }).custom((value, context: any) => {
          // Only require if this is an external link
          if (context.parent?.type === 'external' && !value) {
            return 'Please enter a URL';
          }
          return true;
        }),
      hidden: ({ parent }) => parent?.type !== 'external',
      fieldset: 'destination',
    }),
    defineField({
      name: 'params',
      title: 'Jump to Section',
      description:
        'Enter an anchor ID (e.g., #contact) to jump to a specific section. You can find these IDs in the "Advanced Options" of any page module.',
      placeholder: '#my-section',
      type: 'string',
      hidden: ({ parent }) => parent?.type !== 'internal',
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
        media: VscLink,
      };
    },
  },
});
