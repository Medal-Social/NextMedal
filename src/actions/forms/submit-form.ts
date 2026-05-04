'use server';

import { Medal } from '@medalsocial/sdk';
import { z } from 'zod';
import { env } from '@/lib/core/env';
import { logger } from '@/lib/core/logger';
import { actionClient, withSecurity } from '@/lib/core/safe-action';
import { withRetry } from '@/lib/utils';

const submissionSchema = withSecurity(
  z.object({
    intent: z.string(),
    data: z.record(z.string(), z.unknown()),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
);

// Helper to safely get string value from data
function getString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function getStringOrUndefined(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  return String(value);
}

// Split a "Full Name" into first/last for the Contacts API.
function splitName(input: string): { first_name?: string; last_name?: string } {
  const parts = input.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return {};
  if (parts.length === 1) return { first_name: parts[0] };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}

export const submitForm = actionClient
  .schema(submissionSchema)
  .action(async ({ parsedInput: { intent, data, metadata = {} } }) => {
    // If honeypot is filled, return fake success (already handled by Zod refinement,
    // but we can add extra logic here if we want to return a specific "success" message
    // without doing any work).
    if (data._honeypot) {
      logger.warn('Bot submission blocked via honeypot');
      return { success: true };
    }

    const token = env.MEDAL_API_TOKEN;
    const baseUrl = env.MEDAL_API_ENDPOINT;

    if (!token) {
      logger.error('Missing MEDAL_API_TOKEN');
      return { error: 'This form is temporarily unavailable. Please try again later.' };
    }

    const medal = new Medal(token, baseUrl ? { baseUrl } : undefined);

    // Map every form intent to a contacts.create call. The SDK's
    // CreateContactInput accepts inline notes, so a single create
    // covers what the legacy createNote() endpoint did.
    function buildContactInput(opts: {
      defaultName: string;
      noteContent: string;
      labels?: string[];
    }) {
      const fullName = getString(data.name || data.fullname) || opts.defaultName;
      return {
        email: getString(data.email),
        ...splitName(fullName),
        company: getStringOrUndefined(data.company),
        phone: getStringOrUndefined(data.phone || data.tel),
        labels: opts.labels,
        notes: { content: opts.noteContent },
        custom_fields: {
          ...metadata,
          ...data,
          intent,
        },
      };
    }

    try {
      switch (intent) {
        case 'lead':
        case 'contact':
          await withRetry(
            () =>
              medal.contacts.create(
                buildContactInput({
                  defaultName: 'Anonymous',
                  noteContent:
                    getString(data.message || data.content) || 'Form submission (no message)',
                  labels: ['lead'],
                })
              ),
            { retries: 3, delay: 1000 }
          );
          break;

        case 'newsletter':
          await withRetry(
            () =>
              medal.contacts.create(
                buildContactInput({
                  defaultName: 'Subscriber',
                  noteContent: 'Newsletter Subscription',
                  labels: ['newsletter'],
                })
              ),
            { retries: 3, delay: 1000 }
          );
          break;

        case 'download':
          await withRetry(
            () =>
              medal.contacts.create(
                buildContactInput({
                  defaultName: 'Downloader',
                  noteContent: `Resource Download: ${getString(data.resource) || 'Unknown'}`,
                  labels: ['download'],
                })
              ),
            { retries: 3, delay: 1000 }
          );
          break;

        default:
          logger.warn(`Unknown submission intent: ${intent}`);
          return { error: 'This form is not set up correctly. Please contact support.' };
      }

      return { success: true };
    } catch (error) {
      logger.error({ err: error, intent }, 'Form submission error');
      return { error: "We couldn't process your submission. Please try again in a few moments." };
    }
  });
