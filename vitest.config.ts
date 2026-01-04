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
      inline: ['server-only'],
    },
  },
};

// Helper to create a project configuration
const createProject = (name: string, include: string[]) => ({
  plugins: [react() as any],
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
  plugins: [react() as any],
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
