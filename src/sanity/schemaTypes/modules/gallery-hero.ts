import { createAlignmentField } from '@/sanity/lib/schema-factory';
import { getBlockText } from '@/sanity/lib/utils';
import { TfiLayoutCtaCenter } from 'react-icons/tfi';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'galleryHero',
  title: 'Gallery Hero',
  icon: TfiLayoutCtaCenter,
  type: 'object',
  groups: [{ name: 'content', default: true }, { name: 'asset' }, { name: 'options' }],
  fieldsets: [
    {
      name: 'alignment',
      title: 'Alignment',
      options: { columns: 1 },
    },
  ],
  fields: [
    defineField({
      name: 'pretitle',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'ctas',
      title: 'Call-to-actions',
      type: 'array',
      of: [{ type: 'cta' }],
      group: 'content',
    }),
    defineField({
      name: 'assets',
      title: 'Image Assets',
      description:
        'Background image, side-by-side image, or multiple images for a gallery layout (maximum 4)',
      type: 'array',
      of: [{ type: 'img' }],
      validation: (Rule) =>
        Rule.min(1).max(5).warning('A maximum of 5 images is supported for the gallery layout'),
      group: 'asset',
    }),
    createAlignmentField({
      name: 'alignment',
      title: 'Alignment',
      group: 'options',
      fieldset: 'alignment',
      initialValue: 'center',
    }),
    defineField({
      name: 'options',
      type: 'module-options',
      group: 'options',
    }),
  ],
  preview: {
    select: {
      content: 'content',
      media: 'assets.0.image',
    },
    prepare: ({ content, media }) => {
      return {
        title: getBlockText(content) || 'Hero',
        subtitle: 'Hero',
        media,
      };
    },
  },
});
