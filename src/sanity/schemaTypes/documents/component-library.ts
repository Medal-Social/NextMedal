/**
 * Component Library Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description Defines the structure for component library entries.
 * @changelog
 * - 1.0.1: Added header documentation
 * - 1.0.0: Initial version
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
