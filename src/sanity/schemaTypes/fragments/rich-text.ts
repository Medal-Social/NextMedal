/**
 * Rich-text presets (Vault spec 2026-10-18 D7). Every rich-text field uses one
 * of these; the contract test (tests/unit/sanity/rich-text-contract.test.tsx)
 * proves the renderer handles everything a preset offers, so the Studio toolbar
 * and the site cannot drift.
 */
import { defineArrayMember, defineField } from 'sanity';
import link from '../objects/link';

export type RichTextStyle = 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'blockquote';
export type RichTextList = 'bullet' | 'number';
export type RichTextDecorator = 'strong' | 'em';
export type RichTextAnnotation = 'link';

export interface RichTextPreset {
  styles: readonly RichTextStyle[];
  lists: readonly RichTextList[];
  decorators: readonly RichTextDecorator[];
  annotations: readonly RichTextAnnotation[];
  /**
   * How the link annotation is edited (the stored markDef `_type` is `link` either way):
   * `registered` uses the `link` type with its custom LinkAnnotationInput; `inline` is an
   * inline object with the same fields and the default object editor.
   */
  linkEditor?: 'inline' | 'registered';
  /** Editor titles that differ from the defaults for this preset. */
  styleTitles?: Partial<Record<RichTextStyle, string>>;
}

export const RICH_TEXT_PRESETS = {
  /** Page top: the page title (h1) and the intro. */
  pageTop: {
    styles: ['normal', 'h1'],
    lists: [],
    decorators: ['strong', 'em'],
    annotations: [],
    styleTitles: { h1: 'Title', normal: 'Text' },
  },
  /** List pages (no page top): the page title and an intro. */
  listIntro: {
    styles: ['normal', 'h1', 'h2'],
    lists: [],
    decorators: ['strong', 'em'],
    annotations: [],
    styleTitles: { h1: 'Page title' },
  },
  /** A block's intro or message: a heading and paragraphs. */
  section: {
    styles: ['normal', 'h2', 'h3'],
    lists: [],
    decorators: ['strong', 'em'],
    annotations: [],
  },
  /** Text inside a list item (feature, answer, comparison text). */
  plain: { styles: ['normal'], lists: [], decorators: ['strong', 'em'], annotations: [] },
  /** Short text that may link somewhere: footer copyright, site tagline, bios, banners. */
  plainLink: {
    styles: ['normal'],
    lists: [],
    decorators: ['strong', 'em'],
    annotations: ['link'],
    linkEditor: 'registered',
  },
  /** A pricing tier's features: paragraphs and a bullet list (each bullet gets a check mark). */
  tier: { styles: ['normal'], lists: ['bullet'], decorators: ['strong', 'em'], annotations: [] },
  /** The Text block. */
  prose: {
    styles: ['normal', 'h2', 'h3', 'h4', 'blockquote'],
    lists: ['bullet', 'number'],
    decorators: ['strong', 'em'],
    annotations: ['link'],
    linkEditor: 'registered',
  },
  /** Article bodies (code blocks etc. stay as extra members). */
  article: {
    styles: ['normal', 'h2', 'h3', 'h4', 'blockquote'],
    lists: ['bullet', 'number'],
    decorators: ['strong', 'em'],
    annotations: ['link'],
    linkEditor: 'inline',
  },
} as const satisfies Record<string, RichTextPreset>;

export type RichTextPresetName = keyof typeof RICH_TEXT_PRESETS;

const STYLE_TITLES: Record<RichTextStyle, string> = {
  normal: 'Paragraph',
  h1: 'Title',
  h2: 'Heading',
  h3: 'Small heading',
  h4: 'Smallest heading',
  blockquote: 'Quote',
};
const LIST_TITLES: Record<RichTextList, string> = { bullet: 'Bullets', number: 'Numbers' };
const DECORATOR_TITLES: Record<RichTextDecorator, string> = { strong: 'Bold', em: 'Italic' };

function linkAnnotation(preset: RichTextPreset) {
  if (preset.linkEditor === 'inline') {
    return { name: 'link', type: 'object', title: 'Link', fields: link.fields, icon: link.icon };
  }
  return { name: 'link', type: 'link', title: 'Link' };
}

/** The `block` array member for a preset (also used by sanity.config.ts). */
export function richTextBlock(presetName: RichTextPresetName) {
  const preset: RichTextPreset = RICH_TEXT_PRESETS[presetName];
  return defineArrayMember({
    type: 'block',
    styles: preset.styles.map((value) => ({
      title: preset.styleTitles?.[value] ?? STYLE_TITLES[value],
      value,
    })),
    lists: preset.lists.map((value) => ({ title: LIST_TITLES[value], value })),
    marks: {
      decorators: preset.decorators.map((value) => ({ title: DECORATOR_TITLES[value], value })),
      annotations: preset.annotations.map(() => linkAnnotation(preset)),
    },
  });
}

export function richTextField(
  name: string,
  title: string,
  presetName: RichTextPresetName,
  extra: {
    description?: string;
    required?: boolean;
    group?: string;
    extraMembers?: ReturnType<typeof defineArrayMember>[];
    initialValue?: unknown[];
  } = {}
) {
  return defineField({
    name,
    title,
    description: extra.description,
    type: 'array',
    of: [richTextBlock(presetName), ...(extra.extraMembers ?? [])],
    ...(extra.group ? { group: extra.group } : {}),
    ...(extra.initialValue ? { initialValue: extra.initialValue } : {}),
    validation: extra.required ? (Rule) => Rule.required() : undefined,
  });
}

/**
 * The internationalized `blockContent` field type (sanity.config.ts): footer copyright
 * (stores a "Medal Social" link), site tagline, banners, bios.
 */
export const blockContentField = defineField({
  name: 'blockContent',
  type: 'array',
  of: [richTextBlock('plainLink')],
});
