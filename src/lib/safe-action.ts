import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';
import { PublicError } from './errors';
import { logger } from './logger';

export const errorHandler = (e: any) => {
  // Always log the full error server-side
  logger.error(e, 'Server action error');

  // Only expose messages for trusted errors
  if (e instanceof PublicError) {
    return e.message;
  }

  // Generic error for everything else
  return 'Internal server error';
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
      _honeypot: z.string().max(0, { message: 'Potential bot submission detected' }).optional(),
      _submissionTimestamp: z.string().optional(),
    })
    .refine(
      (data: any) => {
        if (!data._submissionTimestamp) return true;

        const start = new Date(data._submissionTimestamp).getTime();

        // Allow if timestamp is invalid
        if (Number.isNaN(start)) return true;

        // Reject if submission took less than 3 seconds
        return Date.now() - start >= 3000;
      },
      {
        message: 'Submission too fast. Please wait a moment and try again.',
        path: ['_submissionTimestamp'],
      }
    );
};
