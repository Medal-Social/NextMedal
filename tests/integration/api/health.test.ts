import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/health/route';

// No mocks needed - NextResponse works correctly in test environment

describe('Health API', () => {
  it('returns ok status', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.status).toBe('ok');
  });

  it('includes timestamp in ISO format', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.timestamp).toBeDefined();
    // Verify it's a valid ISO date string
    const date = new Date(data.timestamp);
    expect(date.toISOString()).toBe(data.timestamp);
  });

  it('returns JSON response', async () => {
    const response = await GET();
    const data = await response.json();

    expect(typeof data).toBe('object');
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('timestamp');
  });
});
