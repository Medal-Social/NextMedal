/**
 * Collection Documentation Document Type
 * @version 1.0.0
 * @lastUpdated 2025-12-30
 * @description Documentation article document type for guides, tutorials, and reference docs.
 * Supports nested hierarchy via parent references for building structured documentation.
 * References a parent collection page for dynamic URL resolution.
 */

import { BookIcon, EyeClosedIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { isUniqueAcrossLocale } from '@/sanity/lib/isUniqueAcrossLocale';
import CharacterCount from '@/sanity/ui/CharacterCount';
import PageIdentityField from '@/sanity/ui/PageIdentityField';

// Flag emoji for preview
const languageFlags: Record<string, string> = {
  en: '🇬🇧',
  nb: '🇳🇴',
};

export default defineType({
  name: 'collection.documentation',
  title: 'Documentation',
  type: 'document',
  icon: BookIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'navigation', title: 'Navigation' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // Collection reference (parent page)
    defineField({
      name: 'collection',
      title: 'Collection',
      type: 'reference',
      to: [{ type: 'page' }],
      description: 'The documentation root page this article belongs to (determines URL base)',
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),

    // Parent document (for nested hierarchy)
    defineField({
      name: 'parent',
      title: 'Parent Article',
      type: 'reference',
      to: [{ type: 'collection.documentation' }],
      description: 'Optional parent article for creating nested documentation structure',
      group: 'navigation',
    }),

    // Category for organization
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'docs.category' }],
      description: 'Category this documentation belongs to (displayed in sidebar)',
      group: 'navigation',
    }),

    // Page identity (title + slug)
    defineField({
      name: 'metadata',
      type: 'object',
      title: 'Page Identity',
      group: 'content',
      components: {
        field: PageIdentityField,
      },
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
            source: 'metadata.title',
            maxLength: 96,
            isUnique: isUniqueAcrossLocale,
          },
          validation: (Rule) =>
            Rule.required().custom((slug) => {
              const reserved = ['studio', 'api', 'monitoring', 'rss.xml'];
              if (slug?.current && reserved.includes(slug.current.toLowerCase())) {
                return `"${slug.current}" is a reserved path.`;
              }
              if (slug?.current?.includes('/')) {
                return "Slugs cannot contain slashes. Use a flat structure (e.g., 'getting-started').";
              }
              return true;
            }),
        }),
      ],
    }),

    // Order for sorting in navigation
    defineField({
      name: 'order',
      title: 'Navigation Order',
      type: 'number',
      description: 'Order in the documentation navigation (lower numbers appear first)',
      initialValue: 100,
      group: 'navigation',
    }),

    // Short description for navigation/cards
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 2,
      description: 'Short description shown in navigation and article cards',
      group: 'content',
    }),

    // Icon for navigation
    defineField({
      name: 'icon',
      title: 'Navigation Icon',
      type: 'string',
      description: 'Optional emoji or icon name for the navigation menu',
      group: 'navigation',
    }),

    // Body content
    defineField({
      name: 'body',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }, { type: 'code' }],
      group: 'content',
    }),

    // Related articles
    defineField({
      name: 'relatedDocs',
      title: 'Related Articles',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'collection.documentation' }] }],
      description: 'Related documentation articles shown at the bottom',
      group: 'navigation',
    }),

    // SEO fields
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'title',
          type: 'string',
          title: 'SEO Title',
          description: 'Override the page title for search engines',
          components: {
            input: (props) => (
              <CharacterCount max={60} {...props}>
                {props.renderDefault(props)}
              </CharacterCount>
            ),
          },
        }),
        defineField({
          name: 'description',
          type: 'text',
          title: 'SEO Description',
          rows: 3,
          components: {
            input: (props) => <CharacterCount as="textarea" max={160} {...props} />,
          },
        }),
        defineField({
          name: 'image',
          title: 'SEO Image',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'noIndex',
          type: 'boolean',
          title: 'No Index',
          description: 'Prevent this page from being indexed by search engines',
          initialValue: false,
          components: {
            field: (props) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <EyeClosedIcon style={{ opacity: 0.5 }} />
                {props.renderDefault(props)}
              </div>
            ),
          },
        }),
      ],
    }),

    // Language (for i18n)
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
  ],

  preview: {
    select: {
      title: 'metadata.title',
      excerpt: 'excerpt',
      parent: 'parent.metadata.title',
      category: 'category.title',
      language: 'language',
      order: 'order',
    },
    prepare({ title, excerpt, parent, category, language, order }) {
      const flag = language ? languageFlags[language] || '' : '';
      const prefix = parent ? `└ ` : '';
      const categoryLabel = category ? `[${category}]` : '';
      return {
        title: `${flag} ${prefix}${title || 'Untitled'}`.trim(),
        subtitle: [
          categoryLabel,
          excerpt || (parent ? `Child of: ${parent}` : `Order: ${order || 100}`),
        ]
          .filter(Boolean)
          .join(' '),
        media: BookIcon,
      };
    },
  },

  orderings: [
    {
      title: 'Navigation Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'metadata.title', direction: 'asc' }],
    },
    {
      title: 'Last Updated',
      name: 'updatedDesc',
      by: [{ field: '_updatedAt', direction: 'desc' }],
    },
  ],
});
