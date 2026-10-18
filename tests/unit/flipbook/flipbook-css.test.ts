import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Comments are stripped first (they may contain `{ … }` examples), then statement at-rules.
const css = readFileSync(
  join(process.cwd(), 'src/components/blocks/objects/flipbook/flipbook.css'),
  'utf8'
)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  // Statement at-rules (e.g. a site's `@import` of layer helpers) aren't rules.
  .replace(/@import[^;]*;/g, '');

/** Selector of every rule that sets a --fb-* token. */
function tokenSelectors(): string[] {
  const selectors: string[] = [];
  for (const [, selector = '', body = ''] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (/--fb-[\w-]+\s*:/.test(body)) selectors.push(selector.trim());
  }
  return selectors;
}

describe('flipbook.css token defaults', () => {
  it('only sets --fb-* tokens under zero-specificity :where() selectors', () => {
    // A site's own `.fb { --fb-… }` must win whatever order the stylesheets load in.
    const offenders = tokenSelectors().filter(
      (selector) =>
        !selector.split(',').every((part) => /^(:where\([^)]*\)\s*)+$/.test(part.trim()))
    );
    expect(offenders).toEqual([]);
  });

  it('defines light and dark token defaults', () => {
    const selectors = tokenSelectors();
    expect(selectors).toContain(':where(.fb)');
    expect(selectors).toContain(':where(.dark) :where(.fb)');
  });

  it('keeps the book, footer and thumbnail strip physically left-to-right (RTL books too)', () => {
    const rule = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(([, , body = '']) =>
      /direction:\s*ltr/.test(body)
    );
    const selectors = (rule?.[1] ?? '').split(',').map((s) => s.trim());
    expect(selectors).toEqual(
      expect.arrayContaining(['.fb-stage', '.fb-foot', '.fb-thumbs-track'])
    );
  });

  it('never puts filter or opacity on the 3D sheet (it would mirror the back face)', () => {
    const offenders: string[] = [];
    for (const [, selector = '', body = ''] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (
        /\.lf-leaf(?![\w-])/.test(selector) &&
        !/\.lf-leaf[^,]*\s+\S/.test(selector.trim()) &&
        /(^|;|\s)(filter|opacity)\s*:/.test(body)
      )
        offenders.push(selector.trim());
    }
    expect(offenders).toEqual([]);
  });
});
