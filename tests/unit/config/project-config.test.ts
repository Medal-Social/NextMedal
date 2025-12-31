import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Project Configuration Validation Tests
 *
 * These tests verify that package.json and tsconfig.json are correctly configured
 * following best practices for a Next.js project.
 *
 * _Requirements: Best Practices, 1.4_
 */

describe('package.json validation', () => {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  describe('Required scripts', () => {
    const requiredScripts = ['dev', 'build', 'start', 'lint', 'test'];

    it.each(requiredScripts)('should have "%s" script defined', (scriptName) => {
      expect(packageJson.scripts).toHaveProperty(scriptName);
      expect(packageJson.scripts[scriptName]).toBeTruthy();
    });
  });

  describe('Required fields', () => {
    it('should have name field', () => {
      expect(packageJson).toHaveProperty('name');
      expect(typeof packageJson.name).toBe('string');
      expect(packageJson.name.length).toBeGreaterThan(0);
    });

    it('should have version field', () => {
      expect(packageJson).toHaveProperty('version');
      expect(typeof packageJson.version).toBe('string');
      // Version should follow semver pattern
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('should have license field', () => {
      expect(packageJson).toHaveProperty('license');
      expect(typeof packageJson.license).toBe('string');
      expect(packageJson.license.length).toBeGreaterThan(0);
    });
  });

  describe('Dependency validation', () => {
    it('should not have duplicate dependencies between dependencies and devDependencies', () => {
      const dependencies = Object.keys(packageJson.dependencies || {});
      const devDependencies = Object.keys(packageJson.devDependencies || {});

      const duplicates = dependencies.filter((dep) => devDependencies.includes(dep));

      expect(duplicates).toEqual([]);
    });

    it('should have matching React and React-DOM versions', () => {
      const reactVersion = packageJson.dependencies?.react;
      const reactDomVersion = packageJson.dependencies?.['react-dom'];

      expect(reactVersion).toBeDefined();
      expect(reactDomVersion).toBeDefined();

      // Extract the version number (removing ^ or ~ prefix)
      const normalizeVersion = (version: string) => version.replace(/^[\^~]/, '');

      expect(normalizeVersion(reactVersion)).toBe(normalizeVersion(reactDomVersion));
    });
  });
});

describe('tsconfig.json validation', () => {
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  // Read as text first to handle JSON with comments
  const tsconfigText = fs.readFileSync(tsconfigPath, 'utf-8');
  // Remove single-line comments for parsing
  const cleanedText = tsconfigText.replace(/\/\/.*$/gm, '');
  const tsconfig = JSON.parse(cleanedText);

  describe('Strict mode', () => {
    it('should have strict mode enabled', () => {
      expect(tsconfig.compilerOptions).toHaveProperty('strict');
      expect(tsconfig.compilerOptions.strict).toBe(true);
    });
  });

  describe('Path aliases', () => {
    it('should have @/* path alias configured', () => {
      expect(tsconfig.compilerOptions.paths).toHaveProperty('@/*');
      expect(tsconfig.compilerOptions.paths['@/*']).toContain('./src/*');
    });

    it('should have $/* path alias configured', () => {
      expect(tsconfig.compilerOptions.paths).toHaveProperty('$/*');
      expect(tsconfig.compilerOptions.paths['$/*']).toContain('./*');
    });
  });

  describe('Next.js recommended settings', () => {
    it('should have skipLibCheck enabled for faster builds', () => {
      expect(tsconfig.compilerOptions).toHaveProperty('skipLibCheck');
      expect(tsconfig.compilerOptions.skipLibCheck).toBe(true);
    });

    it('should have esModuleInterop enabled', () => {
      expect(tsconfig.compilerOptions).toHaveProperty('esModuleInterop');
      expect(tsconfig.compilerOptions.esModuleInterop).toBe(true);
    });

    it('should have resolveJsonModule enabled', () => {
      expect(tsconfig.compilerOptions).toHaveProperty('resolveJsonModule');
      expect(tsconfig.compilerOptions.resolveJsonModule).toBe(true);
    });

    it('should have isolatedModules enabled', () => {
      expect(tsconfig.compilerOptions).toHaveProperty('isolatedModules');
      expect(tsconfig.compilerOptions.isolatedModules).toBe(true);
    });

    it('should have noEmit enabled for Next.js', () => {
      expect(tsconfig.compilerOptions).toHaveProperty('noEmit');
      expect(tsconfig.compilerOptions.noEmit).toBe(true);
    });

    it('should have incremental enabled for faster rebuilds', () => {
      expect(tsconfig.compilerOptions).toHaveProperty('incremental');
      expect(tsconfig.compilerOptions.incremental).toBe(true);
    });

    it('should have Next.js plugin configured', () => {
      expect(tsconfig.compilerOptions).toHaveProperty('plugins');
      expect(Array.isArray(tsconfig.compilerOptions.plugins)).toBe(true);

      const nextPlugin = tsconfig.compilerOptions.plugins.find(
        (plugin: { name: string }) => plugin.name === 'next'
      );
      expect(nextPlugin).toBeDefined();
    });

    it('should use bundler module resolution', () => {
      expect(tsconfig.compilerOptions).toHaveProperty('moduleResolution');
      expect(tsconfig.compilerOptions.moduleResolution).toBe('bundler');
    });

    it('should include necessary lib entries for DOM and ESNext', () => {
      expect(tsconfig.compilerOptions).toHaveProperty('lib');
      expect(Array.isArray(tsconfig.compilerOptions.lib)).toBe(true);

      const lib = tsconfig.compilerOptions.lib.map((l: string) => l.toLowerCase());
      expect(lib).toContain('dom');
      expect(lib).toContain('esnext');
    });
  });
});
