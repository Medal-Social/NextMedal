/**
 * Task 35 (Vault plan 2026-10-18): after prod was migrated, the old blocks and
 * the dual-render paths are gone. Kept on purpose: the comparison table's old
 * intro (the /components gallery still stores one) and Mux as an opt-in for the
 * generic video object (spec D5).
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MODULES_QUERY } from '@/sanity/lib/queries';
import { studioDeployment } from '@/sanity/lib/studio-deployment';
import { schemaTypes } from '@/sanity/schemaTypes';
import modulesField from '@/sanity/schemaTypes/fragments/modules';
import * as pageBlocks from '@/sanity/schemaTypes/page-blocks';

const APP = resolve(__dirname, '../../..');
const read = (path: string) => readFileSync(resolve(APP, path), 'utf8');
const registered = (schemaTypes as unknown as Array<{ name: string }>).map((type) => type.name);

describe('legacy blocks are deleted', () => {
  it.each(['videoHero', 'module-options'])('%s is not a registered schema type', (name) => {
    expect(registered).not.toContain(name);
  });

  it('the page modules array accepts only the 14 blocks and the developer showcase', () => {
    const accepted = (modulesField as unknown as { of: Array<{ type: string }> }).of.map(
      (member) => member.type
    );
    expect(accepted.sort()).toEqual(
      [...pageBlocks.PAGE_BLOCK_NAMES, ...pageBlocks.DEVELOPER_BLOCK_NAMES].sort()
    );
  });

  it('page-blocks.ts has no deprecated list left', () => {
    expect(Object.keys(pageBlocks)).not.toContain('DEPRECATED_BLOCK_NAMES');
  });

  it('the component gallery does not offer videoHero', () => {
    expect(read('src/sanity/schemaTypes/modules/utility/component-gallery.ts')).not.toMatch(
      /videoHero/
    );
  });

  it('no query branch or renderer for videoHero', () => {
    expect(MODULES_QUERY).not.toMatch(/videoHero/);
    for (const file of [
      'src/components/blocks/modules/ModuleRenderer.tsx',
      'src/components/blocks/modules/GalleryModuleRenderer.tsx',
      'src/lib/seo/share-images.ts',
    ])
      expect(read(file), file).not.toMatch(/videoHero|VideoHero/);
  });

  it.each([
    'src/sanity/schemaTypes/modules/hero/video-hero.ts',
    'src/components/blocks/modules/hero/VideoHero.tsx',
    'src/sanity/schemaTypes/objects/module-options.tsx',
    'src/sanity/schemaTypes/modules/ui/uid-input.tsx',
    'src/sanity/schemaTypes/modules/ui/UidInputComponent.tsx',
  ])('%s is deleted', (file) => {
    expect(existsSync(resolve(APP, file))).toBe(false);
  });
});

describe('no leftovers', () => {
  it.each(['en', 'nb', 'ar'])(
    '%s messages have no video namespace (VideoHero was its only reader)',
    (locale) => {
      const messages = JSON.parse(read(`src/messages/${locale}.json`)) as Record<string, unknown>;
      expect(messages.video).toBeUndefined();
    }
  );

  it('the hosted Studio app id is used only for the NextMedal project (forks deploy their own)', () => {
    expect(studioDeployment('ekjn2yf6', '')).toEqual({ appId: 'jouu0fkhamrp3bb4jrv5u43z' });
    expect(studioDeployment('fork1234', '')).toBeUndefined();
    expect(studioDeployment('fork1234', 'forkapp')).toEqual({ appId: 'forkapp' });
    expect(read('sanity.cli.ts')).toMatch(/deployment: studioDeployment\(projectId\)/);
  });
});

describe('the page top has no Mux path', () => {
  it('Hero.tsx renders a picture or a YouTube video only', () => {
    expect(read('src/components/blocks/modules/hero/Hero.tsx')).not.toMatch(/mux/i);
  });

  it('the Hero type has no stored videoType or muxVideo', () => {
    const types = read('src/types/Sanity.d.ts');
    const hero = types.slice(types.indexOf('interface Hero extends'));
    const body = hero.slice(0, hero.indexOf('\n    }'));
    expect(body).not.toMatch(/muxVideo|'mux'/);
  });
});
