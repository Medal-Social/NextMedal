'use server';

import { z } from 'zod';
import { PublicError } from '@/lib/core/errors';
import { logger } from '@/lib/core/logger';
import { actionClient, withSecurity } from '@/lib/core/safe-action';
import { type EventDetails, eventConsent } from '@/lib/forms/consent-required';
import { getMedal } from '@/lib/medal-sdk/client';
import {
  noteLines,
  recordSubmission,
  SUBMISSION_UNAVAILABLE_MESSAGE,
} from '@/lib/medal-sdk/record-submission';

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

const trimmed = (value: string | undefined) => value?.trim() || undefined;

/** The note line that identifies one event's registrations on a contact's timeline. */
const eventIdLine = (id: string) => `Event ID: ${id}`;

function eventDate(event: EventDetails): string | undefined {
  if (!event.startDateTime) return undefined;
  return event.timezone ? `${event.startDateTime} (${event.timezone})` : event.startDateTime;
}

/**
 * Event registrations (and the other sign-up sources this action accepts) go
 * to Medal Social only: a lead contact plus a note with the event, page,
 * language and consent decision. Nothing personal is written to Sanity — the
 * dataset is public.
 */
export const captureLead = actionClient.schema(leadSchema).action(async ({ parsedInput }) => {
  const { email, name, company, jobTitle, phone, consent, source, language } = parsedInput;

  // Event registration: the event's own registration form decides about consent.
  let event: EventDetails | undefined;
  if (source.type === 'event') {
    if (!source.referenceId) throw new PublicError('This event could not be found.');
    const lookup = await eventConsent(source.referenceId);
    event = lookup.event;
    if (lookup.rule === 'no-form')
      throw new PublicError('Registration is not open for this event.');
    if (lookup.rule === 'unavailable') {
      throw new PublicError('Registration is temporarily unavailable. Please try again shortly.');
    }
    if (lookup.rule === 'required' && consent !== true) {
      throw new PublicError('Please accept the privacy terms to continue.');
    }
  }

  const medal = await getMedal();
  if (!medal) {
    logger.error(
      { source: source.type },
      '[medal-sdk] not configured (MEDAL_API_KEY) — sign-up not sent'
    );
    throw new PublicError(SUBMISSION_UNAVAILABLE_MESSAGE);
  }

  const heading = event
    ? `Event registration: ${event.title ?? event.id}`
    : `Website sign-up: ${source.type}`;
  const note = [
    heading,
    ...noteLines([
      ['Event date', event ? eventDate(event) : undefined],
      ['Event ID', event?.id],
      ['Page', trimmed(source.url)],
      ['Language', trimmed(language)],
      ['Privacy terms accepted', consent === true ? 'yes' : 'no'],
    ]),
  ].join('\n');

  let result: Awaited<ReturnType<typeof recordSubmission>>;
  try {
    result = await recordSubmission(
      medal,
      {
        email,
        firstName: trimmed(name),
        company: trimmed(company),
        jobTitle: trimmed(jobTitle),
        phone: trimmed(phone),
        labels: [event ? 'event-registration' : source.type],
        note,
        subscribe: source.type === 'newsletter',
        ...(event ? { dedupeLine: eventIdLine(event.id) } : {}),
      },
      logger
    );
  } catch (err) {
    logger.error({ err, source: source.type }, '[medal-sdk] sign-up failed');
    throw new PublicError(SUBMISSION_UNAVAILABLE_MESSAGE);
  }

  if (result.status === 'duplicate') {
    return { success: true, message: 'You are already registered!', alreadyRegistered: true };
  }
  return { success: true, message: 'Successfully registered!', alreadyRegistered: false };
});
