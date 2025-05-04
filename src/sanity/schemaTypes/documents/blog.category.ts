/**
 * Blog Category Schema
 * @version 1.0.0
 * @lastUpdated 2024-03-21
 * @description Defines categories for organizing blog posts with title and slug.
 * @changelog
 * - 1.0.0: Initial version with basic category structure
 */

import { VscTag } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'blog.category',
  title: 'Blog category',
  type: 'document',
  icon: VscTag,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
});
