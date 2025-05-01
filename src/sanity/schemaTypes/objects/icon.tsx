import Icon from '@/ui/Icon';
import * as Lucide from 'lucide-react';
import { VscSymbolMisc } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'icon',
  title: 'Icon',
  icon: VscSymbolMisc,
  type: 'object',
  fields: [
    defineField({
      name: 'ic0n',
      title: 'ic0n',
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
          if (!Lucide[value as keyof typeof Lucide]) return 'Invalid icon name';
          return true;
        }),
      placeholder: 'i.e. Activity',
    }),
  ],
  preview: {
    select: {
      ic0n: 'ic0n',
    },
    prepare: ({ ic0n }) => ({
      title: ic0n,
      media: ic0n ? <Icon icon={{ ic0n, _type: 'icon' }} /> : null,
    }),
  },
});
