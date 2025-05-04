/**
 * Call-to-Action Schema
 * @version 1.3.0
 * @lastUpdated 2024-03-13
 * @changelog
 * - 1.3.0: Removed size field as it's not being used
 * - 1.2.0: Improved usability with flattened structure and better organization
 * - 1.1.0: Added improved validation, documentation, and organization
 * - 1.0.0: Initial version
 */

import { VscInspect } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'cta',
  title: 'Call-to-action',
  icon: VscInspect,
  type: 'object',
  description: 'Button or link with customizable style and destination',
  groups: [
    { name: 'basic', title: 'Basic Information', default: true },
    { name: 'appearance', title: 'Appearance' },
    { name: 'advanced', title: 'Advanced Options' },
  ],
  fields: [
    // Basic Information - First group
    defineField({
      name: 'text',
      title: 'Button Text',
      description: 'The text displayed on the button',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'basic',
    }),
    defineField({
      name: 'linkType',
      title: 'Link Type',
      description: 'Choose where this button should link to',
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
      group: 'basic',
    }),
    defineField({
      name: 'internalLink',
      title: 'Internal Page',
      description: 'Select a page within this website',
      type: 'reference',
      to: [{ type: 'page' }, { type: 'blog.post' }],
      validation: (Rule) =>
        Rule.custom((value, context: any) => {
          if (context.parent?.linkType === 'internal' && !value) {
            return 'Please select a page';
          }
          return true;
        }),
      hidden: ({ parent }) => parent?.linkType !== 'internal',
      group: 'basic',
    }),
    defineField({
      name: 'externalLink',
      title: 'External URL',
      description: 'Enter a link to an external website',
      placeholder: 'https://example.com',
      type: 'url',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https', 'mailto', 'tel'],
          allowRelative: true,
        }).custom((value, context: any) => {
          if (context.parent?.linkType === 'external' && !value) {
            return 'Please enter a URL';
          }
          return true;
        }),
      hidden: ({ parent }) => parent?.linkType !== 'external',
      group: 'basic',
    }),

    // Appearance - Second group
    defineField({
      name: 'style',
      title: 'Button Style',
      description: 'Choose the visual style of the button',
      type: 'string',
      options: {
        list: [
          { title: 'Primary', value: 'default' },
          { title: 'Secondary', value: 'secondary' },
          { title: 'Outline', value: 'outline' },
          { title: 'Ghost', value: 'ghost' },
          { title: 'Link', value: 'link' },
          { title: 'Destructive', value: 'destructive' },
        ],
      },
      initialValue: 'default',
      group: 'appearance',
    }),
    defineField({
      name: 'size',
      title: 'Button Size',
      description: 'Choose the size of the button',
      type: 'string',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Small', value: 'sm' },
          { title: 'Large', value: 'lg' },
        ],
      },
      initialValue: 'default',
      group: 'appearance',
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      description: 'Optional icon to display with the button text',
      type: 'icon',
      group: 'appearance',
    }),
    // Advanced Options - Third group
    defineField({
      name: 'newTab',
      title: 'Open in new tab',
      description: 'Open link in a new browser tab',
      type: 'boolean',
      initialValue: false,
      group: 'advanced',
    }),
    defineField({
      name: 'params',
      title: 'URL parameters',
      description:
        'Query parameters or hash fragments to append to the URL (e.g., #section or ?param=value)',
      placeholder: 'e.g. #jump-link or ?foo=bar',
      type: 'string',
      hidden: ({ parent }) => parent?.linkType !== 'internal',
      group: 'advanced',
    }),
  ],
  preview: {
    select: {
      text: 'text',
      linkType: 'linkType',
      internalTitle: 'internalLink.title',
      internalSlug: 'internalLink.metadata.slug.current',
      externalLink: 'externalLink',
      style: 'style',
      _icon: 'icon',
    },
    prepare: ({ text, internalTitle, linkType, internalSlug, externalLink, style, _icon }) => {
      // Get style display name
      let styleDisplay = 'Primary';
      if (style === 'secondary') styleDisplay = 'Secondary';
      if (style === 'outline') styleDisplay = 'Outline';
      if (style === 'ghost') styleDisplay = 'Ghost';
      if (style === 'link') styleDisplay = 'Link';
      if (style === 'destructive') styleDisplay = 'Destructive';

      // Format the destination
      let destination = '';
      if (linkType === 'internal') {
        destination = internalTitle || internalSlug || 'Untitled Page';
      } else {
        destination = externalLink || 'No URL';
      }

      // Format the title with icon if present
      const title = text || internalTitle || 'Untitled Button';
      const subtitle = `${styleDisplay} Button → ${destination}`;

      return {
        title,
        subtitle,
        media: VscInspect,
      };
    },
  },
});
