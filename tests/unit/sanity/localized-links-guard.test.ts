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

// internalHref/withLocalePrefix already carry the language prefix; next-intl's Link
// would add it again (/nb/nb/...). Such hrefs go through a plain next/link or <a>.
const I18N_LINK = /import\s*\{[^}]*\bLink\b[^}]*\}\s*from\s*['"]@\/i18n\/navigation['"]/;
const PREFIXED_HREF = /\b(?:internalHref|withLocalePrefix)\(/;
const NEXT_LINK = /import\s+\w+\s+from\s*['"]next\/link['"]/;

// Files that import the i18n Link for other links (logo, external) and render
// every internalHref result through next/link.
const BOTH_LINKS_ALLOWED = [
  'blocks/layout/footer/Navigation.tsx',
  'blocks/layout/footer/index.tsx',
];

/** Per-file heuristic: the i18n Link and prefixed hrefs in one file is a double prefix. */
function mixesPrefixedHrefWithI18nLink(source: string, allowed = false): boolean {
  if (!I18N_LINK.test(source) || !PREFIXED_HREF.test(source)) return false;
  return !(allowed && NEXT_LINK.test(source));
}

describe('internal links go through internalLink (spec D4)', () => {
  it.each(files(ROOT).map((f) => [f.slice(ROOT.length + 1), f]))('%s', (_, file) => {
    expect(readFileSync(file, 'utf8').match(RAW)?.[0] ?? null).toBeNull();
  });
});

describe('prefixed hrefs never go through the i18n Link (no /nb/nb/...)', () => {
  it('flags the i18n Link fed with internalHref', () => {
    const bad = `import { Link } from '@/i18n/navigation';\nconst href = internalHref(t, locale);`;
    expect(mixesPrefixedHrefWithI18nLink(bad)).toBe(true);
    expect(mixesPrefixedHrefWithI18nLink(bad, true)).toBe(true);
  });
  it('accepts next/link with internalHref, and allowlisted files that import both', () => {
    const good = `import Link from 'next/link';\nconst href = internalHref(t, locale);`;
    const both = `import NextLink from 'next/link';\nimport { Link } from '@/i18n/navigation';\nconst href = internalHref(t, locale);`;
    expect(mixesPrefixedHrefWithI18nLink(good)).toBe(false);
    expect(mixesPrefixedHrefWithI18nLink(both, true)).toBe(false);
  });
  it.each(files(ROOT).map((f) => [f.slice(ROOT.length + 1), f]))('%s', (name, file) => {
    const source = readFileSync(file, 'utf8');
    expect(mixesPrefixedHrefWithI18nLink(source, BOTH_LINKS_ALLOWED.includes(name))).toBe(false);
  });
});
