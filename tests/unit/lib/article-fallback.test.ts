import { describe, expect, it } from 'vitest';

// Test helper functions from the article-fallback route
describe('Article Fallback OG Image Helpers', () => {
  describe('getLocalizedText', () => {
    // Helper function to test (extracted logic)
    function getLocalizedText(locale: string): string {
      const TRANSLATIONS = {
        en: { articles: 'Articles' },
        nb: { articles: 'Artikler' },
        ar: { articles: 'مقالات' },
      } as const;

      type Locale = keyof typeof TRANSLATIONS;
      const normalizedLocale = locale.toLowerCase();
      if (normalizedLocale in TRANSLATIONS) {
        return TRANSLATIONS[normalizedLocale as Locale].articles;
      }
      return TRANSLATIONS.en.articles;
    }

    it('should return English translation for "en" locale', () => {
      expect(getLocalizedText('en')).toBe('Articles');
    });

    it('should return Norwegian translation for "nb" locale', () => {
      expect(getLocalizedText('nb')).toBe('Artikler');
    });

    it('should return Arabic translation for "ar" locale', () => {
      expect(getLocalizedText('ar')).toBe('مقالات');
    });

    it('should be case insensitive', () => {
      expect(getLocalizedText('EN')).toBe('Articles');
      expect(getLocalizedText('NB')).toBe('Artikler');
      expect(getLocalizedText('AR')).toBe('مقالات');
    });

    it('should default to English for unknown locales', () => {
      expect(getLocalizedText('fr')).toBe('Articles');
      expect(getLocalizedText('de')).toBe('Articles');
      expect(getLocalizedText('unknown')).toBe('Articles');
    });
  });

  describe('isRTL', () => {
    // Helper function to test (extracted logic)
    function isRTL(locale: string): boolean {
      return locale.toLowerCase() === 'ar';
    }

    it('should return true for Arabic locale', () => {
      expect(isRTL('ar')).toBe(true);
    });

    it('should be case insensitive for Arabic', () => {
      expect(isRTL('AR')).toBe(true);
      expect(isRTL('Ar')).toBe(true);
    });

    it('should return false for non-Arabic locales', () => {
      expect(isRTL('en')).toBe(false);
      expect(isRTL('nb')).toBe(false);
      expect(isRTL('fr')).toBe(false);
    });
  });
});
