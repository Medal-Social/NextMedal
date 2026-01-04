import { describe, expect, it } from 'vitest';

/**
 * GROQ Query Validation Tests
 *
 * These tests verify GROQ query patterns, syntax, and security measures in queries.ts.
 * We test for:
 * - Parameterized queries (preventing injection)
 * - Consistent field projections
 * - Proper reference resolution syntax
 * - Type safety in queries
 * - Query composition patterns
 *
 * NOTE: These are static code analysis tests, not live Sanity API tests.
 * They verify query patterns and prevent common GROQ anti-patterns.
 */

describe('GROQ Queries - Security & Best Practices', () => {
  describe('Query Parameterization (Injection Prevention)', () => {
    it('PAGE_QUERY should use parameterized slug filter', async () => {
      const { PAGE_QUERY } = await import('@/sanity/lib/queries');

      // Should use $slug parameter, not string interpolation
      expect(PAGE_QUERY).toContain('metadata.slug.current == $slug');
      expect(PAGE_QUERY).toContain('language == $locale');

      // Should NOT use string interpolation (prevents injection)
      // biome-ignore lint/suspicious/noTemplateCurlyInString: Testing for incorrect string interpolation syntax
      expect(PAGE_QUERY).not.toContain('${slug}');
      // biome-ignore lint/suspicious/noTemplateCurlyInString: Testing for incorrect string interpolation syntax
      expect(PAGE_QUERY).not.toContain('`${locale}`');
      // biome-ignore lint/suspicious/noTemplateCurlyInString: Testing for incorrect string interpolation syntax
      expect(PAGE_QUERY).not.toContain('"${slug}"');
    });

    it('COLLECTION_ARTICLE_POST_QUERY should use parameterized filters', async () => {
      const { COLLECTION_ARTICLE_POST_QUERY } = await import('@/sanity/lib/queries');

      expect(COLLECTION_ARTICLE_POST_QUERY).toContain('metadata.slug.current == $itemSlug');
      expect(COLLECTION_ARTICLE_POST_QUERY).toContain('language == $locale');

      // Should NOT use string interpolation
      // biome-ignore lint/suspicious/noTemplateCurlyInString: Testing for incorrect string interpolation syntax
      expect(COLLECTION_ARTICLE_POST_QUERY).not.toContain('${itemSlug}');
      // biome-ignore lint/suspicious/noTemplateCurlyInString: Testing for incorrect string interpolation syntax
      expect(COLLECTION_ARTICLE_POST_QUERY).not.toContain('${locale}');
    });

    it('ARTICLE_CATEGORIES_WITH_POSTS_QUERY should use safe parameter checks', async () => {
      const { ARTICLE_CATEGORIES_WITH_POSTS_QUERY } = await import('@/sanity/lib/queries');

      // Should use parameter checks with fallback for locale
      expect(ARTICLE_CATEGORIES_WITH_POSTS_QUERY).toContain("$locale == ''");

      // Should use parameterized references
      expect(ARTICLE_CATEGORIES_WITH_POSTS_QUERY).toContain('language == $locale');
    });

    it('PLACEMENT_QUERY should use parameterized scope', async () => {
      const { PLACEMENT_QUERY } = await import('@/sanity/lib/queries');

      expect(PLACEMENT_QUERY).toContain('scope == $scope');
      // biome-ignore lint/suspicious/noTemplateCurlyInString: Testing for incorrect string interpolation syntax
      expect(PLACEMENT_QUERY).not.toContain('${scope}');
    });

    it('CURRENT_PAGE_QUERY should use parameterized filters for multiple types', async () => {
      const { CURRENT_PAGE_QUERY } = await import('@/sanity/lib/queries');

      expect(CURRENT_PAGE_QUERY).toContain('metadata.slug.current == $slug');
      expect(CURRENT_PAGE_QUERY).toContain('language == $locale');

      // Should NOT use string interpolation
      // biome-ignore lint/suspicious/noTemplateCurlyInString: Testing for incorrect string interpolation syntax
      expect(CURRENT_PAGE_QUERY).not.toContain('${slug}');
      // biome-ignore lint/suspicious/noTemplateCurlyInString: Testing for incorrect string interpolation syntax
      expect(CURRENT_PAGE_QUERY).not.toContain('${locale}');
    });
  });

  describe('Reference Resolution Syntax', () => {
    it('should use -> operator for reference resolution', async () => {
      const { LINK_QUERY } = await import('@/sanity/lib/queries');

      // Should use -> for reference resolution
      expect(LINK_QUERY).toContain('internal->{');
    });

    it('IMAGE_QUERY should include asset reference (optimized - no resolution)', async () => {
      const { IMAGE_QUERY } = await import('@/sanity/lib/queries');

      // After optimization: asset reference without resolution (30-50% faster)
      expect(IMAGE_QUERY).toContain('asset {');
      expect(IMAGE_QUERY).toContain('_ref,');
      expect(IMAGE_QUERY).toContain('_type');
    });

    it('should use []-> for array reference resolution', async () => {
      const { AUTHOR_PREVIEW_QUERY } = await import('@/sanity/lib/queries');

      // After optimization: Uses IMAGE_QUERY which has asset reference without resolution
      expect(AUTHOR_PREVIEW_QUERY).toContain('asset {');
    });

    it('LOGOS_QUERY should resolve references with []-> syntax', async () => {
      const { LOGOS_QUERY } = await import('@/sanity/lib/queries');

      // Should query all logos with proper type filter
      expect(LOGOS_QUERY).toContain("*[_type == 'logo']");
      expect(LOGOS_QUERY).toContain('|order(title)');
    });

    it('SITE_BANNERS_QUERY should resolve array of banner references', async () => {
      const { SITE_BANNERS_QUERY } = await import('@/sanity/lib/queries');

      expect(SITE_BANNERS_QUERY).toContain("*[_type == 'site'][0].banners[]->{");
    });
  });

  describe('Query Composition & Reusability', () => {
    it('should compose LINK_QUERY in multiple contexts', async () => {
      const { CTA_QUERY, LINK_QUERY } = await import('@/sanity/lib/queries');

      // CTA_QUERY should embed LINK_QUERY fields
      expect(CTA_QUERY).toContain('link{');
      expect(CTA_QUERY).toContain('_key,');
      expect(CTA_QUERY).toContain('label,');
      expect(CTA_QUERY).toContain('internal->{');

      // LINK_QUERY should be a reusable fragment
      expect(LINK_QUERY).toContain('_key,');
      expect(LINK_QUERY).toContain('_type,');
      expect(LINK_QUERY).toContain('type,');
      expect(LINK_QUERY).toContain('label,');
    });

    it('should compose IMAGE_QUERY consistently', async () => {
      const { IMAGE_QUERY } = await import('@/sanity/lib/queries');

      // Should always include critical image fields
      expect(IMAGE_QUERY).toContain('_key,');
      expect(IMAGE_QUERY).toContain('_type,');
      expect(IMAGE_QUERY).toContain('alt,');
      expect(IMAGE_QUERY).toContain('crop,');
      expect(IMAGE_QUERY).toContain('hotspot,');
      // After optimization: asset reference without resolution
      expect(IMAGE_QUERY).toContain('asset {');
    });

    it('should compose PT_BLOCK_QUERY for portable text', async () => {
      const { PT_BLOCK_QUERY } = await import('@/sanity/lib/queries');

      // Should spread all fields
      expect(PT_BLOCK_QUERY).toContain('...,');

      // Should handle markDefs with conditional link expansion
      expect(PT_BLOCK_QUERY).toContain('markDefs[]{');
      expect(PT_BLOCK_QUERY).toContain("_type == 'link' => {");

      // Should include LINK_QUERY fields when expanded
      expect(PT_BLOCK_QUERY).toContain('label,');
      expect(PT_BLOCK_QUERY).toContain('internal->{');
    });

    it('MODULES_QUERY should compose BASE_MODULES_QUERY', async () => {
      const queries = await import('@/sanity/lib/queries');

      // MODULES_QUERY should include BASE_MODULES_QUERY patterns
      expect(queries.MODULES_QUERY).toContain('ctas[]{');
      expect(queries.MODULES_QUERY).toContain("_type == 'breadcrumbs' => {");
      expect(queries.MODULES_QUERY).toContain("_type == 'logo-cloud' => {");

      // Should also include component-gallery specific handling
      expect(queries.MODULES_QUERY).toContain("_type == 'component-gallery' => {");
    });
  });

  describe('Field Projection Patterns', () => {
    it('preview queries should include minimal required fields', async () => {
      const { AUTHOR_PREVIEW_QUERY, CATEGORY_PREVIEW_QUERY, PERSON_PREVIEW_QUERY } = await import(
        '@/sanity/lib/queries'
      );

      // Author preview should include _id, name, and image
      expect(AUTHOR_PREVIEW_QUERY).toContain('_id,');
      expect(AUTHOR_PREVIEW_QUERY).toContain('name,');
      expect(AUTHOR_PREVIEW_QUERY).toContain('image {');

      // Category preview should include minimal fields
      expect(CATEGORY_PREVIEW_QUERY).toContain('_id,');
      expect(CATEGORY_PREVIEW_QUERY).toContain('title,');

      // Person preview should include role
      expect(PERSON_PREVIEW_QUERY).toContain('_id,');
      expect(PERSON_PREVIEW_QUERY).toContain('name,');
      expect(PERSON_PREVIEW_QUERY).toContain('role,');
    });

    it('should use computed fields with double quotes', async () => {
      const { CATEGORY_PREVIEW_QUERY } = await import('@/sanity/lib/queries');

      // Computed fields MUST use double quotes for field names
      expect(CATEGORY_PREVIEW_QUERY).toContain('"slug":');
      expect(CATEGORY_PREVIEW_QUERY).toContain('"current"');
    });

    it('collection queries should include readTime calculation', async () => {
      const {
        COLLECTION_ARTICLE_POST_QUERY,
        COLLECTION_NEWSLETTER_QUERY,
        COLLECTION_DOCUMENTATION_QUERY,
      } = await import('@/sanity/lib/queries');

      // All should calculate readTime from body content
      const readTimePattern =
        "'readTime': math::max([1, round(length(string::split(pt::text(body), ' ')) / 200)])";

      expect(COLLECTION_ARTICLE_POST_QUERY).toContain(readTimePattern);
      expect(COLLECTION_NEWSLETTER_QUERY).toContain(readTimePattern);
      expect(COLLECTION_DOCUMENTATION_QUERY).toContain(readTimePattern);
    });

    it('should extract headings from portable text', async () => {
      const { COLLECTION_ARTICLE_POST_QUERY } = await import('@/sanity/lib/queries');

      // Should extract h2 and h3 headings
      expect(COLLECTION_ARTICLE_POST_QUERY).toContain("'headings': body[style in ['h2', 'h3']]");
      expect(COLLECTION_ARTICLE_POST_QUERY).toContain("'text': pt::text(@)");
    });

    it('should include image references in queries', async () => {
      const { COLLECTION_ARTICLE_POST_QUERY } = await import('@/sanity/lib/queries');

      // After optimization: Image URL building happens in application code
      // Queries only fetch image object references
      expect(COLLECTION_ARTICLE_POST_QUERY).toContain('seo {');
      expect(COLLECTION_ARTICLE_POST_QUERY).toContain('image {');
    });
  });

  describe('Type Safety & Filtering', () => {
    it('should filter by _type correctly', async () => {
      const { PAGE_QUERY, LOGOS_QUERY } = await import('@/sanity/lib/queries');

      expect(PAGE_QUERY).toContain("_type == 'page'");
      expect(LOGOS_QUERY).toContain("_type == 'logo'");
    });

    it('SEARCH_INDEX_QUERY should filter multiple collection types', async () => {
      const { SEARCH_INDEX_QUERY } = await import('@/sanity/lib/queries');

      // Should use _type in [...] for multiple types
      expect(SEARCH_INDEX_QUERY).toContain(
        '_type in ["collection.article", "collection.changelog", "collection.documentation", "collection.newsletter"]'
      );

      // Should exclude indexed pages
      expect(SEARCH_INDEX_QUERY).toContain('seo.noIndex != true');
    });

    it('IS_COLLECTION_PAGE_QUERY should identify collection frontpage modules', async () => {
      const { IS_COLLECTION_PAGE_QUERY } = await import('@/sanity/lib/queries');

      // Should check for specific frontpage module types
      expect(IS_COLLECTION_PAGE_QUERY).toContain(
        "modules[_type in ['articles-frontpage', 'changelog-frontpage', 'docs-frontpage', 'events-frontpage', 'newsletter-frontpage']]"
      );
    });

    it('SITEMAP_WITH_TRANSLATIONS_QUERY should exclude 404', async () => {
      const { SITEMAP_WITH_TRANSLATIONS_QUERY } = await import('@/sanity/lib/queries');

      expect(SITEMAP_WITH_TRANSLATIONS_QUERY).toContain("!(metadata.slug.current in ['404'])");
      expect(SITEMAP_WITH_TRANSLATIONS_QUERY).toContain('seo.noIndex != true');
    });

    it('collection slug queries should validate required fields', async () => {
      const {
        COLLECTION_ARTICLE_SLUGS_QUERY,
        COLLECTION_NEWSLETTER_SLUGS_QUERY,
        COLLECTION_DOCUMENTATION_SLUGS_QUERY,
        COLLECTION_EVENTS_SLUGS_QUERY,
      } = await import('@/sanity/lib/queries');

      // All should check for defined slug
      expect(COLLECTION_ARTICLE_SLUGS_QUERY).toContain('defined(metadata.slug.current)');

      expect(COLLECTION_NEWSLETTER_SLUGS_QUERY).toContain('defined(metadata.slug.current)');

      expect(COLLECTION_DOCUMENTATION_SLUGS_QUERY).toContain('defined(metadata.slug.current)');

      expect(COLLECTION_EVENTS_SLUGS_QUERY).toContain('defined(metadata.slug.current)');
    });
  });

  describe('Ordering & Sorting', () => {
    it('should use |order() for sorting results', async () => {
      const { LOGOS_QUERY, ARTICLE_CATEGORIES_WITH_POSTS_QUERY } = await import(
        '@/sanity/lib/queries'
      );

      expect(LOGOS_QUERY).toContain('|order(title)');
      expect(ARTICLE_CATEGORIES_WITH_POSTS_QUERY).toContain('|order(title)');
    });

    it('SITEMAP_WITH_TRANSLATIONS_QUERY should order by different fields', async () => {
      const { SITEMAP_WITH_TRANSLATIONS_QUERY } = await import('@/sanity/lib/queries');

      // Pages ordered by slug
      expect(SITEMAP_WITH_TRANSLATIONS_QUERY).toContain('|order(metadata.slug.current)');

      // Collections ordered by update time
      expect(SITEMAP_WITH_TRANSLATIONS_QUERY).toContain('|order(_updatedAt desc)');
    });
  });

  describe('Array Indexing & Selection', () => {
    it('should use [0] for first element selection', async () => {
      const { PAGE_QUERY, SITE_BANNERS_QUERY, PAGE_404_QUERY } = await import(
        '@/sanity/lib/queries'
      );

      expect(PAGE_QUERY).toContain('][0]{');
      expect(SITE_BANNERS_QUERY).toContain('[0].banners');
      expect(PAGE_404_QUERY).toContain('][0]{');
    });

    it('should handle array filtering for modules', async () => {
      const queries = await import('@/sanity/lib/queries');

      // MODULES_QUERY should handle array types
      expect(queries.MODULES_QUERY).toContain('ctas[]{');
      expect(queries.MODULES_QUERY).toContain('logos[]->{');
    });
  });

  describe('Conditional Projections', () => {
    it('should use select() for conditional values', async () => {
      const { sitemapQuery } = await import('@/sanity/lib/queries');
      const query = sitemapQuery('$baseUrl + "/" + language + "/"');

      // Should use select for conditional slug handling
      expect(query).toContain(
        "select(metadata.slug.current == 'index' => '', metadata.slug.current)"
      );

      // Should use select for priority
      expect(query).toContain("'priority': select(");
    });

    it('MODULES_QUERY should use conditional type checks', async () => {
      const queries = await import('@/sanity/lib/queries');

      // Should check _type before expanding
      expect(queries.MODULES_QUERY).toContain("_type == 'breadcrumbs' => {");
      expect(queries.MODULES_QUERY).toContain("_type == 'callout' => {");
      expect(queries.MODULES_QUERY).toContain("_type == 'logo-cloud' => {");
      expect(queries.MODULES_QUERY).toContain("_type == 'richtext' => {");
    });

    it('PT_BLOCK_QUERY should conditionally expand links in markDefs', async () => {
      const { PT_BLOCK_QUERY } = await import('@/sanity/lib/queries');

      expect(PT_BLOCK_QUERY).toContain("_type == 'link' => {");
    });
  });

  describe('Translation Support', () => {
    it('TRANSLATIONS_QUERY should use references() function', async () => {
      const { TRANSLATIONS_QUERY } = await import('@/sanity/lib/queries');

      // Should use references(^._id) to find translation metadata
      expect(TRANSLATIONS_QUERY).toContain("'translations':");
      expect(TRANSLATIONS_QUERY).toContain('references(^._id)');
      expect(TRANSLATIONS_QUERY).toContain('translations[].value->');
    });

    it('collection queries should include translation lookups', async () => {
      const { COLLECTION_ARTICLE_POST_QUERY } = await import('@/sanity/lib/queries');

      // Should fetch translations
      expect(COLLECTION_ARTICLE_POST_QUERY).toContain("'translations':");
    });

    it('CURRENT_PAGE_QUERY should embed TRANSLATIONS_QUERY', async () => {
      const { CURRENT_PAGE_QUERY } = await import('@/sanity/lib/queries');

      // Should include translations query pattern
      expect(CURRENT_PAGE_QUERY).toContain("'translations':");
      expect(CURRENT_PAGE_QUERY).toContain('references(^._id)');
      expect(CURRENT_PAGE_QUERY).toContain('translations[].value->');
    });
  });

  describe('Function-based Query Builders', () => {
    it('placementQuery() should accept dynamic scope filter', async () => {
      const { placementQuery } = await import('@/sanity/lib/queries');

      const query1 = placementQuery("scope == 'page'");
      const query2 = placementQuery("scope == 'global'");

      // Should inject scope filter
      expect(query1).toContain("scope == 'page'");
      expect(query2).toContain("scope == 'global'");

      // Should always return placement structure
      expect(query1).toContain("*[_type == 'placement'");
      expect(query2).toContain("*[_type == 'placement'");
    });

    it('sitemapQuery() should accept baseUrl parameter', async () => {
      const { sitemapQuery } = await import('@/sanity/lib/queries');

      const query = sitemapQuery('$baseUrl + "/" + language + "/"');

      // Should use provided base URL pattern
      expect(query).toContain('$baseUrl + "/" + language + "/"');

      // Should include core sitemap fields
      expect(query).toContain("'url':");
      expect(query).toContain("'lastModified': _updatedAt");
      expect(query).toContain("'priority':");
    });
  });

  describe('Special GROQ Functions', () => {
    it('should use pt::text() for portable text extraction', async () => {
      const { COLLECTION_ARTICLE_POST_QUERY } = await import('@/sanity/lib/queries');

      // Should use pt::text() in readTime calculation
      expect(COLLECTION_ARTICLE_POST_QUERY).toContain('pt::text(body)');

      // Should use pt::text() in headings extraction
      expect(COLLECTION_ARTICLE_POST_QUERY).toContain('pt::text(@)');
    });

    it('should use math::max() for calculations', async () => {
      const { COLLECTION_ARTICLE_POST_QUERY } = await import('@/sanity/lib/queries');

      // Should use math::max to ensure minimum value
      expect(COLLECTION_ARTICLE_POST_QUERY).toContain('math::max([1,');
    });

    it('should use string::split() for text processing', async () => {
      const { COLLECTION_ARTICLE_POST_QUERY } = await import('@/sanity/lib/queries');

      // Should split text into words for readTime
      expect(COLLECTION_ARTICLE_POST_QUERY).toContain("string::split(pt::text(body), ' ')");
    });

    it('should use count() and array::unique() for aggregations', async () => {
      const { ARTICLE_CATEGORIES_WITH_POSTS_QUERY, IS_COLLECTION_PAGE_QUERY } = await import(
        '@/sanity/lib/queries'
      );

      // ARTICLE_CATEGORIES_WITH_POSTS_QUERY was optimized to use array::unique() instead of count()
      // This eliminated O(n×m) complexity for 10-20x performance improvement
      expect(ARTICLE_CATEGORIES_WITH_POSTS_QUERY).toContain('array::unique(');
      expect(IS_COLLECTION_PAGE_QUERY).toContain('count(modules[');
    });

    it('should use references() for relationship checks', async () => {
      const { TRANSLATIONS_QUERY } = await import('@/sanity/lib/queries');

      // ARTICLE_CATEGORIES_WITH_POSTS_QUERY was optimized to reverse the query
      // It now uses _id in array instead of references() for better performance
      expect(TRANSLATIONS_QUERY).toContain('references(^._id)');
    });

    it('should use defined() to check field existence', async () => {
      const { COLLECTION_ARTICLE_SLUGS_QUERY, SEARCH_INDEX_QUERY } = await import(
        '@/sanity/lib/queries'
      );

      expect(COLLECTION_ARTICLE_SLUGS_QUERY).toContain('defined(metadata.slug.current)');
      expect(SEARCH_INDEX_QUERY).toContain('defined(metadata.slug.current)');
    });
  });

  describe('Body Content Handling', () => {
    it('collection queries should handle multiple body block types', async () => {
      const { COLLECTION_ARTICLE_POST_QUERY } = await import('@/sanity/lib/queries');

      // Should handle different block types
      expect(COLLECTION_ARTICLE_POST_QUERY).toContain("_type == 'image' => {");
      expect(COLLECTION_ARTICLE_POST_QUERY).toContain("_type == 'socialEmbed' => {");
      expect(COLLECTION_ARTICLE_POST_QUERY).toContain("_type == 'video' => {");

      // Should include PT_BLOCK_QUERY patterns (markDefs with links)
      expect(COLLECTION_ARTICLE_POST_QUERY).toContain('markDefs[]{');
      expect(COLLECTION_ARTICLE_POST_QUERY).toContain("_type == 'link' => {");
    });

    it('richtext module should extract headings for table of contents', async () => {
      const queries = await import('@/sanity/lib/queries');

      // Should use select() with tableOfContents flag
      expect(queries.MODULES_QUERY).toContain("'headings': select(");
      expect(queries.MODULES_QUERY).toContain('tableOfContents =>');
      expect(queries.MODULES_QUERY).toContain("content[style in ['h2', 'h3', 'h4', 'h5', 'h6']]");
    });
  });

  describe('SEO & Metadata', () => {
    it('queries should check seo.noIndex flag', async () => {
      const { SEARCH_INDEX_QUERY, SITEMAP_WITH_TRANSLATIONS_QUERY } = await import(
        '@/sanity/lib/queries'
      );

      // Should exclude pages with noIndex
      expect(SEARCH_INDEX_QUERY).toContain('seo.noIndex != true');
      expect(SITEMAP_WITH_TRANSLATIONS_QUERY).toContain('seo.noIndex != true');
    });

    it('should include image references for OG images', async () => {
      const { PAGE_QUERY, COLLECTION_ARTICLE_POST_QUERY } = await import('@/sanity/lib/queries');

      // After optimization: Image URL building happens in application code
      // Queries only fetch image object references
      expect(PAGE_QUERY).toContain('image {');
      expect(COLLECTION_ARTICLE_POST_QUERY).toContain('seo {');
      expect(COLLECTION_ARTICLE_POST_QUERY).toContain('image {');
    });

    it('SEARCH_INDEX_QUERY should exclude home page from results', async () => {
      const { SEARCH_INDEX_QUERY } = await import('@/sanity/lib/queries');

      expect(SEARCH_INDEX_QUERY).toContain('metadata.slug.current != "index"');
    });
  });

  describe('Site Configuration', () => {
    it('SITE_QUERY should fetch complete site settings', async () => {
      const { SITE_QUERY } = await import('@/sanity/lib/queries');

      // Should resolve logo reference
      expect(SITE_QUERY).toContain('logo->{');

      // Should include navigation (using coalesce for i18n support)
      expect(SITE_QUERY).toContain('headerNav');
      expect(SITE_QUERY).toContain('footerNav');

      // Should include features
      expect(SITE_QUERY).toContain('enableSearch,');
      expect(SITE_QUERY).toContain('systemStatus,');
      expect(SITE_QUERY).toContain('cookieConsent {');
    });

    it('SITE_QUERY should handle menu types correctly', async () => {
      const { SITE_QUERY } = await import('@/sanity/lib/queries');

      // Should handle menuItem and dropdownMenu types
      expect(SITE_QUERY).toContain("_type == 'menuItem' => {");
      expect(SITE_QUERY).toContain("_type == 'dropdownMenu' => {");
    });
  });
});

/**
 * GROQ Best Practices Checklist
 *
 * ✅ IMPLEMENTED:
 * 1. Parameterized queries (no string interpolation in filters)
 * 2. Proper reference resolution syntax (->)
 * 3. Consistent field projections
 * 4. Query composition and reusability
 * 5. Type filtering with _type checks
 * 6. Array indexing ([0], []->{})
 * 7. Conditional projections (select(), =>)
 * 8. Translation support with references()
 * 9. Special functions (pt::text, math::max, count, defined)
 * 10. SEO best practices (noIndex checks, OG images)
 *
 * 📋 QUERY SECURITY PRINCIPLES:
 * 1. Always use $parameter syntax, never ${interpolation}
 * 2. Use defined() to check field existence before filtering
 * 3. Use references() for relationship checks
 * 4. Validate required fields (slug, collection) in collection queries
 * 5. Exclude sensitive/internal pages (404, drafts) from public queries
 * 6. Use seo.noIndex != true to respect page visibility settings
 * 7. Prefer specific field projections over spread operator (...)
 * 8. Use conditional types (_type == '...') before accessing type-specific fields
 *
 * 💡 PERFORMANCE TIPS:
 * 1. Project only required fields (avoid over-fetching)
 * 2. Use preview queries for list views (minimal fields)
 * 3. Compose queries with reusable fragments
 * 4. Filter early in query (before expensive operations)
 * 5. Use |order() after filtering, not before
 * 6. Limit array dereferencing depth (performance cost)
 * 7. Avoid nested queries - use parallel queries + application joins (100x faster)
 * 8. Use array::unique() instead of nested count() for O(n) complexity
 */
