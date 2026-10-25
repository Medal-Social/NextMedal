/**
 * Download offer (placements only): a picture, a short text and a button that
 * opens a form. Look and anchor come from code; LeadMagnet renders "featured".
 * @changelog
 * - 3.0.0: Lean — no style or anchor options; plain labels
 * - 2.3.0: Refined Studio UX and validation
 */

import { DownloadIcon } from '@sanity/icons/Download';
import { defineField, defineType } from 'sanity';
import { richTextField } from '../../fragments/rich-text';
import { blockPreview } from '../preview';

export default defineType({
  name: 'lead-magnet',
  title: 'Download offer',
  description: 'A download offer with a picture and a form, shown next to articles.',
  icon: DownloadIcon,
  type: 'object',
  fields: [
    richTextField('content', 'Title and text', 'section', {
      description: 'A heading and a short text about what people get.',
      required: true,
      initialValue: [
        {
          _type: 'block',
          style: 'h2',
          children: [{ _type: 'span', text: 'Get your free resource' }],
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Download this exclusive guide to learn the best practices and strategies for your business.',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'image',
      title: 'Picture',
      description: 'E.g. the cover of the guide.',
      type: 'img',
    }),
    defineField({
      name: 'buttonText',
      title: 'Button text',
      description: 'The button opens the form.',
      type: 'string',
      initialValue: 'Download now',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'form',
      title: 'Form',
      description: 'The form people fill in to get the download.',
      type: 'reference',
      to: [{ type: 'form' }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: blockPreview('Download offer', { title: 'content', media: 'image.image' }),
});
