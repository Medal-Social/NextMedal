/**
 * Call-to-Action Schema
 * @version 1.4.1
 * @lastUpdated 2025-12-23
 * @description Button or link with customizable style and destination.
 * @changelog
 * - 1.4.1: Updated header documentation
 * - 1.4.0: Simplified schema - removed icon, reduced styles to primary/ghost, removed advanced group
 * - 1.3.0: Removed size field as it's not being used
 */

import { LaunchIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { CtaInput } from '../../components/CtaInput';
import { CtaLinkInput } from '../../components/CtaLinkInput';

export default defineType({
  name: 'cta',
  title: 'Call-to-Action',
  icon: LaunchIcon,
  type: 'object',
  components: {
    input: CtaInput,
  },
  description: 'Button or link with customizable style and destination',
  fields: [
    defineField({
      name: 'link',
      title: 'Link',
      description: 'The destination link.',
      type: 'menuItem',
      components: {
        // biome-ignore lint/suspicious/noExplicitAny: Sanity component casting
        input: CtaLinkInput as any,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'style',
      title: 'Style',
      description: 'Visual style of the button.',
      type: 'string',
      options: {
        list: [
          { title: 'Primary', value: 'primary' },
          { title: 'Ghost', value: 'ghost' },
          { title: 'Link', value: 'link' },
        ],
      },
      initialValue: 'primary',
    }),
  ],
  preview: {
    select: {
      title: 'link.label',
      subtitle: 'link.type',
    },
    prepare: ({ title, subtitle }) => ({
      title: title || 'No label',
      subtitle: subtitle === 'internal' ? 'Internal Link' : 'External Link',
    }),
  },
});
