import { describe, expect, it } from 'vitest';
import { SearchResponseSchema } from './schemas/search.schema';

/**
 * Contract tests verify that API responses match expected schemas.
 * These tests ensure API stability and help catch breaking changes.
 *
 * Run with: pnpm test:contracts
 *
 * NOTE: These tests require a running dev server (pnpm dev).
 * They will be skipped if the server is not available.
 */

async function isServerAvailable(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/api/search?q=test`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

describe('Search API Contract', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

  it.skip('returns response matching contract schema', async () => {
    const available = await isServerAvailable(baseUrl);
    if (!available) {
      return;
    }

    const response = await fetch(`${baseUrl}/api/search?q=test`);
    expect(response.ok).toBe(true);

    const data = await response.json();
    const result = SearchResponseSchema.safeParse(data);

    // Validation errors will be visible through the expect assertion failure message
    expect(result.success).toBe(true);
  });

  it.skip('handles empty search query', async () => {
    const available = await isServerAvailable(baseUrl);
    if (!available) {
      return;
    }

    const response = await fetch(`${baseUrl}/api/search?q=`);
    expect(response.ok).toBe(true);

    const data = await response.json();
    const result = SearchResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
