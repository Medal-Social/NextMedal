import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { withSecurity } from '@/lib/core/safe-action';

// Mock schema for testing
const testSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

// Wrap schema with security
const secureSchema = withSecurity(testSchema);

describe('Secure Forms Validation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should reject bot-like instant submissions (< 3s)', () => {
    const now = new Date();
    const submissionTime = now.toISOString(); // "Instant" submission

    const result = secureSchema.safeParse({
      name: 'Test Bot',
      email: 'bot@example.com',
      _submissionTimestamp: submissionTime,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        'Please take a moment to review your information'
      );
    }
  });

  it('should reject submissions with filled honeypot', () => {
    // Simulate valid timing first
    const startTime = new Date();
    vi.advanceTimersByTime(5000); // 5 seconds later

    const result = secureSchema.safeParse({
      name: 'Honey Pot Bot',
      email: 'honey@example.com',
      _submissionTimestamp: startTime.toISOString(),
      _honeypot: 'I am a bot filling this field',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Please complete all fields correctly');
    }
  });

  it('should accept valid human submissions (> 3s and empty honeypot)', () => {
    const startTime = new Date();

    // Simulate 4 seconds passing
    vi.setSystemTime(new Date(startTime.getTime() + 4000));

    const result = secureSchema.safeParse({
      name: 'Real Human',
      email: 'human@example.com',
      _submissionTimestamp: startTime.toISOString(),
      _honeypot: '', // Empty is valid
    });

    expect(result.success).toBe(true);
  });

  it('should accept submissions without timestamp (backward compatibility/optional)', () => {
    // If timestamp is missing, the schema currently allows it (optional)
    // You might want to change this to required if strict security is needed
    const result = secureSchema.safeParse({
      name: 'Legacy Submission',
      email: 'legacy@example.com',
    });

    expect(result.success).toBe(true);
  });
});
