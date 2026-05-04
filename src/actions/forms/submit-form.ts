'use server';

import { z } from 'zod';
import { logger } from '@/lib/core/logger';
import { actionClient, withSecurity } from '@/lib/core/safe-action';
import { getMedal } from '@/lib/medal-sdk/client';

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
  const str = String(value).trim();
  return str.length > 0 ? str : undefined;
}

export const submitForm = actionClient
  .schema(submissionSchema)
  .action(async ({ parsedInput: { intent, data, metadata = {} } }) => {
    if (data._honeypot) {
      logger.warn('Bot submission blocked via honeypot');
      return { success: true };
    }

    const email = getString(data.email);
    if (!email) {
      return { error: 'Email is required.' };
    }

    const firstName = getStringOrUndefined(data.name || data.fullname);
    const company = getStringOrUndefined(data.company);
    const phone = getStringOrUndefined(data.phone || data.tel);
    const message = getStringOrUndefined(data.message || data.content);

    try {
      const medal = await getMedal();

      switch (intent) {
        case 'lead':
        case 'contact': {
          if (medal) {
            try {
              const { data: contact } = await medal.contacts.create({
                email,
                first_name: firstName,
                company,
                phone,
                status: 'lead',
                labels: [intent],
                custom_fields: { ...metadata, source: metadata.url || 'contact-form' },
              });
              if (message && contact?.id) {
                await medal.contacts.addNote(contact.id, { content: message });
              }
            } catch (err) {
              logger.error({ err, intent }, '[medal-sdk] contacts.create failed (non-fatal)');
            }
          }
          break;
        }

        case 'newsletter': {
          if (medal) {
            try {
              await medal.contacts.create({
                email,
                first_name: firstName,
                status: 'lead',
                email_status: 'subscribed',
                labels: ['newsletter'],
                custom_fields: { source: 'newsletter-form' },
              });
            } catch (err) {
              logger.error({ err, intent }, '[medal-sdk] contacts.create failed (non-fatal)');
            }
          }
          break;
        }

        case 'download': {
          if (medal) {
            try {
              await medal.contacts.create({
                email,
                first_name: firstName,
                status: 'lead',
                labels: ['download'],
                custom_fields: {
                  source: 'download-form',
                  resource: getString(data.resource) || 'unknown',
                },
              });
            } catch (err) {
              logger.error({ err, intent }, '[medal-sdk] contacts.create failed (non-fatal)');
            }
          }
          break;
        }

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
