/**
 * Component Library Schema
 * @description Defines the structure for component library entries.
 */

import { VscLibrary } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'component.library',
  title: 'Component Library',
  type: 'document',
  icon: VscLibrary,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    // Add more fields as needed
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
    },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle,
        media: VscLibrary,
      };
    },
  },
});
