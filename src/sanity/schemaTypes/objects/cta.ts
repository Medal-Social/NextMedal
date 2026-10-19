/**
 * Call-to-Action Schema
 * @version 1.4.1
 * @lastUpdated 2025-12-23
 * @description A button or link: where it goes and what it says. Looks come from blockDesign.
 * @changelog
 * - 2.0.0: No style field — the block decides how its buttons look
 * - 1.4.1: Updated header documentation
 * - 1.4.0: Simplified schema - removed icon, reduced styles to primary/ghost, removed advanced group
 * - 1.3.0: Removed size field as it's not being used
 */

import { LaunchIcon } from '@sanity/icons/Launch';
import { defineField, defineType } from 'sanity';
import { CtaInput } from '../../components/CtaInput';
import { CtaLinkInput } from '../../components/CtaLinkInput';

export default defineType({
  name: 'cta',
  title: 'Button or link',
  icon: LaunchIcon,
  type: 'object',
  components: {
    input: CtaInput,
  },
  description: 'Where it goes and what it says. How it looks is decided by the block.',
  fields: [
    defineField({
      name: 'link',
      title: 'Link',
      description: 'Where the button goes.',
      type: 'menuItem',
      components: {
        // biome-ignore lint/suspicious/noExplicitAny: Sanity component casting
        input: CtaLinkInput as any,
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'link.label',
      subtitle: 'link.type',
    },
    prepare: ({ title, subtitle }) => ({
      title: title || 'No label',
      subtitle: subtitle === 'internal' ? 'Page on this site' : 'Other website',
    }),
  },
});
