/**
 * Icon Schema
 * @version 1.0.2
 * @lastUpdated 2025-12-28
 * @description Icon selection field using Lucide icons.
 * @changelog
 * - 1.0.2: Use static icon map validation for better tree-shaking
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Initial version
 */

import { ComponentIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { Icon } from '@/components/blocks/objects/core';
import { isValidIconName } from '@/components/blocks/objects/core/utils/resolveIcon';

export default defineType({
  name: 'icon',
  title: 'Icon',
  icon: ComponentIcon,
  type: 'object',
  fields: [
    defineField({
      name: 'icon',
      title: 'Icon',
      description: (
        <span>
          Search for icons at{' '}
          <a href="https://lucide.dev/icons/" target="_blank" rel="noreferrer">
            Lucide
          </a>
        </span>
      ),
      type: 'string',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return 'Icon is required';
          if (!isValidIconName(value))
            return 'Invalid icon name. Add it to resolveIcon.ts if needed.';
          return true;
        }),
      placeholder: 'i.e. Activity',
    }),
  ],
  preview: {
    select: {
      icon: 'icon',
    },
    prepare: ({ icon }) => ({
      title: icon,
      media: icon ? <Icon icon={{ icon, _type: 'icon' }} /> : null,
    }),
  },
});
