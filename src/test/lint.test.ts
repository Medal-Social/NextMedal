/**
 * Lint Validation Test
 * @description Ensures the codebase passes all lint rules.
 * This test runs Biome linter and fails if any lint errors are found.
 */

import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('Lint Validation', () => {
  it('codebase passes all lint rules', () => {
    try {
      // Run biome check (lint + format check) and capture output
      execSync('pnpm lint', {
        encoding: 'utf-8',
        stdio: 'pipe',
        cwd: process.cwd(),
      });

      // If we get here, lint passed
      expect(true).toBe(true);
    } catch (error) {
      // Lint failed - extract the error message
      const execError = error as { stdout?: string; stderr?: string; message?: string };
      const output = execError.stdout || execError.stderr || execError.message || 'Unknown error';

      // Fail the test with the lint output
      expect.fail(`Lint errors found:\n\n${output}`);
    }
  });

  it('no TypeScript errors in codebase', { timeout: 60000 }, () => {
    try {
      // Run TypeScript type checking
      execSync('pnpm typecheck', {
        encoding: 'utf-8',
        stdio: 'pipe',
        cwd: process.cwd(),
      });

      expect(true).toBe(true);
    } catch (error) {
      const execError = error as { stdout?: string; stderr?: string; message?: string };
      const output = execError.stdout || execError.stderr || execError.message || 'Unknown error';

      expect.fail(`TypeScript errors found:\n\n${output}`);
    }
  });
});
