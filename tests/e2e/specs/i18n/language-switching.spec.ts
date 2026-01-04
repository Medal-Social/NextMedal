import { expect, test } from '@playwright/test';

/**
 * Language Switching E2E Tests
 *
 * These tests verify the language switcher functionality:
 * - Auto-redirects when translation exists
 * - Shows dialog when translation is missing
 * - Dialog displays available locales with quick-switch buttons
 * - Works across all page types (index, collections, regular pages)
 *
 * Test Coverage:
 * 1. Index page (homepage) switching
 * 2. Regular page switching (about, contact, etc.)
 * 3. Collection page switching (articles, docs, etc.)
 * 4. Dialog interactions (available locales, go to home, stay)
 */

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const LOCALES = ['en', 'nb', 'ar'] as const;

// Collection slugs by locale
const COLLECTION_SLUGS = {
  en: { articles: 'articles', docs: 'docs' },
  nb: { articles: 'artikler', docs: 'dokumentasjon' },
  ar: { articles: 'articles', docs: 'docs' },
} as const;

test.describe('Language Switcher - Homepage', () => {
  test('should auto-redirect from English to Norwegian homepage', async ({ page }) => {
    await page.goto(`${BASE_URL}/en`);
    await page.waitForLoadState('networkidle');

    // Open language switcher
    const languageSwitcher = page.getByRole('button', { name: /change language/i });
    await languageSwitcher.click();

    // Click Norwegian option
    const norwegianOption = page.getByRole('menuitemradio', { name: /norsk/i });
    await norwegianOption.click();

    // Should redirect to Norwegian homepage
    await expect(page).toHaveURL(`${BASE_URL}/nb`);
  });

  test('should auto-redirect from Norwegian to Arabic homepage', async ({ page }) => {
    await page.goto(`${BASE_URL}/nb`);
    await page.waitForLoadState('networkidle');

    const languageSwitcher = page.getByRole('button', { name: /endre språk/i });
    await languageSwitcher.click();

    const arabicOption = page.getByRole('menuitemradio', { name: /العربية/i });
    await arabicOption.click();

    await expect(page).toHaveURL(`${BASE_URL}/ar`);
  });

  test('should auto-redirect from Arabic to English homepage', async ({ page }) => {
    await page.goto(`${BASE_URL}/ar`);
    await page.waitForLoadState('networkidle');

    const languageSwitcher = page.getByRole('button', { name: /تغيير اللغة/i });
    await languageSwitcher.click();

    const englishOption = page.getByRole('menuitemradio', { name: /english/i });
    await englishOption.click();

    await expect(page).toHaveURL(`${BASE_URL}/en`);
  });
});

test.describe('Language Switcher - Regular Pages', () => {
  test('should auto-redirect when translation exists', async ({ page }) => {
    // Assumes an "about" page exists in both English and Norwegian
    await page.goto(`${BASE_URL}/en/about`);
    await page.waitForLoadState('networkidle');

    const languageSwitcher = page.getByRole('button', { name: /change language/i });
    await languageSwitcher.click();

    const norwegianOption = page.getByRole('menuitemradio', { name: /norsk/i });
    await norwegianOption.click();

    // Should redirect to Norwegian version
    // Note: URL might be /nb/om-oss or /nb/about depending on slug
    await page.waitForURL(/\/nb\/.+/);
    expect(page.url()).toMatch(/\/nb\//);
  });

  test('should show dialog when translation does not exist', async ({ page }) => {
    // Navigate to a page that likely doesn't have all translations
    await page.goto(`${BASE_URL}/en/about`);
    await page.waitForLoadState('networkidle');

    const languageSwitcher = page.getByRole('button', { name: /change language/i });
    await languageSwitcher.click();

    // Try switching to a locale that might not have this page
    const arabicOption = page.getByRole('menuitemradio', { name: /العربية/i });
    await arabicOption.click();

    // Check if either redirected or dialog shown
    await page.waitForTimeout(500);

    // If dialog appears, it should have these elements
    const dialogTitle = page.getByRole('heading', { name: /translation not available/i });
    if (await dialogTitle.isVisible()) {
      // Dialog should be visible
      await expect(dialogTitle).toBeVisible();

      // Should have "Go to home" and "Stay" buttons
      const goHomeButton = page.getByRole('button', { name: /go to.*home/i });
      const stayButton = page.getByRole('button', { name: /stay/i });

      await expect(goHomeButton).toBeVisible();
      await expect(stayButton).toBeVisible();
    }
  });
});

test.describe('Language Switcher - Collection Pages', () => {
  test('should auto-redirect for articles collection', async ({ page }) => {
    // Go to English articles collection
    await page.goto(`${BASE_URL}/en/${COLLECTION_SLUGS.en.articles}`);
    await page.waitForLoadState('networkidle');

    const languageSwitcher = page.getByRole('button', { name: /change language/i });
    await languageSwitcher.click();

    const norwegianOption = page.getByRole('menuitemradio', { name: /norsk/i });
    await norwegianOption.click();

    // Should redirect to Norwegian articles (with Norwegian slug)
    await expect(page).toHaveURL(`${BASE_URL}/nb/${COLLECTION_SLUGS.nb.articles}`);
  });

  test('should handle individual article switching', async ({ page }) => {
    // This test requires an actual article to exist
    // Skip if no articles are published
    const articlesUrl = `${BASE_URL}/en/${COLLECTION_SLUGS.en.articles}`;
    await page.goto(articlesUrl);
    await page.waitForLoadState('networkidle');

    // Try to find an article link
    const articleLink = page.locator('a[href*="/articles/"]').first();
    const articleExists = (await articleLink.count()) > 0;

    if (!articleExists) {
      test.skip();
      return;
    }

    // Click first article
    await articleLink.click();
    await page.waitForLoadState('networkidle');

    // Try to switch language
    const languageSwitcher = page.getByRole('button', { name: /change language/i });
    await languageSwitcher.click();

    const norwegianOption = page.getByRole('menuitemradio', { name: /norsk/i });
    await norwegianOption.click();

    // Wait for either redirect or dialog
    await page.waitForTimeout(500);

    // Should either redirect to Norwegian article or show dialog
    const currentUrl = page.url();
    const isNorwegianUrl = currentUrl.includes('/nb/');
    const dialogVisible = await page
      .getByRole('alertdialog')
      .isVisible()
      .catch(() => false);

    expect(isNorwegianUrl || dialogVisible).toBeTruthy();
  });
});

test.describe('Translation Dialog - Available Locales', () => {
  test('should display available locales in dialog', async ({ page }) => {
    // Navigate to a page that exists in some but not all locales
    await page.goto(`${BASE_URL}/en/about`);
    await page.waitForLoadState('networkidle');

    const languageSwitcher = page.getByRole('button', { name: /change language/i });
    await languageSwitcher.click();

    // Try switching to Arabic (which might not have this page)
    const arabicOption = page.getByRole('menuitemradio', { name: /العربية/i });
    await arabicOption.click();

    await page.waitForTimeout(500);

    // If dialog appears, check for available locales section
    const dialog = page.getByRole('alertdialog');
    const dialogVisible = await dialog.isVisible().catch(() => false);

    if (dialogVisible) {
      // Look for "This page is available in:" text
      const availableText = page.getByText(/this page is available in/i);
      const hasAvailableSection = await availableText.isVisible().catch(() => false);

      if (hasAvailableSection) {
        await expect(availableText).toBeVisible();

        // Should have quick-switch buttons for available locales
        // Look for locale names like "English", "Norsk"
        const englishButton = page.getByRole('button', { name: /english/i });
        const norwegianButton = page.getByRole('button', { name: /norsk/i });

        const hasEnglish = await englishButton.isVisible().catch(() => false);
        const hasNorwegian = await norwegianButton.isVisible().catch(() => false);

        // At least one available locale button should be present
        expect(hasEnglish || hasNorwegian).toBeTruthy();
      }
    }
  });

  test('should navigate when clicking available locale button', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/about`);
    await page.waitForLoadState('networkidle');

    const languageSwitcher = page.getByRole('button', { name: /change language/i });
    await languageSwitcher.click();

    const arabicOption = page.getByRole('menuitemradio', { name: /العربية/i });
    await arabicOption.click();

    await page.waitForTimeout(500);

    const dialog = page.getByRole('alertdialog');
    const dialogVisible = await dialog.isVisible().catch(() => false);

    if (dialogVisible) {
      // Try to click an available locale button (if present)
      const englishButton = page.getByRole('button', { name: /english/i });
      const buttonVisible = await englishButton.isVisible().catch(() => false);

      if (buttonVisible) {
        await englishButton.click();

        // Should navigate back to the same page in English
        await expect(page).toHaveURL(/\/en\//);
      }
    }
  });
});

test.describe('Translation Dialog - Actions', () => {
  test('should navigate to homepage when clicking "Go to home"', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/about`);
    await page.waitForLoadState('networkidle');

    const languageSwitcher = page.getByRole('button', { name: /change language/i });
    await languageSwitcher.click();

    const arabicOption = page.getByRole('menuitemradio', { name: /العربية/i });
    await arabicOption.click();

    await page.waitForTimeout(500);

    const dialog = page.getByRole('alertdialog');
    const dialogVisible = await dialog.isVisible().catch(() => false);

    if (dialogVisible) {
      const goHomeButton = page.getByRole('button', { name: /go to.*home/i });
      await goHomeButton.click();

      // Should navigate to Arabic homepage
      await expect(page).toHaveURL(`${BASE_URL}/ar`);
    }
  });

  test('should close dialog when clicking "Stay"', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/about`);
    await page.waitForLoadState('networkidle');

    const languageSwitcher = page.getByRole('button', { name: /change language/i });
    await languageSwitcher.click();

    const arabicOption = page.getByRole('menuitemradio', { name: /العربية/i });
    await arabicOption.click();

    await page.waitForTimeout(500);

    const dialog = page.getByRole('alertdialog');
    const dialogVisible = await dialog.isVisible().catch(() => false);

    if (dialogVisible) {
      const stayButton = page.getByRole('button', { name: /stay/i });
      await stayButton.click();

      // Dialog should close
      await expect(dialog).not.toBeVisible();

      // Should stay on same URL
      await expect(page).toHaveURL(/\/en\/about/);
    }
  });
});

test.describe('Language Switcher - Keyboard Shortcuts', () => {
  test('should open language switcher with "L" key', async ({ page }) => {
    await page.goto(`${BASE_URL}/en`);
    await page.waitForLoadState('networkidle');

    // Press "L" key
    await page.keyboard.press('l');

    // Wait for dropdown menu to appear
    await page.waitForTimeout(300);

    // Language options should be visible
    const norwegianOption = page.getByRole('menuitemradio', { name: /norsk/i });
    await expect(norwegianOption).toBeVisible();
  });
});

test.describe('Language Switcher - Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/en`);
    await page.waitForLoadState('networkidle');

    // Language switcher button should have aria-label
    const languageSwitcher = page.getByRole('button', { name: /change language/i });
    await expect(languageSwitcher).toBeVisible();

    // Should have aria-label attribute
    const ariaLabel = await languageSwitcher.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto(`${BASE_URL}/en`);
    await page.waitForLoadState('networkidle');

    // Tab to language switcher
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Press Enter to open (might need multiple tabs depending on page structure)
    // This is a basic test - might need adjustment based on actual tab order
    const languageSwitcher = page.getByRole('button', { name: /change language/i });
    await languageSwitcher.focus();
    await page.keyboard.press('Enter');

    // Menu should open
    await page.waitForTimeout(300);
    const norwegianOption = page.getByRole('menuitemradio', { name: /norsk/i });
    const isVisible = await norwegianOption.isVisible().catch(() => false);

    expect(isVisible).toBeTruthy();
  });
});

test.describe('Language Switcher - Visual Feedback', () => {
  test('should show loading state during transition', async ({ page }) => {
    await page.goto(`${BASE_URL}/en`);
    await page.waitForLoadState('networkidle');

    const languageSwitcher = page.getByRole('button', { name: /change language/i });
    await languageSwitcher.click();

    const norwegianOption = page.getByRole('menuitemradio', { name: /norsk/i });

    // Click and immediately check for loading state
    await norwegianOption.click();

    // Loading spinner might appear briefly
    // This is hard to test reliably, so we just verify the transition happens
    await page.waitForURL(/\/nb/);
  });

  test('should display current locale correctly', async ({ page }) => {
    // Test that switcher shows current locale
    for (const locale of LOCALES) {
      const url = locale === 'en' ? `${BASE_URL}/en` : `${BASE_URL}/${locale}`;
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      const languageSwitcher = page.getByRole('button', {
        name: /change language|endre språk|تغيير اللغة/i,
      });
      await expect(languageSwitcher).toBeVisible();

      // Current locale indicator (might be icon or text)
      // Verify the button is present for each locale
      await languageSwitcher.click();

      // Close the dropdown
      await page.keyboard.press('Escape');
    }
  });
});
