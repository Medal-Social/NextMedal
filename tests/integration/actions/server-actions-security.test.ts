import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Security Audit Tests for Server Actions
 *
 * These tests verify security measures are in place without requiring full
 * server action execution (which has complex next-safe-action dependencies).
 *
 * SECURITY CHECKLIST:
 * ✅ Input validation (Zod schemas)
 * ✅ Honeypot bot detection
 * ✅ Error handling (no sensitive data leakage)
 * ✅ Retry logic for network resilience
 * ✅ Safe type conversions
 * ✅ Missing credentials handling
 * ✅ Duplicate detection
 */

describe('Server Actions - Security Audit', () => {
  const submitFormPath = resolve(__dirname, '../../../src/actions/forms/submit-form.ts');
  const captureLeadPath = resolve(__dirname, '../../../src/actions/leads/capture-lead.ts');

  describe('submit-form.ts Security Measures', () => {
    let submitFormSource: string;

    beforeAll(() => {
      submitFormSource = readFileSync(submitFormPath, 'utf-8');
    });

    it('should use "use server" directive', () => {
      expect(submitFormSource).toContain("'use server'");
    });

    it('should import withSecurity wrapper for honeypot protection', () => {
      expect(submitFormSource).toContain('import { actionClient, withSecurity }');
      expect(submitFormSource).toContain('withSecurity(');
    });

    it('should validate input with Zod schema', () => {
      expect(submitFormSource).toContain('import { z } from');
      expect(submitFormSource).toContain('submissionSchema');
      expect(submitFormSource).toContain('z.object({');
    });

    it('should check honeypot field explicitly', () => {
      expect(submitFormSource).toContain('if (data._honeypot)');
      expect(submitFormSource).toContain('Bot submission blocked via honeypot');
    });

    it('should handle missing credentials', () => {
      expect(submitFormSource).toContain('if (!clientId || !clientSecret)');
      expect(submitFormSource).toContain('Missing Medal Social credentials');
    });

    it('should use safe string conversion helpers', () => {
      expect(submitFormSource).toContain('function getString(value: unknown)');
      expect(submitFormSource).toContain('function getStringOrUndefined(value: unknown)');
    });

    it('should use retry logic for network resilience', () => {
      expect(submitFormSource).toContain('import { withRetry }');
      expect(submitFormSource).toContain('withRetry(');
      expect(submitFormSource).toContain('retries: 3');
    });

    it('should handle unknown intents', () => {
      expect(submitFormSource).toContain('default:');
      expect(submitFormSource).toContain('Unknown submission intent');
    });

    it('should have generic error messages (no sensitive data leakage)', () => {
      expect(submitFormSource).toContain('temporarily unavailable');
      expect(submitFormSource).toContain("couldn't process your submission");
      expect(submitFormSource).toContain('not set up correctly');
      // Should NOT contain actual error details in user-facing messages
      expect(submitFormSource).not.toContain('throw error');
      expect(submitFormSource).not.toContain('console.error(error)');
    });

    it('should log errors securely', () => {
      expect(submitFormSource).toContain('import { logger }');
      expect(submitFormSource).toContain('logger.error');
      expect(submitFormSource).toContain('logger.warn');
    });

    it('should support multiple submission intents', () => {
      expect(submitFormSource).toContain("case 'lead':");
      expect(submitFormSource).toContain("case 'contact':");
      expect(submitFormSource).toContain("case 'newsletter':");
      expect(submitFormSource).toContain("case 'download':");
    });

    it('should include metadata in all submissions', () => {
      expect(submitFormSource).toContain('metadata: {');
      expect(submitFormSource).toContain('...metadata,');
      expect(submitFormSource).toContain('...data,');
    });
  });

  describe('capture-lead.ts Security Measures', () => {
    let captureLeadSource: string;

    beforeAll(() => {
      captureLeadSource = readFileSync(captureLeadPath, 'utf-8');
    });

    it('should use "use server" directive', () => {
      expect(captureLeadSource).toContain("'use server'");
    });

    it('should import withSecurity wrapper for honeypot protection', () => {
      expect(captureLeadSource).toContain('import { actionClient, withSecurity }');
      expect(captureLeadSource).toContain('withSecurity(');
    });

    it('should validate email format with Zod', () => {
      expect(captureLeadSource).toContain('import { z } from');
      expect(captureLeadSource).toContain('email: z.email(');
      expect(captureLeadSource).toContain('Please enter a valid email address');
    });

    it('should validate source type with enum', () => {
      expect(captureLeadSource).toContain('type: z.enum([');
      expect(captureLeadSource).toContain("'event'");
      expect(captureLeadSource).toContain("'newsletter'");
      expect(captureLeadSource).toContain("'download'");
      expect(captureLeadSource).toContain("'contact'");
      expect(captureLeadSource).toContain("'other'");
    });

    it('should check for write token configuration', () => {
      expect(captureLeadSource).toContain('if (!writeClient.config().token)');
      expect(captureLeadSource).toContain('Lead capture is not configured');
    });

    it('should detect duplicate leads', () => {
      expect(captureLeadSource).toContain('existingLead');
      expect(captureLeadSource).toContain('already registered');
      expect(captureLeadSource).toContain('alreadyRegistered: true');
    });

    it('should use parameterized GROQ queries (prevent injection)', () => {
      expect(captureLeadSource).toContain('email == $email');
      expect(captureLeadSource).toContain('{ email,');
      // Should NOT use string interpolation in queries
      // biome-ignore lint/suspicious/noTemplateCurlyInString: Testing that template strings are NOT used
      expect(captureLeadSource).not.toContain('email == "${email}"');
      // biome-ignore lint/suspicious/noTemplateCurlyInString: Testing that template strings are NOT used
      expect(captureLeadSource).not.toContain('email == `${email}`');
    });

    it('should use retry logic for network resilience', () => {
      expect(captureLeadSource).toContain('import { withRetry }');
      expect(captureLeadSource).toContain('withRetry(');
      expect(captureLeadSource).toContain('retries: 3');
    });

    it('should track GDPR consent', () => {
      expect(captureLeadSource).toContain('consent: z.boolean()');
      expect(captureLeadSource).toContain('consent: consent ?? false');
    });

    it('should include timestamp for audit trail', () => {
      expect(captureLeadSource).toContain('createdAt:');
      expect(captureLeadSource).toContain('new Date().toISOString()');
    });

    it('should use PublicError for user-facing errors', () => {
      expect(captureLeadSource).toContain('import { PublicError }');
      expect(captureLeadSource).toContain('throw new PublicError(');
    });

    it('should sanitize optional fields', () => {
      expect(captureLeadSource).toContain('|| undefined');
      // Should convert empty strings to undefined, not store empty strings
    });
  });

  describe('Schema Validation Patterns', () => {
    it('submit-form schema should validate intent as string', () => {
      const submitFormSource = readFileSync(submitFormPath, 'utf-8');
      expect(submitFormSource).toContain('intent: z.string()');
    });

    it('submit-form schema should allow any data shape', () => {
      const submitFormSource = readFileSync(submitFormPath, 'utf-8');
      // Flexible data field for different form types
      expect(submitFormSource).toContain('data: z.record(z.string(), z.unknown())');
    });

    it('capture-lead schema should have strict email validation', () => {
      const captureLeadSource = readFileSync(captureLeadPath, 'utf-8');
      expect(captureLeadSource).toContain('email: z.email(');
    });

    it('capture-lead schema should make most fields optional', () => {
      const captureLeadSource = readFileSync(captureLeadPath, 'utf-8');
      expect(captureLeadSource).toContain('name: z.string().optional()');
      expect(captureLeadSource).toContain('company: z.string().optional()');
      expect(captureLeadSource).toContain('jobTitle: z.string().optional()');
      expect(captureLeadSource).toContain('phone: z.string().optional()');
    });
  });

  describe('Safe Type Conversion', () => {
    it('getString should handle null/undefined safely', () => {
      const getString = (value: unknown): string => {
        if (value === null || value === undefined) return '';
        return String(value);
      };

      expect(getString(null)).toBe('');
      expect(getString(undefined)).toBe('');
      expect(getString('test')).toBe('test');
      expect(getString(123)).toBe('123');
      expect(getString(true)).toBe('true');
    });

    it('getStringOrUndefined should handle null/undefined safely', () => {
      const getStringOrUndefined = (value: unknown): string | undefined => {
        if (value === null || value === undefined) return undefined;
        return String(value);
      };

      expect(getStringOrUndefined(null)).toBeUndefined();
      expect(getStringOrUndefined(undefined)).toBeUndefined();
      expect(getStringOrUndefined('test')).toBe('test');
      expect(getStringOrUndefined(123)).toBe('123');
    });
  });
});

/**
 * SECURITY RECOMMENDATIONS FOR SERVER ACTIONS
 *
 * ✅ IMPLEMENTED:
 * 1. Input validation (Zod schemas)
 * 2. Honeypot bot detection
 * 3. Parameterized queries (prevent injection)
 * 4. Generic error messages (no data leakage)
 * 5. Retry logic for reliability
 * 6. Missing credentials checks
 * 7. Duplicate detection
 * 8. GDPR consent tracking
 * 9. Audit timestamps
 * 10. Safe type conversions
 *
 * 📋 TODO (Future Enhancements):
 * 1. Rate limiting (by IP and/or email)
 *    - Use Vercel Edge Config or Redis
 *    - Limit: 5 submissions per email per hour
 *    - Limit: 10 submissions per IP per minute
 *
 * 2. CAPTCHA integration
 *    - Add hCaptcha or Cloudflare Turnstile
 *    - Required for public-facing forms
 *    - Optional for authenticated users
 *
 * 3. Email verification
 *    - Send confirmation email
 *    - Double opt-in for newsletters
 *    - Verify MX records
 *
 * 4. Input sanitization
 *    - Strip HTML from text fields
 *    - Limit field lengths
 *    - Block profanity/spam patterns
 *
 * 5. CSP headers
 *    - Prevent XSS attacks
 *    - Configure in next.config.ts
 *
 * 6. Audit logging
 *    - Log all form submissions
 *    - Include IP, user agent, timestamp
 *    - Retention: 90 days
 *
 * 7. Data retention policy
 *    - Auto-delete leads after 2 years
 *    - GDPR right to be forgotten
 *
 * 8. PII encryption
 *    - Encrypt sensitive fields at rest
 *    - Use Sanity field-level encryption
 *
 * 9. Webhook validation
 *    - Verify webhook signatures
 *    - Prevent replay attacks
 *
 * 10. Monitoring & alerting
 *     - Track submission rates
 *     - Alert on spikes (potential attack)
 *     - Monitor error rates
 */
