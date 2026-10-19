import { describe, expect, it } from 'vitest';
import {
  ARTICLE_PLACEMENT_SCOPE,
  PAGE_PLACEMENT_SCOPE,
  PLACEMENT_SCOPES,
} from '@/lib/sanity/placement-scopes';
import { COLLECTION_ARTICLE_POST_QUERY, PAGE_QUERY } from '@/sanity/lib/queries';
import placement from '@/sanity/schemaTypes/documents/shared/placement';

/**
 * A placement only shows where a route asks for its scope. The download offer
 * stored scope "blog.post", which no route asked for (Vault plan, R2 corrections).
 */
describe('placement scopes', () => {
  it('the Studio offers exactly the shared scopes', () => {
    const scope = placement.fields.find((f) => f.name === 'scope') as unknown as {
      options: { list: Array<{ value: string }> };
    };
    expect(scope.options.list.map((o) => o.value)).toEqual([...PLACEMENT_SCOPES]);
  });

  it('article pages ask for the "Articles" placements', () => {
    expect(ARTICLE_PLACEMENT_SCOPE).toBe('articles-frontpage');
    expect(COLLECTION_ARTICLE_POST_QUERY).toContain(
      `'placements': *[_type == 'placement' && (scope == '${ARTICLE_PLACEMENT_SCOPE}')]`
    );
  });

  it('pages ask for the "All pages" placements', () => {
    expect(PAGE_QUERY).toContain(
      `'placements': *[_type == 'placement' && (scope == '${PAGE_PLACEMENT_SCOPE}')]`
    );
  });

  it('every scope a query asks for is one the Studio offers', () => {
    const asked = [COLLECTION_ARTICLE_POST_QUERY, PAGE_QUERY].flatMap((q) =>
      [...q.matchAll(/_type == 'placement' && \(scope == '([^']+)'\)/g)].map((m) => m[1])
    );
    expect(asked.length).toBeGreaterThan(1);
    for (const s of asked) expect(PLACEMENT_SCOPES).toContain(s);
  });
});
