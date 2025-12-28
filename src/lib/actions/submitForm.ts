'use server';

import MedalSocialClient from '@medalsocial/sdk';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { actionClient, withSecurity } from '@/lib/safe-action';

const submissionSchema = withSecurity(
  z.object({
    intent: z.string(),
    data: z.record(z.string(), z.any()),
    metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  })
);

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

    const clientId = process.env.MEDAL_SOCIAL_CLIENT_ID;
    const clientSecret = process.env.MEDAL_SOCIAL_CLIENT_SECRET;
    const baseUrl = process.env.MEDAL_API_ENDPOINT;

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
            name: data.name || data.fullname || 'Anonymous',
            email: data.email,
            company: data.company,
            phone: data.phone || data.tel,
            content: data.message || data.content || 'Form submission (no message)',
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
            name: data.name || data.fullname || 'Subscriber',
            email: data.email,
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
            name: data.name || data.fullname || 'Downloader',
            email: data.email,
            content: `Resource Download: ${data.resource || 'Unknown'}`,
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
