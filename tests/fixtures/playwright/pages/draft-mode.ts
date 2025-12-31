import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model for DraftModeControls component
 * Provides a clean API for interacting with the preview banner
 */
export class DraftModePage {
  readonly page: Page;
  readonly banner: Locator;
  readonly exitButton: Locator;
  readonly learnMoreLink: Locator;
  readonly title: Locator;
  readonly description: Locator;
  readonly eyeIcon: Locator;
  readonly spinner: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main banner container
    this.banner = page.getByRole('status');

    // Interactive elements
    this.exitButton = page.getByRole('button', { name: /exit preview|avslutt/i });
    this.learnMoreLink = page.getByRole('link', { name: /learn more|lær mer/i });

    // Text content
    this.title = this.banner.locator('text=Preview Mode, text=Forhåndsvisning').first();
    this.description = this.banner.locator('text=/See how your changes|Se hvordan endringene/i');

    // Icons
    this.eyeIcon = this.banner.locator('svg').first();
    this.spinner = this.exitButton.locator('.animate-spin');
  }

  /**
   * Enable draft mode by setting the cookie directly
   * This bypasses the Sanity authentication for testing purposes
   */
  async enableDraftMode(path = '/en') {
    // Navigate to the page first
    await this.page.goto(path);
    await this.page.waitForLoadState('domcontentloaded');

    // Set the draft mode cookie (Next.js uses __prerender_bypass for draft mode)
    await this.page.context().addCookies([
      {
        name: '__prerender_bypass',
        value: 'true',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
      {
        name: '__next_preview_data',
        value: 'true',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    // Reload the page to apply the draft mode cookies
    await this.page.reload();
    await this.page.waitForLoadState('domcontentloaded');

    // Wait for the banner to appear (or timeout if it doesn't)
    try {
      await this.waitForBanner();
    } catch {
      // Banner might not appear immediately, check if page is in draft mode
    }
  }

  /**
   * Wait for the banner to be visible
   */
  async waitForBanner() {
    await this.banner.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Click the exit preview button
   */
  async exitPreview() {
    await this.exitButton.click();
  }

  /**
   * Check if the banner is visible
   */
  async isVisible(): Promise<boolean> {
    return this.banner.isVisible();
  }

  /**
   * Check if the exit button is in loading state
   */
  async isExitButtonLoading(): Promise<boolean> {
    const buttonText = await this.exitButton.textContent();
    return buttonText?.includes('Exiting') || buttonText?.includes('Avslutter') || false;
  }

  /**
   * Get the learn more link href
   */
  async getLearnMoreHref(): Promise<string | null> {
    return this.learnMoreLink.getAttribute('href');
  }

  /**
   * Get the learn more link target attribute
   */
  async getLearnMoreTarget(): Promise<string | null> {
    return this.learnMoreLink.getAttribute('target');
  }

  /**
   * Get the learn more link rel attribute
   */
  async getLearnMoreRel(): Promise<string | null> {
    return this.learnMoreLink.getAttribute('rel');
  }

  /**
   * Check if the footer is accessible (not covered by banner)
   */
  async isFooterAccessible(): Promise<boolean> {
    const footer = this.page.locator('footer');
    const isFooterVisible = await footer.isVisible();
    if (!isFooterVisible) return true; // No footer, so nothing to block

    // Check if footer elements are clickable
    const footerButtons = footer.locator('button');
    const footerButtonCount = await footerButtons.count();

    if (footerButtonCount > 0) {
      // Try to check if the first button is accessible
      const firstButton = footerButtons.first();
      const buttonBox = await firstButton.boundingBox();
      const bannerBox = await this.banner.boundingBox();

      if (buttonBox && bannerBox) {
        // Check if button is above the banner (not covered)
        return buttonBox.y + buttonBox.height <= bannerBox.y;
      }
    }

    return true;
  }

  /**
   * Get banner position (for layout testing)
   */
  async getBannerPosition() {
    const box = await this.banner.boundingBox();
    return box;
  }

  /**
   * Check banner styling
   */
  async getBannerClasses(): Promise<string> {
    return (await this.banner.getAttribute('class')) || '';
  }

  /**
   * Tab to the exit button
   */
  async tabToExitButton() {
    await this.page.keyboard.press('Tab'); // First tab to learn more
    await this.page.keyboard.press('Tab'); // Second tab to exit button
  }

  /**
   * Tab to the learn more link
   */
  async tabToLearnMore() {
    await this.page.keyboard.press('Tab');
  }
}
