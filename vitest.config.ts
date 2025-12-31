import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react() as any],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    env: {
      NEXT_PUBLIC_BASE_URL: 'https://test.example.com',
      NEXT_PUBLIC_SANITY_PROJECT_ID: 'test-project-id',
      NEXT_PUBLIC_SANITY_DATASET: 'test-dataset',
      NEXT_PUBLIC_SANITY_API_VERSION: '2024-12-01',
      NEXT_PUBLIC_SANITY_BROWSER_TOKEN: 'test-token',
    },
    include: [
      'tests/**/*.test.{ts,tsx}',
      'tests/**/*.contract.{ts,tsx}',
    ],
    exclude: [
      'tests/e2e/**',
      'tests/load/**',
      'node_modules',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
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
      exclude: [
        'node_modules',
        'tests/**',
        '**/*.test.{ts,tsx}',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '$': resolve(__dirname, './'),
      '@tests': resolve(__dirname, './tests'),
    },
  },
});
