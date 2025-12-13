import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.tsx'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      thresholds: {
        global: {
          lines: 80,
          branches: 80,
          functions: 80,
          statements: 80,
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
        'src/test/**',
        '**/*.test.{ts,tsx}',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '$': resolve(__dirname, './'),
    },
  },
});
