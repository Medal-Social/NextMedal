import { BookIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { DEFAULT_LOCALE } from '@/i18n/config';
import { createLocaleFilter } from '@/sanity/lib/createLocaleFilter';
import { isUniqueAcrossLocale } from '@/sanity/lib/isUniqueAcrossLocale';
import PageIdentityField from '@/sanity/ui/PageIdentityField';

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
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'docs.category' }],
      description: 'Category this documentation belongs to (displayed in sidebar)',
      group: 'navigation',
    }),

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
              // Only ban system paths - language codes are fine since docs are under /docs/ prefix
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

    defineField({
      name: 'order',
      title: 'Navigation Order',
      type: 'number',
      description: 'Order in the documentation navigation (lower numbers appear first)',
      initialValue: 100,
      group: 'navigation',
    }),

    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 2,
      description: 'Short description shown in navigation and article cards',
      group: 'content',
    }),

    defineField({
      name: 'icon',
      title: 'Navigation Icon',
      type: 'string',
      description: 'Optional emoji or icon name for the navigation menu',
      group: 'navigation',
    }),

    defineField({
      name: 'body',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
        },
        { type: 'image', options: { hotspot: true } },
        {
          type: 'code',
          options: {
            languageAlternatives: [{ title: 'Mermaid', value: 'mermaid' }],
          },
        },
      ],
      group: 'content',
    }),

    // Related articles
    defineField({
      name: 'relatedDocs',
      title: 'Related Articles',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'collection.documentation' }],
          options: createLocaleFilter(),
        },
      ],
      description: 'Related documentation articles shown at the bottom',
      group: 'navigation',
    }),

    // SEO fields
    defineField({
      name: 'seo',
      type: 'seo-metadata',
      group: 'seo',
    }),

    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
      initialValue: DEFAULT_LOCALE,
    }),
  ],

  preview: {
    select: {
      title: 'metadata.title',
      excerpt: 'excerpt',
      category: 'category.title',
      language: 'language',
      order: 'order',
    },
    prepare({ title, excerpt, category, language, order }) {
      const flag = language ? languageFlags[language] || '' : '';
      const categoryLabel = category ? `[${category}]` : '';
      return {
        title: `${flag} ${title || 'Untitled'}`.trim(),
        subtitle: [categoryLabel, excerpt || `Order: ${order || 100}`].filter(Boolean).join(' '),
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
