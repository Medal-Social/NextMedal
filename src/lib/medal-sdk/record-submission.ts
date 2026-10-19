import type { Contact, CreateContactInput, Medal, UpdateContactInput } from '@medalsocial/sdk';

/**
 * Website submissions go to Medal Social only (owner decision 2026-10-19):
 * the Sanity dataset is public, so nothing personal is stored there. When
 * Medal can't take a submission the visitor sees this message — never a
 * success state for something nobody received.
 */
export const SUBMISSION_UNAVAILABLE_MESSAGE =
  "We couldn't send your message right now. Please try again or email us.";

export interface Submission {
  email: string;
  firstName?: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  /** Label names; Medal creates missing ones. Added to a returning contact's labels. */
  labels: string[];
  /** The submission itself, on the contact's timeline. */
  note: string;
  /** A newsletter sign-up: subscribed, or re-subscribed after an opt-out. */
  subscribe?: boolean;
  /**
   * A line that identifies this submission in a note (e.g. `Event ID: <id>`).
   * A returning contact whose timeline already holds it is not recorded again.
   */
  dedupeLine?: string;
}

export type RecordResult =
  | { status: 'created'; contactId: string }
  | { status: 'updated'; contactId: string }
  | { status: 'duplicate'; contactId: string };

type Logger = { error: (obj: unknown, msg?: string) => void };

/** `MedalApiError` duck-typed: the SDK is imported dynamically (see client.ts). */
const isConflict = (err: unknown) =>
  typeof err === 'object' && err !== null && (err as { status?: unknown }).status === 409;

const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** The API treats an email-shaped `search` as an exact email lookup. */
async function findByEmail(medal: Medal, email: string): Promise<Contact | undefined> {
  const { data } = await medal.contacts.list({ search: email, limit: 10 });
  return data.find((contact) => sameEmail(contact.email, email));
}

/** Details a returning contact doesn't have yet; what's already there stays. */
function missingDetails(contact: Contact, submission: Submission): UpdateContactInput {
  const fill: UpdateContactInput = {};
  if (!contact.first_name && submission.firstName) fill.first_name = submission.firstName;
  if (!contact.company && submission.company) fill.company = submission.company;
  if (!contact.job_title && submission.jobTitle) fill.job_title = submission.jobTitle;
  if (!contact.phone && submission.phone) fill.phone = submission.phone;
  return fill;
}

/** Longest a submission may take before the visitor gets the error message. */
export const SUBMISSION_DEADLINE_MS = 20_000;

/** Timeline pages scanned for an earlier registration (newest first, 100 per page). */
const TIMELINE_PAGES = 3;
const NOTE_TYPES = new Set(['note.added', 'note.edited']);

/**
 * A note's text. The API sends it as `note_content` on live note activities;
 * the SDK 1.6 `Activity` type calls it `content`, which the API never sends.
 */
function noteText(activity: unknown): string {
  const { type, note_content, content } = activity as {
    type?: unknown;
    note_content?: unknown;
    content?: unknown;
  };
  if (!NOTE_TYPES.has(String(type))) return '';
  const text = note_content ?? content;
  return typeof text === 'string' ? text : '';
}

async function alreadyRecorded(
  medal: Medal,
  contactId: string,
  line: string,
  logger: Logger
): Promise<boolean> {
  try {
    let cursor: string | undefined;
    for (let page = 0; page < TIMELINE_PAGES; page++) {
      const { data, pagination } = await medal.contacts.activities(contactId, {
        limit: 100,
        ...(cursor ? { cursor } : {}),
      });
      if (data.some((activity) => noteText(activity).split('\n').includes(line))) return true;
      if (!pagination?.has_more || !pagination.next_cursor) return false;
      cursor = pagination.next_cursor;
    }
    return false;
  } catch (err) {
    // A duplicate note is better than a lost registration.
    logger.error({ err }, '[medal-sdk] contacts.activities failed; recording anyway');
    return false;
  }
}

/**
 * Create the contact with the submission as its first note. Email is unique
 * per workspace, so a returning visitor (409) is looked up by email, gets the
 * labels added (existing ones kept — `label_ids` replaces the set), any
 * missing details filled in, and the submission as a new note.
 *
 * Throws on any failure or after SUBMISSION_DEADLINE_MS; callers turn that into
 * SUBMISSION_UNAVAILABLE_MESSAGE. At the deadline the SDK calls are abandoned,
 * not cancelled: one may still land, and a retry then goes the returning-
 * contact way.
 */
export async function recordSubmission(
  medal: Medal,
  submission: Submission,
  logger: Logger
): Promise<RecordResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Medal did not answer within ${SUBMISSION_DEADLINE_MS / 1000}s`)),
      SUBMISSION_DEADLINE_MS
    );
  });
  try {
    return await Promise.race([record(medal, submission, logger), deadline]);
  } finally {
    clearTimeout(timer);
  }
}

/** A newsletter sign-up never overrides a bounce or complaint, only an opt-out or nothing. */
const resubscribable = (contact: Contact) =>
  !contact.email_status || contact.email_status === 'unsubscribed';

async function record(medal: Medal, submission: Submission, logger: Logger): Promise<RecordResult> {
  const input: CreateContactInput = {
    email: submission.email,
    status: 'lead',
    labels: submission.labels,
    notes: submission.note,
    ...(submission.firstName ? { first_name: submission.firstName } : {}),
    ...(submission.company ? { company: submission.company } : {}),
    ...(submission.jobTitle ? { job_title: submission.jobTitle } : {}),
    ...(submission.phone ? { phone: submission.phone } : {}),
    ...(submission.subscribe ? { email_status: 'subscribed' as const } : {}),
  };

  try {
    const { data } = await medal.contacts.create(input);
    return { status: 'created', contactId: data.id };
  } catch (err) {
    if (!isConflict(err)) throw err;
  }

  const contact = await findByEmail(medal, submission.email);
  if (!contact)
    throw new Error('Medal reported an existing contact but the email lookup found none');

  if (
    submission.dedupeLine &&
    (await alreadyRecorded(medal, contact.id, submission.dedupeLine, logger))
  ) {
    return { status: 'duplicate', contactId: contact.id };
  }

  // Note last: when it fails the visitor retries, and the label update is safe to repeat.
  await medal.contacts.update(contact.id, {
    label_ids: contact.label_ids,
    labels: submission.labels,
    ...missingDetails(contact, submission),
    ...(submission.subscribe && resubscribable(contact)
      ? { email_status: 'subscribed' as const }
      : {}),
  });
  await medal.contacts.addNote(contact.id, { content: submission.note });
  return { status: 'updated', contactId: contact.id };
}

/** `Label: value` lines, skipping empty values. */
export function noteLines(entries: ReadonlyArray<readonly [string, string | undefined]>): string[] {
  return entries.flatMap(([label, value]) => (value ? [`${label}: ${value}`] : []));
}
