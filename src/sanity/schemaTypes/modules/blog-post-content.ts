import { VscEdit } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'blog-post-content',
  title: 'Blog post content',
  icon: VscEdit,
  type: 'object',
  fields: [
    defineField({
      name: 'options',
      type: 'module-options',
    }),
  ],
  preview: {
    select: {
      uid: 'options.uid',
    },
    prepare: ({ uid }) => ({
      title: 'Blog post content',
      subtitle: uid && `#${uid}`,
    }),
  },
});
