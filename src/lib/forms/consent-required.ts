import { logger } from '@/lib/core/logger';
import { client } from '@/sanity/lib/client';

/**
 * Last authoritative consent answer per form, so a Sanity read outage falls
 * back to what the dataset actually said rather than to the request's claim.
 * Short-lived: an editor toggling the requirement must take effect quickly.
 */
const CONSENT_CACHE_TTL_MS = 5 * 60 * 1000;
const consentCache = new Map<string, { required: boolean; at: number }>();

/** What a `formId` must belong to for its answer to count. */
export interface ConsentScope {
  /** The form must be configured with this intent (submitForm). */
  intent?: string;
  /** The form must be the registration form of this event (captureLead). */
  eventId?: string;
}

const published = (id: string) => id.replace(/^drafts\./, '');

/**
 * Resolve whether consent is mandatory for this submission.
 *
 * The requirement is a property of a `form` document, so the request never gets
 * to decide it. The client's hint can only ever ADD a requirement; every "no
 * consent needed" claim is checked against Sanity.
 *
 *  - a `formId` is only authoritative within its scope (the intent it was
 *    configured with, or the event it belongs to), so an id outside that scope
 *    is refused rather than silently trusted — otherwise a consent-free
 *    newsletter id could be replayed against a consent-gated form;
 *  - no `formId` means the submission isn't tied to a form document at all
 *    (the hand-rolled newsletter and quiz widgets post directly), and a
 *    submission with no form has no configured consent requirement to enforce.
 */
export async function isConsentRequired(
  formId: string | undefined,
  scope: ConsentScope,
  clientHint?: boolean
): Promise<boolean> {
  // The client asking for consent is always honoured, and saves a round trip.
  if (clientHint === true) return true;
  if (!formId) return false;

  // Presentation/draft mode addresses the draft; the requirement lives on the
  // published document.
  const publishedId = published(formId);
  const eventId = scope.eventId ? published(scope.eventId) : undefined;
  const cacheKey = `${publishedId}:${scope.intent ?? ''}:${eventId ?? ''}`;

  const filters = ['_type == "form"', '_id == $formId'];
  const params: Record<string, string> = { formId: publishedId };
  if (scope.intent) {
    filters.push('intent == $intent');
    params.intent = scope.intent;
  }
  if (eventId) {
    filters.push('_id in *[_id == $eventId].registrationForm._ref');
    params.eventId = eventId;
  }

  try {
    const form = await client.fetch<{
      requireConsent?: boolean;
      legacyRequired?: boolean;
    } | null>(
      `*[${filters.join(' && ')}][0]{
        requireConsent,
        "legacyRequired": acceptance.required
      }`,
      params
    );

    // A real submission always carries an id that matches its scope. One that
    // doesn't is forged, mismatched or pointing at a deleted form, so refuse
    // it instead of falling through to a laxer answer.
    if (!form) {
      logger.warn({ formId, ...scope }, 'Submission referenced an unknown form for this scope');
      return true;
    }

    // Legacy documents carry the requirement as `acceptance.required`; the
    // adapter in Form.tsx still honours those, so the server must too.
    const required = form.requireConsent === true || form.legacyRequired === true;
    consentCache.set(cacheKey, { required, at: Date.now() });
    return required;
  } catch (err) {
    logger.error({ err, formId, ...scope }, '[sanity] requireConsent lookup failed');

    // Prefer the last authoritative answer we saw for this form over guessing.
    const cached = consentCache.get(cacheKey);
    if (cached && Date.now() - cached.at < CONSENT_CACHE_TTL_MS) return cached.required;

    // Nothing cached. Only submissions claiming no consent is needed reach
    // here, so this is the one spot the request's word is taken. Failing
    // closed instead would reject every legitimate consent-free submission
    // for the duration of any Sanity read outage, and the residual exposure
    // is a forged request storing its own lead with `consent: false` — an
    // accurate record rather than a falsified consent.
    return false;
  }
}
