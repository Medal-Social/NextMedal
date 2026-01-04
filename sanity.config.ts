'use client';
import { apiVersion, dataset, projectId } from '@/sanity/lib/env';
import { defineConfig, defineField, isDev } from 'sanity';
import { presentation } from '@/sanity/presentation';
import { visionTool } from '@sanity/vision';
import { structure } from '@/sanity/structure';
import { resolveUrlSync } from '@/lib/sanity/resolve-url';
import { codeInput } from '@sanity/code-input';
import { documentInternationalization } from '@sanity/document-internationalization';
import { internationalizedArray } from 'sanity-plugin-internationalized-array';
import { languageFilter } from '@sanity/language-filter';
import { media, mediaAssetSource } from 'sanity-plugin-media';
import { muxInput } from 'sanity-plugin-mux-input';
import { schemaTypes } from '@/sanity/schemaTypes';
import StudioIcon from '@/sanity/ui/StudioIcon';
import { dashboardTool } from '@/sanity/tools/DashboardTool';

import { routing, localeConfig, type Locale } from '@/i18n/routing';

// Dev-only plugins - visionTool is only needed for GROQ debugging in development
const devOnlyPlugins = isDev
  ? [
      visionTool({
        defaultApiVersion: apiVersion,
      }),
    ]
  : [];

export default defineConfig({
  title: `Studio by Medal Social ${dataset === 'migrationtest' ? '(MIGRATION TEST)' : ''}`,
  icon: StudioIcon,
  projectId,
  dataset,
  basePath: '/studio',
  apiVersion,

  announcements: { enabled: false },
  tasks: { enabled: false },
  scheduledPublishing: { enabled: false },

  form: {
    image: {
      assetSources: () => [mediaAssetSource],
    },
  },

  plugins: [
    presentation,
    structure,
    codeInput(),
    media(),
    muxInput({
      mp4_support: 'standard',
    }),
    documentInternationalization({
      supportedLanguages: routing.locales.map((locale) => ({
        id: locale,
        title: localeConfig[locale as Locale].title,
      })),
      schemaTypes: ['page', 'collection.article', 'collection.documentation'],
    }),
    internationalizedArray({
      languages: routing.locales.map((locale) => ({
        id: locale,
        title: localeConfig[locale as Locale].title,
      })),
      defaultLanguages: [routing.defaultLocale],
      fieldTypes: [
        'string',
        'text',
        defineField({
          name: 'blockContent',
          type: 'array',
          of: [
            {
              type: 'block',
              styles: [{ title: 'Normal', value: 'normal' }],
              lists: [],
              marks: {
                decorators: [
                  { title: 'Strong', value: 'strong' },
                  { title: 'Emphasis', value: 'em' },
                ],
                annotations: [],
              },
            },
          ],
        }),
        // Navigation array types for site settings
        defineField({
          name: 'headerNavArray',
          type: 'array',
          of: [{ type: 'menuItem' }, { type: 'dropdownMenu' }],
        }),
        defineField({
          name: 'ctaArray',
          type: 'array',
          of: [{ type: 'cta' }],
        }),
        defineField({
          name: 'dropdownMenuArray',
          type: 'array',
          of: [{ type: 'dropdownMenu' }],
        }),
        defineField({
          name: 'menuItemArray',
          type: 'array',
          of: [{ type: 'menuItem' }],
        }),
      ],
      buttonAddAll: false,
    }),
    languageFilter({
      supportedLanguages: routing.locales.map((locale) => ({
        id: locale,
        title: localeConfig[locale as Locale].title,
      })),
      defaultLanguages: [routing.defaultLocale],
      documentTypes: [
        'person',
        'article.category',
        'docs.category',
        'form',
        'banner',
        'collection.newsletter',
        'collection.changelog',
        'collection.events',
        'site',
      ],
    }),
    ...devOnlyPlugins,
  ],

  tools: (prev) => {
    // Extract tools by name for explicit ordering
    const dashboard = dashboardTool();
    const structureTool = prev.find((tool) => tool.name === 'structure');
    // Editor is the custom name for presentationTool (see presentation.ts line 7)
    const editorTool = prev.find((tool) => tool.name === 'editor');
    const mediaTool = prev.find((tool) => tool.name === 'media');
    // Try multiple possible names for mux plugin
    const muxTool =
      prev.find((tool) => tool.name === 'mux-input') ||
      prev.find((tool) => tool.name === 'mux') ||
      prev.find((tool) => tool.title?.toLowerCase().includes('mux'));
    const visionToolItem = prev.find((tool) => tool.name === 'vision');

    // Explicit order: dashboard, structure, editor, media, videos (mux), vision
    const orderedTools = [
      dashboard,
      structureTool,
      editorTool,
      mediaTool,
      muxTool,
      visionToolItem,
    ].filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));

    return orderedTools;
  },

  schema: {
    types: schemaTypes,
    templates: (prev) =>
      prev.filter(
        (template) =>
          !['page', 'site', 'collection.article', 'collection.documentation'].includes(template.id)
      ),
  },
  document: {
    comments: { enabled: false },
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        return prev.filter((templateItem) => templateItem.templateId !== 'site');
      }
      return prev;
    },
    actions: (prev, context) => {
      // Singleton protection: Prevent delete/duplicate/unpublish for 'site' document
      if (context.schemaType === 'site') {
        return prev.filter(
          ({ action }) => action && !['delete', 'duplicate', 'unpublish'].includes(action)
        );
      }
      return prev;
    },
    productionUrl: async (prev, { document }) => {
      if (
        [
          'page',
          'collection.article',
          'collection.newsletter',
          'collection.documentation',
          'collection.changelog',
          'collection.events',
        ].includes(document?._type)
      ) {
        return resolveUrlSync(document as Sanity.PageBase, { base: true });
      }

      return prev;
    },
  },
});
