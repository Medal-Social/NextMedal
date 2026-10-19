import { describe, expect, it } from 'vitest';
import { MODULES_QUERY } from '@/sanity/lib/queries';
import hero from '@/sanity/schemaTypes/modules/hero/hero';

/** Page top: a picture or a YouTube link; Mux is opt-in (Vault spec D5, plan Task 17). */
type Field = {
  name: string;
  title?: string;
  description?: string;
  hidden?: unknown;
  validation?: (rule: unknown) => unknown;
};
const fields = (hero as unknown as { fields: Field[] }).fields;
const field = (name: string) => fields.find((f) => f.name === name);

/** Runs a field's `Rule.custom(...)` validator against a value. */
function validate(name: string, value: unknown): unknown {
  let custom: ((v: unknown, ctx: unknown) => unknown) | undefined;
  const rule: Record<string, unknown> = {};
  for (const method of ['required', 'uri', 'warning', 'error', 'max', 'min']) {
    rule[method] = () => rule;
  }
  rule.custom = (fn: typeof custom) => {
    custom = fn;
    return rule;
  };
  field(name)?.validation?.(rule);
  if (!custom) throw new Error(`${name} has no custom validation`);
  return custom(value, { parent: {} });
}

describe('page top (hero) schema', () => {
  it('has no media type switch and no Mux video', () => {
    expect(field('videoType')).toBeUndefined();
    expect(field('muxVideo')).toBeUndefined();
  });

  it('offers a plain "Video link" that is always visible', () => {
    const videoUrl = field('videoUrl');
    expect(videoUrl?.title).toBe('Video link');
    expect(videoUrl?.description).toBe('A YouTube link. Leave empty to show the picture.');
    expect(videoUrl?.hidden).toBeUndefined();
  });

  it('accepts an empty link or a link to one YouTube video', () => {
    expect(validate('videoUrl', undefined)).toBe(true);
    for (const url of [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/shorts/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
    ]) {
      expect(validate('videoUrl', url)).toBe(true);
    }
  });

  it('refuses channels, playlists, broken ids and other sites', () => {
    for (const url of [
      'https://www.youtube.com/@medalsocial',
      'https://www.youtube.com/playlist?list=PL1234567890abcdef',
      'https://www.youtube.com/watch?v=short',
      'https://vimeo.com/1',
    ]) {
      expect(validate('videoUrl', url)).toBe('Please paste a link to one YouTube video');
    }
  });

  it('previews as a picture or a video link', () => {
    const preview = (
      hero as unknown as {
        preview: {
          select: Record<string, string>;
          prepare: (v: Record<string, unknown>) => { subtitle: string };
        };
      }
    ).preview;
    expect(Object.values(preview.select)).not.toContain('videoType');
    expect(preview.prepare({ videoUrl: 'https://youtu.be/x' }).subtitle).toBe(
      'Page top • Video link'
    );
    expect(preview.prepare({}).subtitle).toBe('Page top • Picture');
  });
});

describe('page top query', () => {
  it('no longer resolves Mux videos for the page top', () => {
    const start = MODULES_QUERY.indexOf("_type == 'hero' =>");
    const end = MODULES_QUERY.indexOf("_type == 'videoHero' =>");
    expect(start).toBeGreaterThan(-1);
    const branch = MODULES_QUERY.slice(start, end > start ? end : undefined);
    expect(branch).not.toContain('muxVideo');
    expect(branch).toContain('image {');
  });
});
