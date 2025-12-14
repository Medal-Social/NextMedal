import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Static Asset Tests
 * Validates favicon files, web manifest, and icon configurations
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */
describe('Static Assets', () => {
  const publicDir = path.join(process.cwd(), 'public');

  describe('Favicon Files Existence (Requirement 11.1)', () => {
    it('should have favicon.ico file', () => {
      const faviconPath = path.join(publicDir, 'favicon.ico');
      expect(fs.existsSync(faviconPath)).toBe(true);
    });

    it('should have favicon.svg file', () => {
      const faviconPath = path.join(publicDir, 'favicon.svg');
      expect(fs.existsSync(faviconPath)).toBe(true);
    });

    it('should have apple-touch-icon.png file', () => {
      const iconPath = path.join(publicDir, 'apple-touch-icon.png');
      expect(fs.existsSync(iconPath)).toBe(true);
    });
  });

  describe('Web Manifest Properties (Requirement 11.2)', () => {
    it('should have site.webmanifest file', () => {
      const manifestPath = path.join(publicDir, 'site.webmanifest');
      expect(fs.existsSync(manifestPath)).toBe(true);
    });

    it('should have valid JSON in site.webmanifest', () => {
      const manifestPath = path.join(publicDir, 'site.webmanifest');
      const content = fs.readFileSync(manifestPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should have name property', () => {
      const manifestPath = path.join(publicDir, 'site.webmanifest');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(manifest).toHaveProperty('name');
      expect(typeof manifest.name).toBe('string');
      expect(manifest.name.length).toBeGreaterThan(0);
    });

    it('should have short_name property', () => {
      const manifestPath = path.join(publicDir, 'site.webmanifest');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(manifest).toHaveProperty('short_name');
      expect(typeof manifest.short_name).toBe('string');
      expect(manifest.short_name.length).toBeGreaterThan(0);
    });

    it('should have icons property', () => {
      const manifestPath = path.join(publicDir, 'site.webmanifest');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(manifest).toHaveProperty('icons');
      expect(Array.isArray(manifest.icons)).toBe(true);
      expect(manifest.icons.length).toBeGreaterThan(0);
    });

    it('should have start_url property', () => {
      const manifestPath = path.join(publicDir, 'site.webmanifest');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(manifest).toHaveProperty('start_url');
      expect(typeof manifest.start_url).toBe('string');
    });

    it('should have display property', () => {
      const manifestPath = path.join(publicDir, 'site.webmanifest');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(manifest).toHaveProperty('display');
      expect(['standalone', 'fullscreen', 'minimal-ui', 'browser']).toContain(manifest.display);
    });
  });

  describe('Web Manifest Icon Sizes (Requirement 11.3)', () => {
    it('should have 192x192 icon size', () => {
      const manifestPath = path.join(publicDir, 'site.webmanifest');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const has192 = manifest.icons.some((icon: { sizes?: string }) => icon.sizes === '192x192');
      expect(has192).toBe(true);
    });

    it('should have 512x512 icon size', () => {
      const manifestPath = path.join(publicDir, 'site.webmanifest');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const has512 = manifest.icons.some((icon: { sizes?: string }) => icon.sizes === '512x512');
      expect(has512).toBe(true);
    });

    it('should have icon files that exist for each manifest icon', () => {
      const manifestPath = path.join(publicDir, 'site.webmanifest');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

      for (const icon of manifest.icons) {
        const iconSrc = icon.src.startsWith('/') ? icon.src.slice(1) : icon.src;
        const iconPath = path.join(publicDir, iconSrc);
        expect(fs.existsSync(iconPath)).toBe(true);
      }
    });
  });

  describe('Favicon Format Validation (Requirement 11.4)', () => {
    it('should have valid ICO file format for favicon.ico', () => {
      const faviconPath = path.join(publicDir, 'favicon.ico');
      const buffer = fs.readFileSync(faviconPath);
      // ICO files start with 00 00 01 00 (reserved, type=1 for ICO)
      // or can be PNG format (89 50 4E 47)
      const isIco = buffer[0] === 0 && buffer[1] === 0 && buffer[2] === 1 && buffer[3] === 0;
      const isPng =
        buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
      expect(isIco || isPng).toBe(true);
    });

    it('should have valid SVG file format for favicon.svg', () => {
      const faviconPath = path.join(publicDir, 'favicon.svg');
      const content = fs.readFileSync(faviconPath, 'utf-8');
      // SVG files should contain <svg tag
      expect(content).toContain('<svg');
    });

    it('should have valid PNG file format for apple-touch-icon.png', () => {
      const iconPath = path.join(publicDir, 'apple-touch-icon.png');
      const buffer = fs.readFileSync(iconPath);
      // PNG files start with 89 50 4E 47 0D 0A 1A 0A
      const isPng =
        buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
      expect(isPng).toBe(true);
    });

    it('should have valid PNG file format for web manifest icons', () => {
      const manifestPath = path.join(publicDir, 'site.webmanifest');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

      for (const icon of manifest.icons) {
        if (icon.type === 'image/png') {
          const iconSrc = icon.src.startsWith('/') ? icon.src.slice(1) : icon.src;
          const iconPath = path.join(publicDir, iconSrc);
          const buffer = fs.readFileSync(iconPath);
          // PNG files start with 89 50 4E 47
          const isPng =
            buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
          expect(isPng).toBe(true);
        }
      }
    });
  });
});
