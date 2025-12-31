'use server';

import { z } from 'zod';
import { PublicError } from '@/lib/core/errors';
import { actionClient, withSecurity } from '@/lib/core/safe-action';
import { withRetry } from '@/lib/utils';
import { writeClient } from '@/sanity/lib/client';

const leadSchema = withSecurity(
  z.object({
    email: z.email('Please enter a valid email address'),
    name: z.string().optional(),
    company: z.string().optional(),
    jobTitle: z.string().optional(),
    phone: z.string().optional(),
    consent: z.boolean().optional(),
    source: z.object({
      type: z.enum(['event', 'newsletter', 'download', 'contact', 'other']),
      referenceId: z.string().optional(),
      url: z.string().optional(),
    }),
    language: z.string().optional(),
  })
);

export const captureLead = actionClient.schema(leadSchema).action(async ({ parsedInput }) => {
  const { email, name, company, jobTitle, phone, consent, source, language } = parsedInput;

  // Check if write token is configured
  if (!writeClient.config().token) {
    throw new PublicError('Lead capture is not configured. Please contact the site administrator.');
  }

  // Check for existing lead with same email + source reference (with retry for network resilience)
  const existingLead = await withRetry(
    () =>
      writeClient.fetch(
        `*[_type == "lead" && email == $email && source.reference._ref == $referenceId][0]._id`,
        { email, referenceId: source.referenceId || '' }
      ),
    { retries: 3, delay: 1000 }
  );

  if (existingLead) {
    // Already registered - return success without creating duplicate
    return {
      success: true,
      message: 'You are already registered!',
      leadId: existingLead,
      alreadyRegistered: true,
    };
  }

  // Create new lead document (with retry for network resilience)
  const lead = await withRetry(
    () =>
      writeClient.create({
        _type: 'lead',
        email,
        name: name || undefined,
        company: company || undefined,
        jobTitle: jobTitle || undefined,
        phone: phone || undefined,
        consent: consent ?? false,
        source: {
          type: source.type,
          reference: source.referenceId
            ? { _type: 'reference', _ref: source.referenceId }
            : undefined,
          url: source.url || undefined,
        },
        language: language || undefined,
        createdAt: new Date().toISOString(),
      }),
    { retries: 3, delay: 1000 }
  );

  return {
    success: true,
    message: 'Successfully registered!',
    leadId: lead._id,
    alreadyRegistered: false,
  };
});
