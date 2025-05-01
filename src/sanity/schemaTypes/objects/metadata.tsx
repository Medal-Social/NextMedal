/**
 * Metadata Schema
 * @version 1.1.0
 * @lastUpdated 2024-03-13
 * @changelog
 * - 1.1.0: Updated to use schema factory function
 * - 1.0.0: Initial version
 */

import { createMetadataSchema } from '@/sanity/lib/schema-factory';
import CharacterCount from '@/sanity/ui/CharacterCount';
import PreviewOG from '@/sanity/ui/PreviewOG';
import { defineField, defineType } from 'sanity';

/**
 * This is a custom metadata schema that extends the base metadata schema
 * with additional UI components for character counting and preview.
 */
const metadataSchema = createMetadataSchema({
  required: true,
  includeKeywords: false,
});

export default defineType({
  name: 'metadata',
  title: 'Metadata',
  description: 'For search engines',
  type: 'object',
  fields: [
    // Override the slug field to add validation
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'URL path or permalink',
      options: {
        source: (doc: any) => (doc.issue ? `issue-${doc.issue}` : doc.title || doc.metadata?.title),
      },
      validation: (Rule) => Rule.required(),
    }),
    // Override the title field to add character count and preview
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => [Rule.required(), Rule.min(50).warning(), Rule.max(60).warning()],
      components: {
        input: (props) => (
          <CharacterCount max={60} {...props}>
            <PreviewOG title={props.elementProps.value} />
          </CharacterCount>
        ),
      },
    }),
    // Override the description field to add character count
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      validation: (Rule) => [Rule.required(), Rule.min(70).warning(), Rule.max(160).warning()],
      components: {
        input: (props) => <CharacterCount as="textarea" max={160} {...props} />,
      },
    }),
    // Keep other fields from the factory
    ...metadataSchema.fields.filter(
      (field) => !['slug', 'title', 'description'].includes(field.name)
    ),
  ],
});
