/**
 * Metadata Schema (SEO fields only)
 * @version 2.0.0
 * @lastUpdated 2025-12-29
 * @description SEO-only object type. Slug is now defined separately in document schemas.
 * @changelog
 * - 2.0.0: Removed slug field - now defined inline in document schemas for proper tab placement
 * - 1.2.0: Slug uses SlugWithPreview component for better visibility and preview buttons
 * - 1.1.1: Updated header documentation
 * - 1.1.0: Updated to use schema factory function
 * - 1.0.0: Initial version
 */

import { defineField, defineType } from 'sanity';
import CharacterCount from '@/sanity/ui/CharacterCount';
import PreviewOG from '@/sanity/ui/PreviewOG';

export default defineType({
  name: 'metadata',
  title: 'SEO Settings',
  description: 'Search engine optimization settings',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'SEO Title',
      type: 'string',
      description: 'Title shown in search results (50-60 characters recommended)',
      validation: (Rule) => [Rule.required(), Rule.min(50).warning(), Rule.max(60).warning()],
      components: {
        input: (props) => (
          <CharacterCount max={60} {...props}>
            <PreviewOG title={props.elementProps.value} />
          </CharacterCount>
        ),
      },
    }),
    defineField({
      name: 'description',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      description: 'Description shown in search results (70-160 characters recommended)',
      validation: (Rule) => [Rule.required(), Rule.min(70).warning(), Rule.max(160).warning()],
      components: {
        input: (props) => <CharacterCount as="textarea" max={160} {...props} />,
      },
    }),
    defineField({
      name: 'image',
      title: 'Social Sharing Image',
      type: 'image',
      description: 'Image displayed when sharing on social media',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      description:
        'Prevents this page from appearing in search results and removes it from the sitemap.',
      initialValue: false,
    }),
  ],
});
