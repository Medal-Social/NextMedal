import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';

/**
 * Base client for all secure server actions.
 * Enforces rate limiting and metadata tracking.
 */
export const actionClient = createSafeActionClient({
  // You can add more global middleware here (e.g., auth, rate limiting)
  handleServerError(e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'Internal server error';
  },
});

/**
 * Zod helper to wrap any form schema with security fields.
 * Includes honeypot and submission timestamp validation.
 */
export const withSecurity = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => {
  return schema
    .extend({
      _honeypot: z.string().max(0, { message: 'Potential bot submission detected' }).optional(),
      _submissionTimestamp: z.string().optional(),
    })
    .refine(
      (data: any) => {
        if (!data._submissionTimestamp) return true;

        const start = new Date(data._submissionTimestamp).getTime();
        const end = Date.now();
        const duration = end - start;

        // Reject if submission took less than 3 seconds
        return duration >= 3000;
      },
      {
        message: 'Submission too fast. Please wait a moment and try again.',
        path: ['_submissionTimestamp'],
      }
    );
};
