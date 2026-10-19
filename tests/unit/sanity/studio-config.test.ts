import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MUX_ENABLED } from '@/sanity/lib/mux';
import { schemaTypes } from '@/sanity/schemaTypes';

const config = readFileSync(resolve(__dirname, '../../../sanity.config.ts'), 'utf8');

type Node = { type?: string; fields?: Node[]; of?: Node[] };

/** Every field and array-member type a schema type uses, nested ones included. */
function usedTypes(node: Node): string[] {
  return [
    ...(node.type ? [node.type] : []),
    ...(node.fields ?? []).flatMap(usedTypes),
    ...(node.of ?? []).flatMap(usedTypes),
  ];
}

describe('Mux is opt-in (spec D5)', () => {
  it('is off in the template', () => {
    expect(MUX_ENABLED).toBe(false);
  });

  it('no schema type needs the Mux plugin while it is off', () => {
    const users = (schemaTypes as unknown as Array<Node & { name: string }>)
      .filter((type) => usedTypes(type).includes('mux.video'))
      .map((type) => type.name);
    expect(users).toEqual([]);
  });

  it('video starts on YouTube, the only video type while Mux is off', () => {
    type Typed = { name: string; fields?: Array<{ name: string; initialValue?: unknown }> };
    const type = (schemaTypes as unknown as Typed[]).find((t) => t.name === 'video');
    expect(type?.fields?.find((f) => f.name === 'type')?.initialValue).toBe('youtube');
  });

  it('sanity.config.ts adds the Mux plugin only behind MUX_ENABLED', () => {
    const calls = config.match(/muxInput\(/g) ?? [];
    expect(calls).toHaveLength(1);
    expect(config).toMatch(/MUX_ENABLED\s*\?\s*\[\s*muxInput\(/);
  });
});

describe('Studio config', () => {
  it('registers Vision in every environment (the tools list shows it to administrators only)', () => {
    expect(config).not.toMatch(/isDev/);
    expect(config).toMatch(/visionTool\(\{\s*defaultApiVersion: apiVersion\s*\}\)/);
    expect(config).toMatch(/tools:\s*orderStudioTools/);
  });

  it('keeps banners out of the language filter', () => {
    const block = config.slice(config.indexOf('languageFilter('));
    const documentTypes = block.slice(block.indexOf('documentTypes'), block.indexOf(']'));
    expect(documentTypes).not.toContain("'banner'");
  });
});
