import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(__dirname, '../../../src/components');
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });

// A menu/CTA/rich-text link target resolved without localizedTarget ignores the visitor's language.
const RAW = /resolve(?:Url(?:Sync)?|Slug)\(\s*(?:\{[^}]*\binternal\b|(?:[\w.]+\.)?internal\b)/;

describe('internal links go through internalLink (spec D4)', () => {
  it.each(files(ROOT).map((f) => [f.slice(ROOT.length + 1), f]))('%s', (_, file) => {
    expect(readFileSync(file, 'utf8').match(RAW)?.[0] ?? null).toBeNull();
  });
});
