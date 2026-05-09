import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

// Path aliases shared across all projects
const aliases = {
  '@': resolve(__dirname, './src'),
  $: resolve(__dirname, './'),
  '@tests': resolve(__dirname, './tests'),
  'server-only': resolve(__dirname, './tests/setup/server-only-mock.ts'),
};

// CSS-style imports (real .css, .scss, .module.css) that some libraries (sanity,
// @sanity/ui) eager-load. jsdom has no CSS engine and Node's import() fails on
// these extensions, so we shim them to an empty module via a Vite plugin.
const stubCssPlugin = {
  name: 'stub-css-imports',
  enforce: 'pre' as const,
  resolveId(id: string) {
    if (/\.(css|scss|sass|less)$/.test(id)) return '\0virtual:empty-css';
    return null;
  },
  load(id: string) {
    if (id === '\0virtual:empty-css') return 'export default {}';
    return null;
  },
};

// Shared test configuration
const sharedTestConfig = {
  environment: 'jsdom' as const,
  globals: true,
  setupFiles: ['./tests/setup/vitest.setup.ts'],
  env: {
    NEXT_PUBLIC_BASE_URL: 'https://test.example.com',
    NEXT_PUBLIC_SANITY_PROJECT_ID: 'test-project-id',
    NEXT_PUBLIC_SANITY_DATASET: 'test-dataset',
    NEXT_PUBLIC_SANITY_API_VERSION: '2024-12-01',
    NEXT_PUBLIC_SANITY_BROWSER_TOKEN: 'test-token',
  },
  // Highlight slow tests (>300ms)
  slowTestThreshold: 300,
  // Filter noisy console logs from libraries
  onConsoleLog(log: string) {
    if (log.includes('Consider') || log.includes('recommend')) return false;
  },
  server: {
    deps: {
      // Inline packages so they go through Vite's transform pipeline:
      // - `server-only` is mocked.
      // - `next-intl` imports bare-specifier Next subpaths (e.g.
      //   `next/server`) without `.js`; Vite 8's stricter ESM resolver
      //   trips on these, so we let Vite rewrite them.
      // - `sanity` and `@sanity/...` eager-load `.css` bundles that Node's
      //   loader can't handle; running them through Vite lets the css-stub
      //   plugin (above) shim those imports.
      inline: ['server-only', 'next-intl', 'sanity', /^@sanity\//],
    },
  },
};

// Helper to create a project configuration
const createProject = (name: string, include: string[]) => ({
  plugins: [stubCssPlugin, react() as any],
  test: {
    ...sharedTestConfig,
    name,
    include,
  },
  resolve: {
    alias: aliases,
  },
});

export default defineConfig({
  plugins: [stubCssPlugin, react() as any],
  test: {
    ...sharedTestConfig,
    // Define projects for categorized test output
    projects: [
      createProject('unit', ['tests/unit/**/*.test.{ts,tsx}']),
      createProject('components', ['tests/components/**/*.test.{ts,tsx}']),
      createProject('integration', ['tests/integration/**/*.test.{ts,tsx}']),
      createProject('contracts', ['tests/contracts/**/*.contract.{ts,tsx}']),
    ],
    exclude: ['tests/e2e/**', 'tests/load/**', 'node_modules'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './test-results/coverage',
      thresholds: {
        global: {
          lines: 40,
          branches: 25,
          functions: 35,
          statements: 40,
        },
      },
      include: [
        'src/components/**/*.{ts,tsx}',
        'src/ui/**/*.{ts,tsx}',
        'src/lib/**/*.{ts,tsx}',
        'src/app/api/**/*.{ts,tsx}',
      ],
      exclude: ['node_modules', 'tests/**', '**/*.test.{ts,tsx}', '**/*.d.ts'],
    },
  },
  resolve: {
    alias: aliases,
  },
});
