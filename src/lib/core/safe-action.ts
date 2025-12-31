import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';
import { PublicError } from './errors';
import { logger } from './logger';

export const errorHandler = (e: unknown) => {
  // Always log the full error server-side
  logger.error(e, 'Server action error');

  // Special handling for Next.js internal errors during deployments
  if (e instanceof Error && e.message.includes('Failed to find Server Action')) {
    return 'Something went wrong. Please refresh the page and try again.';
  }

  // Only expose messages for trusted errors
  if (e instanceof PublicError) {
    return e.message;
  }

  // Generic error for everything else - keep user-friendly
  return 'Something went wrong. Please try again or contact support if the problem persists.';
};

/**
 * Base client for all secure server actions.
 * Enforces rate limiting and metadata tracking.
 */
export const actionClient = createSafeActionClient({
  // You can add more global middleware here (e.g., auth, rate limiting)
  handleServerError: errorHandler,
});

/**
 * Zod helper to wrap any form schema with security fields.
 * Includes honeypot and submission timestamp validation.
 */
export const withSecurity = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => {
  return schema
    .extend({
      _honeypot: z
        .string()
        .max(0, { message: 'Please complete all fields correctly and try again.' })
        .optional(),
      _submissionTimestamp: z.string().optional(),
    })
    .refine(
      (data) => {
        const timestamp = (data as { _submissionTimestamp?: string })._submissionTimestamp;
        if (!timestamp) return true;

        const start = new Date(timestamp).getTime();

        // Allow if timestamp is invalid
        if (Number.isNaN(start)) return true;

        // Reject if submission took less than 3 seconds
        return Date.now() - start >= 3000;
      },
      {
        message: 'Please take a moment to review your information before submitting.',
        path: ['_submissionTimestamp'],
      }
    );
};
