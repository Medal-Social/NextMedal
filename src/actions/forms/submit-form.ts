'use server';

import { z } from 'zod';
import { logger } from '@/lib/core/logger';
import { actionClient, withSecurity } from '@/lib/core/safe-action';
import { isConsentRequired } from '@/lib/forms/consent-required';
import { getMedal } from '@/lib/medal-sdk/client';
import {
  noteLines,
  recordSubmission,
  SUBMISSION_UNAVAILABLE_MESSAGE,
  type Submission,
} from '@/lib/medal-sdk/record-submission';

const submissionSchema = withSecurity(
  z.object({
    intent: z.string(),
    // Sanity `form` document id. Used to resolve the consent requirement from
    // the dataset instead of trusting the browser.
    formId: z.string().optional(),
    consent: z.boolean().optional(),
    // Client hint, only consulted when the authoritative Sanity lookup fails.
    requireConsent: z.boolean().optional(),
    data: z.record(z.string(), z.unknown()),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
);

/** Form intents Medal receives. */
const SUPPORTED_INTENTS = ['lead', 'contact', 'newsletter', 'download'] as const;
type SupportedIntent = (typeof SUPPORTED_INTENTS)[number];

function isSupportedIntent(intent: string): intent is SupportedIntent {
  return (SUPPORTED_INTENTS as readonly string[]).includes(intent);
}

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

/**
 * Everything already sent as a contact field or a note line. Whatever is left
 * is caller-specific context — the brand-test widgets submit scores, a profile
 * key and an answer vector — and goes into the note as JSON.
 */
const MAPPED_DATA_KEYS = new Set([
  'email',
  'name',
  'fullname',
  'company',
  'jobTitle',
  'title',
  'phone',
  'tel',
  'message',
  'content',
  'resource',
  '_honeypot',
  '_submissionTimestamp',
]);
const MAPPED_METADATA_KEYS = new Set(['locale', 'url']);

/** Keep the note bounded. */
const MAX_CONTEXT_LENGTH = 8000;

function buildContext(
  data: Record<string, unknown>,
  metadata: Record<string, unknown>
): string | undefined {
  const omit = (source: Record<string, unknown>, mapped: Set<string>) =>
    Object.fromEntries(Object.entries(source).filter(([key]) => !mapped.has(key)));

  const extraData = omit(data, MAPPED_DATA_KEYS);
  const extraMetadata = omit(metadata, MAPPED_METADATA_KEYS);

  if (!Object.keys(extraData).length && !Object.keys(extraMetadata).length) return undefined;

  try {
    const serialized = JSON.stringify(
      {
        ...(Object.keys(extraData).length ? { data: extraData } : {}),
        ...(Object.keys(extraMetadata).length ? { metadata: extraMetadata } : {}),
      },
      null,
      2
    );
    return serialized.length > MAX_CONTEXT_LENGTH
      ? `${serialized.slice(0, MAX_CONTEXT_LENGTH)}\n… truncated`
      : serialized;
  } catch (err) {
    // Unserializable payload (cycles, BigInt). Losing the extras is survivable;
    // losing the submission is not.
    logger.error({ err }, 'Could not serialize submission context');
    return undefined;
  }
}

/** The Medal contact and note for one submission. */
function toSubmission(
  intent: SupportedIntent,
  data: Record<string, unknown>,
  metadata: Record<string, unknown>,
  email: string,
  consentGiven: boolean
): Submission {
  const message = getStringOrUndefined(data.message || data.content);
  const context = buildContext(data, metadata);
  const note = [
    `Website form: ${intent}`,
    ...(message ? ['', message, ''] : []),
    ...noteLines([
      [
        'Resource',
        intent === 'download' ? getStringOrUndefined(data.resource) || 'unknown' : undefined,
      ],
      ['Page', getStringOrUndefined(metadata.url)],
      ['Language', getStringOrUndefined(metadata.locale)],
      ['Privacy terms accepted', consentGiven ? 'yes' : 'no'],
    ]),
    ...(context ? ['', 'Details:', context] : []),
  ].join('\n');

  return {
    email,
    firstName: getStringOrUndefined(data.name || data.fullname),
    company: getStringOrUndefined(data.company),
    jobTitle: getStringOrUndefined(data.jobTitle || data.title),
    phone: getStringOrUndefined(data.phone || data.tel),
    labels: [intent],
    note,
    subscribe: intent === 'newsletter',
  };
}

export const submitForm = actionClient
  .schema(submissionSchema)
  .action(
    async ({ parsedInput: { intent, data, metadata = {}, formId, consent, requireConsent } }) => {
      if (data._honeypot) {
        logger.warn('Bot submission blocked via honeypot');
        return { success: true };
      }

      const email = getString(data.email);
      if (!email) {
        return { error: 'Email is required.' };
      }

      // Reject unknown intents before doing any work.
      if (!isSupportedIntent(intent)) {
        logger.warn(`Unknown submission intent: ${intent}`);
        return { error: 'This form is not set up correctly. Please contact support.' };
      }

      const consentGiven = consent === true;
      if ((await isConsentRequired(formId, { intent }, requireConsent)) && !consentGiven) {
        return { error: 'Please accept the privacy terms to continue.' };
      }

      // Medal is the only destination: no client means the submission would be lost.
      const medal = await getMedal();
      if (!medal) {
        logger.error(
          { intent },
          '[medal-sdk] not configured (MEDAL_API_KEY) — submission not sent'
        );
        return { error: SUBMISSION_UNAVAILABLE_MESSAGE };
      }

      try {
        await recordSubmission(
          medal,
          toSubmission(intent, data, metadata, email, consentGiven),
          logger
        );
        return { success: true };
      } catch (err) {
        logger.error({ err, intent }, '[medal-sdk] submission failed');
        return { error: SUBMISSION_UNAVAILABLE_MESSAGE };
      }
    }
  );
