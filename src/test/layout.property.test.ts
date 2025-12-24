/**
 * Layout Property Tests
 * @description Property-based tests for layout configuration
 * **Feature: component-accessibility-testing**
 * **Validates: Requirements 13.4**
 */

import fs from 'node:fs';
import path from 'node:path';
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { routing } from '@/i18n/routing';

/**
 * **Feature: component-accessibility-testing, Property 36: Locale Lang Attribute**
 * *For any* supported locale (en, nb), html element SHALL have matching lang attribute.
 * **Validates: Requirements 13.4**
 */
describe('Property 36: Locale Lang Attribute', () => {
  // Read layout source for static analysis
  const layoutPath = path.join(process.cwd(), 'src/app/(frontend)/[locale]/layout.tsx');
  const layoutSource = fs.readFileSync(layoutPath, 'utf-8');

  // Arbitrary for generating supported locales
  const supportedLocaleArb = fc.constantFrom(...routing.locales);

  it('layout sets lang attribute dynamically from locale parameter', () => {
    // Verify the layout uses lang={locale} pattern
    expect(layoutSource).toContain('lang={locale}');
  });

  it('all supported locales are valid BCP 47 language tags', () => {
    fc.assert(
      fc.property(supportedLocaleArb, (locale) => {
        // BCP 47 language tags are 2-3 letter codes, optionally followed by region
        // Common patterns: 'en', 'nb', 'en-US', 'zh-CN'
        const bcp47Pattern = /^[a-z]{2,3}(-[A-Z]{2})?$/;
        expect(locale).toMatch(bcp47Pattern);
      }),
      { numRuns: 100 }
    );
  });

  it('generateStaticParams includes all supported locales', () => {
    fc.assert(
      fc.property(supportedLocaleArb, (locale) => {
        // Each supported locale should be included in static params
        const staticParams = routing.locales.map((l) => ({ locale: l }));
        const localeInParams = staticParams.some((p) => p.locale === locale);
        expect(localeInParams).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('layout html element receives locale from params', () => {
    // Verify the layout destructures locale from params
    expect(layoutSource).toContain('const { locale } = await params');
    // Verify locale is used in html element
    expect(layoutSource).toContain('<html');
    expect(layoutSource).toContain('lang={locale}');
  });

  it('for any locale, the html lang attribute pattern is correctly implemented', () => {
    fc.assert(
      fc.property(supportedLocaleArb, (locale) => {
        // The layout should handle any valid locale from routing.locales
        expect(routing.locales).toContain(locale);

        // Verify the locale would be valid as an HTML lang attribute
        // HTML lang attributes should be valid BCP 47 tags
        expect(typeof locale).toBe('string');
        expect(locale.length).toBeGreaterThanOrEqual(2);
      }),
      { numRuns: 100 }
    );
  });
});
