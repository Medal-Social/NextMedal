import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/health/route';
import { HealthResponseSchema } from './schemas/health.schema';

/**
 * Contract tests for the Health API endpoint.
 * Validates response shape for monitoring and health check consumers.
 */
describe('Health API Contract', () => {
  describe('Response Schema Validation', () => {
    it('response matches HealthResponse schema', async () => {
      const response = await GET();
      const data = await response.json();

      // Validate against Zod schema
      const result = HealthResponseSchema.safeParse(data);

      if (!result.success) {
        console.error('Schema validation errors:', result.error.format());
      }

      expect(result.success).toBe(true);
    });

    it('status is always "ok"', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.status).toBe('ok');
    });

    it('timestamp is valid ISO 8601 format', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.timestamp).toBeDefined();

      // Verify it's a valid ISO date
      const date = new Date(data.timestamp);
      expect(date.toISOString()).toBe(data.timestamp);
    });

    it('HTTP status is 200', async () => {
      const response = await GET();

      expect(response.status).toBe(200);
    });
  });

  describe('Schema Backward Compatibility', () => {
    it('contains required fields for v1 consumers', async () => {
      const response = await GET();
      const data = await response.json();

      // These fields must always be present
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('timestamp');
    });

    it('does not contain unexpected fields', async () => {
      const response = await GET();
      const data = await response.json();

      // Only expected fields should be present
      const allowedFields = ['status', 'timestamp'];
      const actualFields = Object.keys(data);

      for (const field of actualFields) {
        expect(allowedFields).toContain(field);
      }
    });
  });
});
