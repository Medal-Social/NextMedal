import docs from '@tests/fixtures/lean-schema/documents.json';
import { describe, expect, it } from 'vitest';
import { schemaTypes } from '@/sanity/schemaTypes';
import { RICH_TEXT_PRESETS } from '@/sanity/schemaTypes/fragments/rich-text';
import { PAGE_BLOCK_NAMES } from '@/sanity/schemaTypes/page-blocks';
import {
  type AnyModule,
  FIELD_PRESETS,
  KEEP,
  mapModule,
  PRESETS,
  stripCtaStyles,
  UnmappedContentError,
} from '$/migrations/lean-schema/map-modules';

type Doc = { _id: string; _type: string; modules?: AnyModule[] };
const ALL = docs as Doc[];
const moduleOf = (id: string, key: string) =>
  ALL.find((d) => d._id === id)?.modules?.find((m) => m._key === key) as AnyModule;
const HOME = 'fa5f631e-545e-4fc2-b6b9-bebcd32dd29e';

type Field = {
  name: string;
  type?: string;
  hidden?: unknown;
  deprecated?: unknown;
  fields?: Field[];
  of?: Array<Field & { styles?: Array<{ value: string }> }>;
};
type Schema = { name: string; fields?: Field[] };
const registered = new Map((schemaTypes as unknown as Schema[]).map((t) => [t.name, t]));
const editorFields = (fields: Field[] = []) =>
  fields.filter((f) => f.hidden !== true && !f.deprecated).map((f) => f.name);

describe('KEEP is the schema', () => {
  it.each(PAGE_BLOCK_NAMES)('%s', (name) => {
    expect([...(KEEP[name] ?? [])].sort()).toEqual(
      editorFields(registered.get(name)?.fields).sort()
    );
  });
});

/** The schema field behind a FIELD_PRESETS key: `type.field` or `type.items.field`. */
function schemaField(key: string): Field | undefined {
  const [type, ...path] = key.split('.');
  let fields = registered.get(type)?.fields;
  let field: Field | undefined;
  for (const name of path) {
    field = fields?.find((f) => f.name === name);
    fields = field?.of?.find((m) => m.type === 'object' || m.fields)?.fields ?? field?.fields;
  }
  return field;
}

describe('rich-text presets are the Studio presets', () => {
  it.each(Object.keys(PRESETS))('%s matches RICH_TEXT_PRESETS', (name) => {
    const studio = RICH_TEXT_PRESETS[name as keyof typeof RICH_TEXT_PRESETS];
    const ours = PRESETS[name];
    expect([...ours.styles].sort()).toEqual([...studio.styles].sort());
    expect([...ours.lists].sort()).toEqual([...studio.lists].sort());
    expect([...ours.decorators].sort()).toEqual([...studio.decorators].sort());
    expect(ours.links).toBe((studio.annotations as readonly string[]).includes('link'));
  });

  it.each(Object.entries(FIELD_PRESETS))('%s uses the %s preset in the schema', (key, preset) => {
    const field = schemaField(key);
    const block = field?.of?.find((m) => m.type === 'block');
    expect(block, key).toBeTruthy();
    expect((block?.styles ?? []).map((s) => s.value).sort()).toEqual(
      [...PRESETS[preset].styles].sort()
    );
  });
});

describe('page top', () => {
  it('drops options, videoType and button styles; keeps text, buttons and picture', () => {
    const out = mapModule(moduleOf(HOME, '79774f24d2c8'));
    expect(out).toMatchObject({ _type: 'hero', _key: '79774f24d2c8' });
    expect(out).not.toHaveProperty('options');
    expect(out).not.toHaveProperty('videoType');
    expect(JSON.stringify(out.ctas)).not.toContain('"style"');
    expect(JSON.stringify(out.ctas)).toContain('Check features');
    expect(out.image).toEqual(moduleOf(HOME, '79774f24d2c8').image);
  });

  it('keeps a video link and the description of the picture', () => {
    const image = { _type: 'img', image: { _type: 'image', asset: { _ref: 'image-a' } }, alt: 'A' };
    expect(
      mapModule({
        _type: 'hero',
        _key: 'h',
        videoType: 'youtube',
        videoUrl: 'https://youtu.be/x',
        image,
      })
    ).toEqual({ _type: 'hero', _key: 'h', videoUrl: 'https://youtu.be/x', image });
  });

  it('refuses a picture field it does not know', () => {
    expect(() =>
      mapModule({ _type: 'hero', _key: 'h', image: { _type: 'img', image: {}, caption: 'x' } })
    ).toThrow(UnmappedContentError);
  });

  it('videoHero becomes a page top (YouTube → video link, thumbnail → picture)', () => {
    expect(
      mapModule({
        _type: 'videoHero',
        _key: 'v',
        type: 'youtube',
        videoId: 'dQw4w9WgXcQ',
        thumbnail: { _type: 'image', asset: { _ref: 'image-a' } },
      })
    ).toEqual({
      _type: 'hero',
      _key: 'v',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      image: { _type: 'img', image: { _type: 'image', asset: { _ref: 'image-a' } } },
    });
  });

  it('videoHero: a stored full YouTube link (the field took "URL or ID") keeps its video', () => {
    for (const videoId of [
      'https://youtu.be/dQw4w9WgXcQ',
      ' https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3 ',
    ]) {
      expect(mapModule({ _type: 'videoHero', _key: 'v', type: 'youtube', videoId })).toEqual({
        _type: 'hero',
        _key: 'v',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      });
    }
  });

  it('videoHero: refuses a YouTube value that is neither a video link nor an id', () => {
    for (const videoId of ['https://www.youtube.com/@channel', 'not an id']) {
      expect(() => mapModule({ _type: 'videoHero', _key: 'v', type: 'youtube', videoId })).toThrow(
        UnmappedContentError
      );
    }
  });

  it('a Mux videoHero with no video becomes an empty page top', () => {
    expect(mapModule({ _type: 'videoHero', _key: 'v', type: 'mux' })).toEqual({
      _type: 'hero',
      _key: 'v',
    });
  });

  it('refuses a filled Mux video (Mux is opt-in now)', () => {
    expect(() =>
      mapModule({ _type: 'hero', _key: 'h', muxVideo: { asset: { _ref: 'x' } } })
    ).toThrow(UnmappedContentError);
    expect(() =>
      mapModule({ _type: 'videoHero', _key: 'v', type: 'mux', muxVideo: { asset: { _ref: 'x' } } })
    ).toThrow(UnmappedContentError);
  });
});

describe('kept blocks lose their knobs and nothing else', () => {
  it('feature grid: drops options (uid) and the empty item links; refuses a filled item link', () => {
    const out = mapModule(moduleOf(HOME, '89cc2683f1c7'));
    expect(out).not.toHaveProperty('options');
    expect(JSON.stringify(out.items)).not.toContain('"link"');
    expect(() =>
      mapModule({
        _type: 'features',
        _key: 'f',
        items: [
          {
            _key: 'i',
            summary: 'S',
            link: { _type: 'menuItem', label: 'Go', type: 'external', external: 'https://x' },
          },
        ],
      })
    ).toThrow(UnmappedContentError);
  });

  it('questions: drops generateSchema and open (never true); items get their schema type', () => {
    const out = mapModule({
      _type: 'accordion-list',
      _key: 'a',
      generateSchema: false,
      items: [
        { _key: 'i', _type: 'accordion-item', summary: 'Q', open: false },
        { _key: 'j', _type: 'object', summary: 'R' },
        { _key: 'k', summary: 'S', open: false },
      ],
    });
    expect(out).toEqual({
      _type: 'accordion-list',
      _key: 'a',
      items: [
        { _key: 'i', _type: 'accordion-item', summary: 'Q' },
        { _key: 'j', _type: 'accordion-item', summary: 'R' },
        { _key: 'k', _type: 'accordion-item', summary: 'S' },
      ],
    });
    expect(() =>
      mapModule({ _type: 'accordion-list', _key: 'a', items: [{ _key: 'i', open: true }] })
    ).toThrow(UnmappedContentError);
    expect(() =>
      mapModule({ _type: 'accordion-list', _key: 'a', items: [{ _key: 'i', _type: 'team' }] })
    ).toThrow(UnmappedContentError);
  });

  it('comparison table: intro → title (the h2, plain text) + text (the rest)', () => {
    const out = mapModule(moduleOf(HOME, 'd7245caaa871'));
    expect(out.title).toBe('Why NextMedal Outperforms the Rest');
    expect((out.text as unknown[]).length).toBe(1);
    expect(out).not.toHaveProperty('intro');
    expect(JSON.stringify(out.products)).toContain('"_type":"comparison-product"');
    expect(JSON.stringify(out.features)).toContain('"_type":"comparison-feature-row"');
  });

  it('comparison table: refuses an intro that does not start with one plain heading', () => {
    const p = (text: string, extra = {}) => ({
      _type: 'block',
      _key: text,
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: `${text}s`, text, marks: [] }],
      ...extra,
    });
    const bad = [
      [p('x')],
      [p('t', { style: 'h2', children: [{ _type: 'span', text: 't', marks: ['strong'] }] })],
      [p('t', { style: 'h2' }), p('h', { style: 'h3' })],
      [p('t', { style: 'h2' }), p('l', { listItem: 'bullet' })],
    ];
    for (const intro of bad) {
      expect(() => mapModule({ _type: 'product-comparison', _key: 'p', intro })).toThrow(
        UnmappedContentError
      );
    }
    expect(() =>
      mapModule({
        _type: 'product-comparison',
        _key: 'p',
        title: 'T',
        intro: [p('t', { style: 'h2' })],
      })
    ).toThrow(UnmappedContentError);
  });

  it('lists keep only the intro', () => {
    const out = mapModule({
      _type: 'events-frontpage',
      _key: 'e',
      layout: 'calendar',
      limit: 12,
      showRssLink: true,
      intro: [{ _type: 'block', _key: 'b', style: 'normal', children: [] }],
    });
    expect(Object.keys(out).sort()).toEqual(['_key', '_type', 'intro']);
    expect(
      mapModule({ _type: 'articles-frontpage', _key: 'a', limit: 12, displayFilters: true })
    ).toEqual({ _type: 'articles-frontpage', _key: 'a' });
  });

  it('text: keeps pictures; refuses styles the Text block no longer offers', () => {
    const image = { _type: 'image', _key: 'i', asset: { _ref: 'image-a' } };
    expect(mapModule({ _type: 'richtext', _key: 'r', content: [image] }).content).toEqual([image]);
    expect(() =>
      mapModule({
        _type: 'richtext',
        _key: 'r',
        content: [{ _type: 'block', style: 'h5', children: [] }],
      })
    ).toThrow(UnmappedContentError);
    expect(() =>
      mapModule({ _type: 'richtext', _key: 'r', content: [{ _type: 'code', _key: 'c' }] })
    ).toThrow(UnmappedContentError);
  });

  it('refuses rich text the field no longer offers (link in a plain answer, a list in an intro)', () => {
    const linked = {
      _type: 'block',
      style: 'normal',
      markDefs: [{ _key: 'l', _type: 'link', href: 'https://x' }],
      children: [{ _type: 'span', text: 'x', marks: ['l'] }],
    };
    expect(() =>
      mapModule({
        _type: 'accordion-list',
        _key: 'a',
        items: [{ _key: 'i', summary: 'Q', content: [linked] }],
      })
    ).toThrow(UnmappedContentError);
    expect(() =>
      mapModule({
        _type: 'callout',
        _key: 'c',
        content: [{ _type: 'block', style: 'normal', listItem: 'bullet', children: [] }],
      })
    ).toThrow(UnmappedContentError);
  });

  it('refuses filled unknown fields and unknown types', () => {
    expect(() => mapModule({ _type: 'callout', _key: 'c', mystery: 'x' })).toThrow(
      UnmappedContentError
    );
    expect(() => mapModule({ _type: 'team', _key: 't' })).toThrow(UnmappedContentError);
  });

  it('the developer gallery keeps everything except button styles', () => {
    const gallery = {
      _type: 'component-gallery',
      _key: 'g',
      groups: [
        {
          _key: 'x',
          items: [
            {
              _type: 'hero',
              _key: 'h',
              options: { bgFrom: 'a' },
              ctas: [{ _type: 'cta', _key: 'c', style: 'ghost', link: {} }],
            },
          ],
        },
      ],
    };
    expect(mapModule(gallery)).toEqual(stripCtaStyles(gallery));
    expect(JSON.stringify(mapModule(gallery))).toContain('"bgFrom"');
    expect(JSON.stringify(mapModule(gallery))).not.toContain('"style"');
  });

  it('the developer gallery turns an old video page top into a page top (its renderer is deleted)', () => {
    const gallery = {
      _type: 'component-gallery',
      _key: 'g',
      groups: [
        {
          _key: 'x',
          items: [
            { _type: 'videoHero', _key: 'v', type: 'youtube', videoId: 'dQw4w9WgXcQ' },
            { _type: 'features', _key: 'f' },
          ],
        },
      ],
    };
    const once = mapModule(gallery);
    expect(once).toEqual({
      ...gallery,
      groups: [
        {
          _key: 'x',
          items: [
            { _type: 'hero', _key: 'v', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
            { _type: 'features', _key: 'f' },
          ],
        },
      ],
    });
    expect(mapModule(once)).toEqual(once);
  });

  it('the developer gallery drops its Team item (team block deleted, owner decision B)', () => {
    const gallery = {
      _type: 'component-gallery',
      _key: 'g',
      groups: [
        {
          _key: 'x',
          _type: 'component-group',
          title: 'Content blocks',
          items: [
            { _type: 'features', _key: 'f' },
            { _type: 'team', _key: 't', pretitle: 'Meet the Team' },
            { _type: 'logo-cloud', _key: 'l' },
          ],
        },
      ],
    };
    const once = mapModule(gallery);
    expect(once).toEqual({
      ...gallery,
      groups: [
        {
          ...gallery.groups[0],
          items: [
            { _type: 'features', _key: 'f' },
            { _type: 'logo-cloud', _key: 'l' },
          ],
        },
      ],
    });
    expect(mapModule(once)).toEqual(once);
  });
});

describe('stripCtaStyles', () => {
  it('removes style from buttons at any depth and nothing else', () => {
    const value = {
      style: 'keep',
      a: [{ _type: 'cta', style: 'ghost', link: { style: 'keep' } }],
      b: { _type: 'block', style: 'h2' },
    };
    expect(stripCtaStyles(value)).toEqual({
      style: 'keep',
      a: [{ _type: 'cta', link: { style: 'keep' } }],
      b: { _type: 'block', style: 'h2' },
    });
  });
});

const cases = ALL.filter((d) => d._type === 'page').flatMap((p) =>
  (p.modules ?? []).map((m) => [`${p._id} ${m._type} ${m._key}`, m] as const)
);

describe('every production module', () => {
  it('covers all 76 stored modules', () => {
    expect(cases).toHaveLength(76);
  });

  it.each(cases)('maps without throwing and idempotently: %s', (_, module) => {
    const once = mapModule(module);
    expect(mapModule(once)).toEqual(once);
    expect([...PAGE_BLOCK_NAMES, 'component-gallery']).toContain(once._type);
  });
});
