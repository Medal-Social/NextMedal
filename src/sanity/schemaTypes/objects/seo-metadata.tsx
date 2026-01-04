/**
 * SEO Metadata Object
 * @version 1.0.0
 * @lastUpdated 2025-12-31
 * @description Shared SEO fields for consistent metadata across all document types.
 * Consolidates redundant SEO patterns into a single reusable object.
 * @changelog
 * - 1.0.0: Initial version - consolidated from individual document SEO fields
 */

'use client';

import { EyeClosedIcon, SearchIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import CharacterCount from '@/sanity/ui/CharacterCount';
import SocialImageInput from '@/sanity/ui/SocialImageInput';

export default defineType({
  name: 'seo-metadata',
  title: 'SEO Settings',
  type: 'object',
  icon: SearchIcon,
  options: {
    collapsible: true,
    collapsed: false,
  },
  fields: [
    defineField({
      name: 'title',
      title: 'SEO Title',
      type: 'string',
      description: 'Title shown in search results (50-60 characters recommended)',
      validation: (Rule) => [
        Rule.required().warning('SEO title helps improve search visibility'),
        Rule.min(50).warning('Aim for at least 50 characters'),
        Rule.max(60).warning('Keep under 60 characters to avoid truncation'),
      ],
      components: {
        input: (props) => <CharacterCount max={60} {...props} />,
      },
    }),
    defineField({
      name: 'description',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      description: 'Description shown in search results (70-160 characters recommended)',
      validation: (Rule) => [
        Rule.required().warning('SEO description helps improve click-through rates'),
        Rule.min(70).warning('Aim for at least 70 characters'),
        Rule.max(160).warning('Keep under 160 characters to avoid truncation'),
      ],
      components: {
        input: (props) => <CharacterCount as="textarea" max={160} {...props} />,
      },
    }),
    defineField({
      name: 'image',
      title: 'Social Sharing Image',
      type: 'image',
      description:
        'Image displayed when sharing on social media (1200×630px recommended). If not provided, an auto-generated image will be created from your SEO title.',
      options: {
        hotspot: true,
      },
      components: {
        input: SocialImageInput,
      },
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      description:
        'Prevents this page from appearing in search results and removes it from the sitemap.',
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
});
