/**
 * Sanity Schema Factory Functions
 * @version 1.0.0
 * @lastUpdated 2024-03-13
 */

import { defineField } from 'sanity';
import { isUniqueAcrossLocale } from './isUniqueAcrossLocale';

interface MetadataSchemaOptions {
  group?: string;
  required?: boolean;
  includeImage?: boolean;
}

/**
 * Creates a metadata schema with configurable options
 */
export const createMetadataSchema = (options: MetadataSchemaOptions = {}) => {
  const { group = 'seo', required = false, includeImage = true } = options;

  return defineField({
    name: 'metadata',
    title: 'SEO & Metadata',
    type: 'object',
    group,
    fields: [
      defineField({
        name: 'title',
        type: 'string',
        validation: required ? (rule) => rule.required() : undefined,
      }),
      defineField({
        name: 'description',
        type: 'text',
        rows: 3,
      }),
      ...(includeImage
        ? [
            defineField({
              name: 'image',
              type: 'image',
              description: 'Image used for social sharing',
            }),
          ]
        : []),
      defineField({
        name: 'noIndex',
        title: 'Hide from search engines',
        description:
          'Prevents this page from appearing in search results and removes it from the sitemap.',
        type: 'boolean',
        initialValue: false,
      }),
      defineField({
        name: 'slug',
        type: 'slug',
        options: {
          source: (doc: any) => doc.title || doc.metadata?.title,
          isUnique: isUniqueAcrossLocale,
        },
      }),
    ],
  });
};
