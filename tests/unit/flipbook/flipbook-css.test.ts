import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Comments are stripped first: they may contain `{ … }` examples.
const css = readFileSync(
  join(process.cwd(), 'src/components/blocks/objects/flipbook/flipbook.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

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
});
