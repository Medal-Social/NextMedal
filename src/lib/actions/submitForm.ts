'use server';

import MedalSocialClient from '@medalsocial/sdk';
import { z } from 'zod';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { actionClient, withSecurity } from '@/lib/safe-action';

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

    const clientId = env.MEDAL_SOCIAL_CLIENT_ID;
    const clientSecret = env.MEDAL_SOCIAL_CLIENT_SECRET;
    const baseUrl = env.MEDAL_API_ENDPOINT;

    if (!clientId || !clientSecret) {
      logger.error('Missing Medal Social credentials');
      return { error: 'Internal configuration error' };
    }

    const client = new MedalSocialClient({
      auth: {
        kind: 'basic',
        clientId,
        clientSecret,
      },
      baseUrl,
    });

    try {
      switch (intent) {
        case 'lead':
        case 'contact':
          // Handle lead generation via Medal Social SDK
          await client.createNote({
            name: getString(data.name || data.fullname) || 'Anonymous',
            email: getString(data.email),
            company: getStringOrUndefined(data.company),
            phone: getStringOrUndefined(data.phone || data.tel),
            content: getString(data.message || data.content) || 'Form submission (no message)',
            metadata: {
              ...metadata,
              ...data,
            },
          });
          break;

        case 'newsletter':
          // Handle newsletter subscription
          // For now, we also record this as a lead in Medal Social with a special tag/metadata
          await client.createNote({
            name: getString(data.name || data.fullname) || 'Subscriber',
            email: getString(data.email),
            content: 'Newsletter Subscription',
            metadata: {
              ...metadata,
              ...data,
              intent: 'newsletter',
            },
          });
          break;

        case 'download':
          // Handle resource download
          await client.createNote({
            name: getString(data.name || data.fullname) || 'Downloader',
            email: getString(data.email),
            content: `Resource Download: ${getString(data.resource) || 'Unknown'}`,
            metadata: {
              ...metadata,
              ...data,
              intent: 'download',
            },
          });
          break;

        default:
          logger.warn(`Unknown submission intent: ${intent}`);
          return { error: 'Invalid form configuration' };
      }

      return { success: true };
    } catch (error) {
      logger.error({ err: error, intent }, 'Form submission error');
      return { error: 'Failed to submit form. Please try again later.' };
    }
  });
