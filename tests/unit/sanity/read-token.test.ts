import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const originalEnv = { ...process.env };
const appRoot = resolve(__dirname, '../../..');
const read = (path: string) => readFileSync(resolve(appRoot, path), 'utf8');

function clientModulesImportingToken(): string[] {
  const hits: string[] = [];
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.next') continue;
        walk(fullPath);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(entry.name)) continue;
      const source = readFileSync(fullPath, 'utf8');
      if (!source.startsWith("'use client'") && !source.startsWith('"use client"')) continue;
      if (source.includes('@/sanity/lib/token') || source.includes('@/sanity/lib/live')) {
        hits.push(fullPath);
      }
    }
  };
  walk(resolve(appRoot, 'src'));
  return hits;
}

describe('Sanity read token', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.SANITY_API_READ_TOKEN;
    delete process.env.NEXT_PUBLIC_SANITY_BROWSER_TOKEN;
    delete process.env.NEXT_PHASE;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('reads the server Viewer token and ignores a public browser token', async () => {
    process.env.SANITY_API_READ_TOKEN = 'server-viewer-token';
    process.env.NEXT_PUBLIC_SANITY_BROWSER_TOKEN = 'public-browser-token';

    const { token } = await import('@/sanity/lib/token');

    expect(token).toBe('server-viewer-token');
  });

  it('throws at runtime when the server read token is missing, without echoing a token', async () => {
    process.env.NEXT_PUBLIC_SANITY_BROWSER_TOKEN = 'public-browser-token';

    try {
      await import('@/sanity/lib/token');
      expect.fail('expected a missing read token to throw');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      expect(message).toContain('Missing SANITY_API_READ_TOKEN environment variable');
      expect(message).not.toContain('public-browser-token');
    }
  });

  it('allows a production build to load when the read token is absent', async () => {
    process.env.NEXT_PHASE = 'phase-production-build';

    const { token } = await import('@/sanity/lib/token');

    expect(token).toBeUndefined();
  });

  it('treats a blank read token as missing', async () => {
    process.env.SANITY_API_READ_TOKEN = '   ';

    await expect(import('@/sanity/lib/token')).rejects.toThrow(
      'Missing SANITY_API_READ_TOKEN environment variable'
    );
  });

  it('imports server-only and never a NEXT_PUBLIC_ token', () => {
    const source = read('src/sanity/lib/token.ts');

    expect(source).toMatch(/import 'server-only'/);
    expect(source).not.toMatch(/NEXT_PUBLIC_/);
    expect(source).toMatch(/process\.env\['SANITY_API_READ_TOKEN'\]/);
  });

  it('keeps defineLive on the server token and does not pass a browser token', () => {
    const source = read('src/sanity/lib/live.ts');

    expect(source).toMatch(/import 'server-only'/);
    expect(source).toMatch(/serverToken:\s*token/);
    expect(source).toMatch(/browserToken:\s*false/);
    expect(source).not.toMatch(/NEXT_PUBLIC_/);
    expect(source).not.toMatch(/browserToken:\s*token/);
    expect(source).not.toMatch(/process\.env/);
  });

  it('is not imported from client modules', () => {
    expect(clientModulesImportingToken()).toEqual([]);
  });

  it('is absent from the client env module', () => {
    const source = read('src/lib/core/env.client.ts');

    expect(source).not.toMatch(/TOKEN/);
    expect(source).not.toMatch(/SANITY_API_READ_TOKEN/);
  });
});
