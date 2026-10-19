import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import fixtureDocuments from '@tests/fixtures/lean-schema/documents.json';
import { describe, expect, it } from 'vitest';
import { schemaTypes } from '@/sanity/schemaTypes';
import { mapAll } from '$/migrations/lean-schema/map-documents';

/**
 * Vault spec 2026-10-18 D6: removed from the template (forks keep their copies).
 * team: owner decision B (2026-10-19) — its one /components gallery item goes too.
 */
const REMOVED = [
  'contact',
  'breadcrumbs',
  'latest-articles',
  'pricing-comparison',
  'component.library',
  'team',
] as const;

const APP = resolve(__dirname, '../../..');
const read = (file: string) => readFileSync(resolve(APP, file), 'utf8');

type Named = { name: string; fields?: Named[]; of?: Named[]; type?: string };
const registered = new Map((schemaTypes as unknown as Named[]).map((t) => [t.name, t]));

/** Every `_type` stored anywhere in a document, nested ones included. */
function storedTypes(value: unknown, into = new Map<string, number>()): Map<string, number> {
  if (Array.isArray(value)) for (const item of value) storedTypes(item, into);
  else if (value && typeof value === 'object') {
    const type = (value as { _type?: unknown })._type;
    if (typeof type === 'string') into.set(type, (into.get(type) ?? 0) + 1);
    for (const child of Object.values(value)) storedTypes(child, into);
  }
  return into;
}

const afterMigration = storedTypes(mapAll(fixtureDocuments as never));

function galleryItemTypes(): string[] {
  const gallery = registered.get('component-gallery') as Named;
  const groups = gallery.fields?.find((f) => f.name === 'groups');
  const items = groups?.of?.[0]?.fields?.find((f) => f.name === 'items');
  return (items?.of ?? []).map((member) => member.type as string);
}

describe('blocks removed from the template (D6)', () => {
  it.each(REMOVED)('%s is stored nowhere after the lean-schema migration', (type) => {
    expect(afterMigration.get(type) ?? 0).toBe(0);
  });

  it.each(REMOVED)('%s is no longer registered', (type) => {
    expect(registered.has(type)).toBe(false);
  });

  it.each(REMOVED)('%s cannot be added to the component gallery', (type) => {
    expect(galleryItemTypes()).not.toContain(type);
  });

  it.each([
    'src/components/blocks/modules/ModuleRenderer.tsx',
    'src/components/blocks/modules/GalleryModuleRenderer.tsx',
  ])('%s renders none of them', (file) => {
    const source = read(file);
    for (const type of REMOVED) expect(source).not.toContain(`case '${type}'`);
  });

  it('routes, queries and share images no longer know the removed blocks', () => {
    expect(read('src/app/(frontend)/[locale]/[...slug]/page.tsx')).not.toContain(
      'component.library'
    );
    expect(read('src/lib/seo/share-images.ts')).not.toContain('component.library');
    expect(read('src/sanity/lib/queries.ts')).not.toContain("_type == 'breadcrumbs'");
    expect(read('src/sanity/lib/queries.ts')).not.toContain("_type == 'contact'");
    expect(read('src/sanity/lib/queries.ts')).not.toContain("_type == 'team'");
    expect(read('src/lib/seo/share-images.ts')).not.toContain('team.png');
  });
});
