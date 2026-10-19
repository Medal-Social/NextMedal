import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PortableTextComponents } from 'next-sanity';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({ useLocale: () => 'en' }));
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import FooterRichText from '@/components/blocks/layout/footer/FooterRichText';
import { pricingTierComponents } from '@/components/blocks/modules/content/PricingList';
import Content from '@/components/blocks/modules/content/RichtextModule/Content';
import { buildPortableTextComponents } from '@/components/blocks/modules/hero/Hero';
import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { schemaTypes } from '@/sanity/schemaTypes';
import {
  blockContentField,
  RICH_TEXT_PRESETS,
  type RichTextPreset,
  type RichTextPresetName,
} from '@/sanity/schemaTypes/fragments/rich-text';

type Member = {
  type: string;
  styles?: { value: string }[];
  lists?: { value: string }[];
  marks?: { decorators?: { value: string }[]; annotations?: { name: string }[] };
  fields?: Field[];
};
type Field = { name: string; type: string; of?: Member[]; fields?: Field[] };
type SchemaType = { name: string; fields?: Field[] };

/**
 * Types whose rich text is out of scope for the presets: the developer showcase,
 * and collection bodies other than articles (they keep their own toolbars with
 * code blocks and tables).
 */
const SKIP: readonly string[] = [
  'component-gallery',
  'collection.documentation',
  'collection.changelog',
  'collection.events',
  'collection.newsletter',
];

function blockMembers(fields: Field[] = [], path = ''): [string, Member][] {
  return fields.flatMap((field) => {
    const here = `${path}${field.name}`;
    const own = (field.of ?? [])
      .filter((member) => member.type === 'block')
      .map((member) => [here, member] as [string, Member]);
    const nested = [...(field.fields ?? []), ...(field.of ?? []).flatMap((m) => m.fields ?? [])];
    return [...own, ...blockMembers(nested, `${here}.`)];
  });
}

const offered = (member: Member) => ({
  styles: member.styles?.map((s) => s.value) ?? [],
  lists: member.lists?.map((l) => l.value) ?? [],
  decorators: member.marks?.decorators?.map((d) => d.value) ?? [],
  annotations: member.marks?.annotations?.map((a) => a.name) ?? [],
});

const presetShape = (preset: RichTextPreset) => ({
  styles: [...preset.styles],
  lists: [...preset.lists],
  decorators: [...preset.decorators],
  annotations: [...preset.annotations],
});

const FIELDS = (schemaTypes as unknown as SchemaType[])
  .filter((type) => !SKIP.includes(type.name))
  .flatMap((type) =>
    blockMembers(type.fields).map(([path, member]) => [`${type.name}.${path}`, member] as const)
  );

describe('every rich-text field offers exactly one preset', () => {
  it('finds the known rich-text fields', () => {
    expect(FIELDS.map(([path]) => path)).toEqual(
      expect.arrayContaining([
        'hero.content',
        'richtext.content',
        'callout.content',
        'accordion-list.content',
        'accordion-list.items.content',
        'features.intro',
        'features.items.content',
        'logo-cloud.content',
        'pricing-list.intro',
        'product-comparison.text',
        'changelog-frontpage.intro',
        'pricing.content',
        'collection.article.body',
      ])
    );
  });

  it.each(FIELDS)('%s', (_, member) => {
    expect(Object.values(RICH_TEXT_PRESETS).map(presetShape)).toContainEqual(offered(member));
  });
});

function sample(preset: RichTextPreset) {
  const blocks: unknown[] = [];
  let k = 0;
  const key = () => `k${k++}`;
  for (const style of preset.styles) {
    blocks.push({
      _type: 'block',
      _key: key(),
      style,
      markDefs: [],
      children: [{ _type: 'span', _key: key(), text: `style ${style}`, marks: [] }],
    });
  }
  for (const listItem of preset.lists) {
    for (const level of [1, 2]) {
      blocks.push({
        _type: 'block',
        _key: key(),
        style: 'normal',
        listItem,
        level,
        markDefs: [],
        children: [{ _type: 'span', _key: key(), text: `${listItem} ${level}`, marks: [] }],
      });
    }
  }
  const markDefs = preset.annotations.map((name) => ({
    _type: name,
    _key: `def-${name}`,
    type: 'external',
    external: 'https://www.nextmedal.com',
  }));
  blocks.push({
    _type: 'block',
    _key: key(),
    style: 'normal',
    markDefs,
    children: [
      ...preset.decorators.map((mark) => ({
        _type: 'span',
        _key: key(),
        text: `mark ${mark}`,
        marks: [mark],
      })),
      ...markDefs.map((def) => ({ _type: 'span', _key: key(), text: 'a link', marks: [def._key] })),
    ],
  });
  // What editors type: Shift+Enter, a double Enter (empty paragraph), spaces and a non-breaking space.
  const fidelity = (text: string) => ({
    _type: 'block',
    _key: key(),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  });
  blocks.push(fidelity('line one\nline two'), fidelity(''), fidelity('a\u00a0b  c'));
  return blocks as never;
}

const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
afterEach(() => warn.mockClear());
afterAll(() => warn.mockRestore());

/** Asserts the rendered HTML shows everything the preset offers, as an editor typed it. */
function expectFaithful(html: string, preset: RichTextPreset) {
  expect(warn).not.toHaveBeenCalled();
  const root = document.createElement('div');
  root.innerHTML = html;
  const all = (selector: string) => [...root.querySelectorAll(selector)];
  const withText = (selector: string, text: string) =>
    all(selector).find((el) => el.textContent === text);

  // Shift+Enter is a <br>; a double Enter is one empty line; nbsp survives.
  expect(all('p').some((p) => p.innerHTML === 'line one<br>line two')).toBe(true);
  expect(all('p').some((p) => p.innerHTML === '<br>')).toBe(true);
  expect(root.textContent).toContain('a\u00a0b  c');

  for (const style of preset.styles.filter((s) => s !== 'normal')) {
    expect(withText('*', `style ${style}`), style).toBeDefined();
  }
  for (const mark of preset.decorators) {
    expect(withText(mark, `mark ${mark}`), mark).toBeDefined();
  }
  if (preset.annotations.includes('link')) {
    // validateExternalUrl normalises the origin to `https://www.nextmedal.com/`.
    expect(root.querySelector('a[href^="https://www.nextmedal.com"]')?.textContent).toBe('a link');
  }
  for (const list of preset.lists) {
    const tag = list === 'bullet' ? 'ul' : 'ol';
    const top = all('li').find((li) => li.textContent?.startsWith(`${list} 1`));
    expect(top?.parentElement?.tagName.toLowerCase(), list).toBe(tag);
    expect(top?.querySelector(`${tag} li`)?.textContent, list).toBe(`${list} 2`);
  }
}

describe('the shared renderer supports everything each preset offers', () => {
  it.each(Object.keys(RICH_TEXT_PRESETS) as RichTextPresetName[])('%s', (name) => {
    const preset: RichTextPreset = RICH_TEXT_PRESETS[name];
    const variant = name === 'prose' || name === 'article' ? 'prose' : 'default';
    expectFaithful(
      renderToStaticMarkup(<SharedPortableText value={sample(preset)} variant={variant} />),
      preset
    );
  });
});

const viaShared = (components: PortableTextComponents) =>
  function Rendered({ value }: { value: Sanity.BlockContent }) {
    return <SharedPortableText value={value} components={components} />;
  };

type BlockRenderer = (props: { value: Sanity.BlockContent }) => ReactElement | null;

const FeaturesIntro: BlockRenderer = ({ value }) => (
  <SharedPortableText value={value} variant="intro" />
);

const BLOCK_RENDERERS: [string, BlockRenderer, RichTextPresetName][] = [
  ['Page top', viaShared(buildPortableTextComponents(false)), 'pageTop'],
  ['Features intro', FeaturesIntro, 'section'],
  ['Pricing tier', viaShared(pricingTierComponents), 'tier'],
  ['Footer tagline and copyright', FooterRichText, 'plainLink'],
  ['Text block', Content, 'prose'],
  ['Article body', Content, 'article'],
];

describe('each block renders its field preset faithfully', () => {
  it.each(BLOCK_RENDERERS)('%s', (_, Renderer, presetName) => {
    const preset: RichTextPreset = RICH_TEXT_PRESETS[presetName];
    expectFaithful(renderToStaticMarkup(<Renderer value={sample(preset)} />), preset);
  });
});

describe('block renderers depend only on what their field offers', () => {
  it('Page top styles only the styles pageTop offers', () => {
    const styles = Object.keys(buildPortableTextComponents(false).block ?? {});
    expect(
      styles.every((s) => (RICH_TEXT_PRESETS.pageTop.styles as readonly string[]).includes(s))
    ).toBe(true);
  });
});

const fieldMembers = (typeName: string, fieldName: string) =>
  (schemaTypes as unknown as SchemaType[])
    .find((type) => type.name === typeName)
    ?.fields?.find((field) => field.name === fieldName)?.of ?? [];

describe('fields hold what their stored content uses', () => {
  it('the Text block offers prose and keeps pictures (Features page stores one)', () => {
    const members = fieldMembers('richtext', 'content');
    expect(members.map((member) => member.type)).toEqual(['block', 'image']);
    expect(offered(members[0])).toEqual(presetShape(RICH_TEXT_PRESETS.prose));
  });

  it('the Text block renders a stored picture', () => {
    const html = renderToStaticMarkup(
      <Content
        value={
          [
            {
              _type: 'image',
              _key: '7f86c527e3f3',
              asset: { _type: 'reference', _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-1200x800-png' },
            },
          ] as never
        }
      />
    );
    expect(warn).not.toHaveBeenCalled();
    expect(html).toContain('<img');
  });

  it('a pricing tier offers the tier preset (features list)', () => {
    expect(offered(fieldMembers('pricing', 'content')[0])).toEqual(
      presetShape(RICH_TEXT_PRESETS.tier)
    );
  });
});

describe('the internationalized blockContent field', () => {
  it('offers the plain preset with links (footer copyright)', () => {
    const members = blockContentField.of as unknown as Member[];
    expect(members.map((member) => offered(member))).toEqual([
      presetShape(RICH_TEXT_PRESETS.plainLink),
    ]);
  });

  const copyright = (markDef: Record<string, unknown>) =>
    [
      {
        _type: 'block',
        _key: 'c',
        style: 'normal',
        markDefs: [{ _type: 'link', _key: 'l', ...markDef }],
        children: [
          { _type: 'span', _key: 'a', text: '© 2026 ', marks: [] },
          { _type: 'span', _key: 'b', text: 'Medal Social', marks: ['l'] },
          { _type: 'span', _key: 'c', text: '. All rights reserved.', marks: [] },
        ],
      },
    ] as never;

  it.each([
    ['a stored href link', { href: 'https://www.medalsocial.com' }, 'https://www.medalsocial.com/'],
    [
      'an external link',
      { type: 'external', external: 'https://www.medalsocial.com' },
      'https://www.medalsocial.com/',
    ],
    [
      'an internal link',
      { type: 'internal', internal: { _type: 'page', metadata: { slug: { current: 'pricing' } } } },
      '/pricing',
    ],
  ])('the footer copyright renders %s', (_, markDef, href) => {
    const html = renderToStaticMarkup(<FooterRichText value={copyright(markDef)} />);
    const root = document.createElement('div');
    root.innerHTML = html;
    expect(root.querySelector('a')?.getAttribute('href')).toBe(href);
    expect(root.querySelector('a')?.textContent).toBe('Medal Social');
    expect(root.textContent).toBe('© 2026 Medal Social. All rights reserved.');
  });

  it('the footer queries resolve copyright link targets', async () => {
    const { FOOTER_SETTINGS_QUERY, SITE_QUERY } = await import('@/sanity/lib/queries');
    for (const query of [FOOTER_SETTINGS_QUERY, SITE_QUERY]) {
      expect(query).toMatch(/"copyright": coalesce\([^\n]*\)\[\]\{[\s\S]*?markDefs\[\]\{/);
    }
  });

  it('is the field registered in sanity.config.ts', () => {
    const config = readFileSync(join(process.cwd(), 'sanity.config.ts'), 'utf-8');
    expect(config).toMatch(/internationalizedArray\([\s\S]*fieldTypes:[\s\S]*blockContentField,/);
    expect(config).not.toMatch(/name: 'blockContent'/);
  });
});
