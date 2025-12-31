import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Snapshot directory for visual regression tests
  snapshotDir: './tests/e2e/visual/snapshots',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/playwright', open: 'never' }],
  ],

  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure (useful for debugging)
    video: 'on-first-retry',
  },

  // Configure projects for different test types
  projects: [
    // Smoke tests - quick critical path tests (run on every commit)
    {
      name: 'smoke',
      testMatch: /smoke\/.*\.smoke\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // E2E tests - full end-to-end tests
    {
      name: 'e2e',
      testMatch: /specs\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // E2E tests on Firefox
    {
      name: 'e2e-firefox',
      testMatch: /specs\/.*\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
    },

    // E2E tests on WebKit
    {
      name: 'e2e-webkit',
      testMatch: /specs\/.*\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile E2E tests
    {
      name: 'e2e-mobile-chrome',
      testMatch: /specs\/.*\.spec\.ts/,
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'e2e-mobile-safari',
      testMatch: /specs\/.*\.spec\.ts/,
      use: { ...devices['iPhone 12'] },
    },

    // Visual regression tests
    {
      name: 'visual',
      testMatch: /visual\/.*\.visual\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Accessibility tests
    {
      name: 'accessibility',
      testMatch: /accessibility\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Performance tests (Lighthouse)
    // IMPORTANT: Lighthouse tests must run serially (one at a time)
    // because they share the remote debugging port
    {
      name: 'performance',
      testMatch: /performance\/.*\.spec\.ts/,
      fullyParallel: false, // Run serially
      timeout: 120 * 1000, // 2 minutes per test for Lighthouse audits
      use: {
        ...devices['Desktop Chrome'],
        // Lighthouse requires headful Chrome with remote debugging
        launchOptions: {
          args: ['--remote-debugging-port=9222'],
        },
      },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for dev server to start
  },

  // Global timeout for each test
  timeout: 30 * 1000,

  // Expect timeout
  expect: {
    timeout: 5 * 1000,
  },
});
