'use server';

import type { Medal } from '@medalsocial/sdk';
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

interface SubmissionContext {
  medal: Medal;
  email: string;
  firstName?: string;
  company?: string;
  phone?: string;
  message?: string;
  metadata: Record<string, unknown>;
  data: Record<string, unknown>;
  intent: string;
}

async function handleLeadOrContact(ctx: SubmissionContext): Promise<void> {
  try {
    const { data: contact } = await ctx.medal.contacts.create({
      email: ctx.email,
      first_name: ctx.firstName,
      company: ctx.company,
      phone: ctx.phone,
      status: 'lead',
      labels: [ctx.intent],
      custom_fields: { ...ctx.metadata, source: ctx.metadata.url || 'contact-form' },
    });
    if (ctx.message && contact?.id) {
      await ctx.medal.contacts.addNote(contact.id, { content: ctx.message });
    }
  } catch (err) {
    logger.error({ err, intent: ctx.intent }, '[medal-sdk] contacts.create failed (non-fatal)');
  }
}

async function handleNewsletter(ctx: SubmissionContext): Promise<void> {
  try {
    await ctx.medal.contacts.create({
      email: ctx.email,
      first_name: ctx.firstName,
      status: 'lead',
      email_status: 'subscribed',
      labels: ['newsletter'],
      custom_fields: { source: 'newsletter-form' },
    });
  } catch (err) {
    logger.error({ err, intent: ctx.intent }, '[medal-sdk] contacts.create failed (non-fatal)');
  }
}

async function handleDownload(ctx: SubmissionContext): Promise<void> {
  try {
    await ctx.medal.contacts.create({
      email: ctx.email,
      first_name: ctx.firstName,
      status: 'lead',
      labels: ['download'],
      custom_fields: {
        source: 'download-form',
        resource: getString(ctx.data.resource) || 'unknown',
      },
    });
  } catch (err) {
    logger.error({ err, intent: ctx.intent }, '[medal-sdk] contacts.create failed (non-fatal)');
  }
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

    try {
      const medal = await getMedal();
      if (!medal) {
        // Sanity is the source of truth — SDK is best-effort and may
        // be unconfigured. Acknowledge the submission either way.
        return { success: true };
      }

      const ctx: SubmissionContext = {
        medal,
        email,
        firstName: getStringOrUndefined(data.name || data.fullname),
        company: getStringOrUndefined(data.company),
        phone: getStringOrUndefined(data.phone || data.tel),
        message: getStringOrUndefined(data.message || data.content),
        metadata,
        data,
        intent,
      };

      switch (intent) {
        case 'lead':
        case 'contact':
          await handleLeadOrContact(ctx);
          break;
        case 'newsletter':
          await handleNewsletter(ctx);
          break;
        case 'download':
          await handleDownload(ctx);
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
