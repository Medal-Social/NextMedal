'use client';
import { apiVersion, dataset, projectId } from '@/sanity/lib/env';
import { defineConfig, isDev } from 'sanity';
import { presentation } from './src/sanity/presentation';
import { visionTool } from '@sanity/vision';
import { structure } from './src/sanity/structure';
import resolveUrl from '@/lib/resolveUrl';
import { codeInput } from '@sanity/code-input';
import { documentInternationalization } from '@sanity/document-internationalization';
import { media, mediaAssetSource } from 'sanity-plugin-media';
import { muxInput } from 'sanity-plugin-mux-input';
import { schemaTypes } from './src/sanity/schemaTypes';
import StudioIcon from './src/sanity/ui/StudioIcon';
import { dashboardTool } from './src/sanity/tools/DashboardTool';

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
  title: 'Studio by Medal Social',
  icon: StudioIcon,
  projectId,
  dataset,
  basePath: '/studio',

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
      schemaTypes: ['page', 'blog.post', 'site'],
    }),
    ...devOnlyPlugins,
  ],

  tools: (prev) => [dashboardTool(), ...prev],

  schema: {
    types: schemaTypes,
    templates: (prev) =>
      prev.filter((template) => !['page', 'blog.post', 'site'].includes(template.id)),
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
      if (['page', 'blog.post'].includes(document?._type)) {
        return resolveUrl(document as Sanity.PageBase, { base: true });
      }

      return prev;
    },
  },
});
