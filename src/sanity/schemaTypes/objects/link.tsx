/**
 * Link Schema
 * @version 1.2.0
 * @lastUpdated 2024-03-13
 * @changelog
 * - 1.2.0: Improved usability with streamlined layout and reorganized fields
 * - 1.1.0: Added improved validation and documentation
 * - 1.0.0: Initial version
 */

import resolveSlug from '@/sanity/lib/resolveSlug';
import Icon from '@/ui/Icon';
import { VscLink } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'link',
  title: 'Link',
  icon: VscLink,
  type: 'object',
  description: 'Internal or external link with optional icon and label',
  groups: [
    { name: 'main', title: 'Link Settings', default: true },
    { name: 'advanced', title: 'Advanced Options' },
  ],
  fields: [
    // Main Settings Group
    defineField({
      name: 'label',
      title: 'Link Text',
      description: 'Text displayed for the link',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'main',
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      description: 'Optional icon to display with the link',
      type: 'icon',
      group: 'main',
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
      group: 'main',
    }),
    defineField({
      name: 'internal',
      title: 'Internal Page',
      description: 'Select a page within this website',
      type: 'reference',
      to: [
        { type: 'page' },
        { type: 'blog.post' }
      ],
      validation: (Rule) =>
        Rule.custom((value, context: any) => {
          // Only require if this is an internal link
          if (context.parent?.type === 'internal' && !value) {
            return 'Please select a page';
          }
          return true;
        }),
      hidden: ({ parent }) => parent?.type !== 'internal',
      group: 'main',
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
      group: 'main',
    }),
    defineField({
      name: 'newTab',
      title: 'Open in new tab',
      description: 'Open link in a new browser tab',
      type: 'boolean',
      initialValue: false,
      group: 'main',
    }),

    // Advanced Options Group
    defineField({
      name: 'description',
      title: 'Description',
      description: 'Optional description text (may be used in tooltips)',
      type: 'string',
      group: 'advanced',
    }),
    defineField({
      name: 'params',
      title: 'URL parameters',
      description:
        'Query parameters or hash fragments to append to the URL (e.g., #section or ?param=value)',
      placeholder: 'e.g. #jump-link or ?foo=bar',
      type: 'string',
      hidden: ({ parent }) => parent?.type !== 'internal',
      group: 'advanced',
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
      icon: 'icon',
    },
    prepare: ({ label, title, _type, internal, params, external, icon }) => {
      const _resolvedUrl = resolveSlug({ _type, internal, params, external });
      const linkType = external ? 'External' : 'Internal';
      const destination = external || title || internal || 'Untitled Page';

      return {
        title: label || title || 'Untitled Link',
        subtitle: `${linkType} → ${destination}`,
        media: icon ? <Icon icon={icon} /> : VscLink,
      };
    },
  },
});
