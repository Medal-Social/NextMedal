/**
 * Sanity Schema Factory Functions
 * @version 1.0.0
 * @lastUpdated 2024-03-13
 */

import { defineField } from 'sanity';

interface MetadataSchemaOptions {
  group?: string;
  required?: boolean;
  includeKeywords?: boolean;
  includeImage?: boolean;
}

/**
 * Creates a metadata schema with configurable options
 */
export const createMetadataSchema = (options: MetadataSchemaOptions = {}) => {
  const { group = 'seo', required = false, includeKeywords = true, includeImage = true } = options;

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
      ...(includeKeywords
        ? [
            defineField({
              name: 'keywords',
              type: 'array',
              of: [{ type: 'string' }],
            }),
          ]
        : []),
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
        type: 'boolean',
        initialValue: false,
      }),
      defineField({
        name: 'slug',
        type: 'slug',
        options: {
          source: (doc: any) => doc.title || doc.metadata?.title,
        },
      }),
    ],
  });
};

interface VideoFieldsOptions {
  group?: string;
  fieldset?: string;
  required?: boolean;
  includeTitle?: boolean;
  includePlayback?: boolean;
  includeBackground?: boolean;
}

/**
 * Creates video-related fields with configurable options
 */
export const createVideoFields = (options: VideoFieldsOptions = {}) => {
  const {
    group = 'content',
    fieldset,
    required = false,
    includeTitle = true,
    includePlayback = true,
    includeBackground = true,
  } = options;

  return [
    defineField({
      name: 'muxVideo',
      title: 'Video',
      description: `Upload a video to be used in this section.
        
        **Note:** Videos are processed by Mux and may take a few minutes to be available.
        If video doesn't appear, check the "Used by" tab to see if documents reference it.
        For best results, use MP4 format with H.264 encoding.`,
      type: 'mux.video',
      group,
      fieldset,
      validation: required ? (rule) => rule.required() : undefined,
    }),
    ...(includeTitle
      ? [
          defineField({
            name: 'videoTitle',
            title: 'Video Title',
            description: 'Optional title to display on the video thumbnail (shown on hover)',
            type: 'string',
            group,
            fieldset,
            hidden: ({ parent }) =>
              !parent?.muxVideo?.asset || parent?.videoPlayback === 'auto-play',
          }),
        ]
      : []),
    ...(includePlayback
      ? [
          defineField({
            name: 'videoPlayback',
            title: 'Video Playback Style',
            description: 'Choose how the video should be played',
            type: 'string',
            options: {
              list: [
                {
                  title: 'Thumbnail with Click-to-Play (Modal)',
                  value: 'click-to-play',
                },
                {
                  title: 'Auto-Play Inline (No Click Required)',
                  value: 'auto-play',
                },
              ],
            },
            initialValue: 'click-to-play',
            group,
            fieldset,
            hidden: ({ parent }) => !parent?.muxVideo?.asset,
          }),
        ]
      : []),
    ...(includeBackground
      ? [
          defineField({
            name: 'showThumbnailAsBackground',
            title: 'Use Video Thumbnail as Background',
            description: 'When enabled, the video thumbnail will be used as the background image',
            type: 'boolean',
            initialValue: false,
            group,
            fieldset,
            hidden: ({ parent }) =>
              !parent?.muxVideo?.asset || parent?.videoPlayback === 'auto-play',
          }),
        ]
      : []),
  ];
};

interface AlignmentFieldOptions {
  name?: string;
  title?: string;
  group?: string;
  fieldset?: string;
  initialValue?: string;
}

/**
 * Creates an alignment field with configurable options
 */
export const createAlignmentField = (options: AlignmentFieldOptions = {}) => {
  const {
    name = 'textAlign',
    title = 'Text alignment',
    group = 'options',
    fieldset = 'alignment',
    initialValue = 'center',
  } = options;

  return defineField({
    name,
    title,
    type: 'string',
    group,
    fieldset,
    initialValue,
    options: {
      list: [
        { title: 'Left', value: 'left' },
        { title: 'Center', value: 'center' },
        { title: 'Right', value: 'right' },
      ],
    },
  });
};

export const createJustifyField = (options: AlignmentFieldOptions = {}) => {
  const {
    name = 'justify',
    title = 'Justify',
    group = 'options',
    fieldset = 'alignment',
    initialValue = 'center',
  } = options;

  return defineField({
    name,
    title,
    type: 'string',
    group,
    fieldset,
    initialValue,
    options: {
      list: [
        { title: 'Start', value: 'start' },
        { title: 'Center', value: 'center' },
        { title: 'End', value: 'end' },
      ],
    },
  });
};

interface ThemeColorsOptions {
  group?: string;
  fieldset?: string;
  required?: boolean;
}

/**
 * Creates theme color fields with configurable options
 */
export const createThemeColorFields = (options: ThemeColorsOptions = {}) => {
  const { group = 'branding', fieldset, required = false } = options;

  return [
    defineField({
      name: 'canvas',
      title: 'Canvas Color',
      description: 'Main background color',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group,
      fieldset,
      validation: required ? (rule) => rule.required() : undefined,
    }),
    defineField({
      name: 'ink',
      title: 'Ink Color',
      description: 'Main text color',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group,
      fieldset,
      validation: required ? (rule) => rule.required() : undefined,
    }),
    defineField({
      name: 'accent',
      title: 'Accent Color',
      description: 'Primary accent color',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group,
      fieldset,
      validation: required ? (rule) => rule.required() : undefined,
    }),
    defineField({
      name: 'secondary',
      title: 'Secondary Color',
      description: 'Secondary background color',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group,
      fieldset,
    }),
    defineField({
      name: 'muted',
      title: 'Muted Color',
      description: 'Subtle elements color',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group,
      fieldset,
    }),
  ];
};
