import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Event registration (captureLead) goes to Medal Social only: a contact plus
 * a note naming the event. Nothing personal is written to the public Sanity
 * dataset, and a registration Medal didn't take is reported, never faked.
 */

const sanityFetch = vi.fn();
const getWriteClient = vi.fn();
const contactsCreate = vi.fn();
const contactsList = vi.fn();
const contactsUpdate = vi.fn();
const addNote = vi.fn();
const activities = vi.fn();
const getMedal = vi.fn();
const logError = vi.fn();

vi.mock('@/sanity/lib/client', () => ({
  client: { fetch: (...args: unknown[]) => sanityFetch(...args) },
  getWriteClient: () => getWriteClient(),
}));
vi.mock('@/lib/medal-sdk/client', () => ({ getMedal: () => getMedal() }));
vi.mock('@/lib/core/logger', () => ({
  logger: {
    error: (...a: unknown[]) => logError(...a),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

const { captureLead } = await import('@/actions/leads/capture-lead');

const UNAVAILABLE = "We couldn't send your message right now. Please try again or email us.";

const EVENT = {
  title: 'Launch night',
  startDateTime: '2026-11-05T17:00:00Z',
  timezone: 'Europe/Oslo',
  form: { requireConsent: true },
};

const register = (overrides: Record<string, unknown> = {}) =>
  captureLead({
    email: 'visitor@example.com',
    name: 'Visitor',
    company: 'Acme',
    jobTitle: 'CTO',
    phone: '+4790000000',
    consent: true,
    language: 'nb',
    source: { type: 'event', referenceId: 'event-1', url: 'https://example.com/events/launch' },
    _submissionTimestamp: new Date(Date.now() - 10_000).toISOString(),
    ...overrides,
  } as never);

const noteOf = (call: unknown[] | undefined) =>
  (call?.[0] as { notes?: string } | undefined)?.notes ?? '';

const existing = {
  id: 'contact-9',
  email: 'visitor@example.com',
  first_name: 'Visitor',
  company: 'Acme',
  job_title: null,
  phone: null,
  label_ids: ['label-a'],
};

describe('captureLead → Medal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sanityFetch.mockResolvedValue(EVENT);
    getMedal.mockResolvedValue({
      contacts: {
        create: contactsCreate,
        list: contactsList,
        update: contactsUpdate,
        addNote,
        activities,
      },
    });
    contactsCreate.mockResolvedValue({ data: { id: 'contact-1' } });
    contactsList.mockResolvedValue({
      data: [existing],
      pagination: { has_more: false, next_cursor: null },
    });
    contactsUpdate.mockResolvedValue({ data: { success: true } });
    addNote.mockResolvedValue({ data: { id: 'note-1' } });
    activities.mockResolvedValue({ data: [], pagination: { has_more: false, next_cursor: null } });
  });

  it('creates a lead contact with the registration as a note', async () => {
    const result = await register();

    expect(result?.data).toEqual({
      success: true,
      message: 'Successfully registered!',
      alreadyRegistered: false,
    });
    expect(contactsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'visitor@example.com',
        first_name: 'Visitor',
        company: 'Acme',
        job_title: 'CTO',
        phone: '+4790000000',
        status: 'lead',
        labels: ['event-registration'],
      })
    );
    const note = noteOf(contactsCreate.mock.calls[0]);
    expect(note).toContain('Event registration: Launch night');
    expect(note).toContain('Event date: 2026-11-05T17:00:00Z (Europe/Oslo)');
    expect(note).toContain('Event ID: event-1');
    expect(note).toContain('Page: https://example.com/events/launch');
    expect(note).toContain('Language: nb');
    expect(note).toContain('Privacy terms accepted: yes');
  });

  it('reads the event title and date from Sanity, by the published id', async () => {
    await register({ source: { type: 'event', referenceId: 'drafts.event-1' } });

    const [query, params] = sanityFetch.mock.calls[0] as [string, Record<string, string>];
    expect(query).toContain('metadata.title');
    expect(query).toContain('startDateTime');
    expect(params).toEqual({ eventId: 'event-1' });
    expect(noteOf(contactsCreate.mock.calls[0])).toContain('Event ID: event-1');
  });

  it('records a registration for a returning contact on their record', async () => {
    contactsCreate.mockRejectedValue(Object.assign(new Error('exists'), { status: 409 }));

    const result = await register();

    expect(result?.data?.alreadyRegistered).toBe(false);
    expect(contactsUpdate).toHaveBeenCalledWith('contact-9', {
      label_ids: ['label-a'],
      labels: ['event-registration'],
      job_title: 'CTO',
      phone: '+4790000000',
    });
    expect(addNote).toHaveBeenCalledWith('contact-9', {
      content: expect.stringContaining('Event ID: event-1'),
    });
  });

  it('answers "already registered" when the contact already has this event', async () => {
    contactsCreate.mockRejectedValue(Object.assign(new Error('exists'), { status: 409 }));
    activities.mockResolvedValue({
      data: [
        {
          id: 'a1',
          type: 'note.added',
          title: null,
          note_content: 'Event registration: Launch night\nEvent ID: event-1',
        },
      ],
      pagination: { has_more: false, next_cursor: null },
    });

    const result = await register();

    expect(result?.data).toEqual({
      success: true,
      message: 'You are already registered!',
      alreadyRegistered: true,
    });
    expect(contactsUpdate).not.toHaveBeenCalled();
    expect(addNote).not.toHaveBeenCalled();
  });

  it('does not mistake another event with a longer id for this one', async () => {
    contactsCreate.mockRejectedValue(Object.assign(new Error('exists'), { status: 409 }));
    activities.mockResolvedValue({
      data: [{ id: 'a1', type: 'note.added', note_content: 'Event ID: event-10' }],
      pagination: { has_more: false, next_cursor: null },
    });

    const result = await register();

    expect(result?.data?.alreadyRegistered).toBe(false);
    expect(addNote).toHaveBeenCalled();
  });

  it('ignores a deleted note and non-note activity that mention the event', async () => {
    // The API serves note text as `note_content` on note.added/note.edited only.
    contactsCreate.mockRejectedValue(Object.assign(new Error('exists'), { status: 409 }));
    activities.mockResolvedValue({
      data: [
        { id: 'a1', type: 'note.deleted', note_content: null, title: 'Event ID: event-1' },
        { id: 'a2', type: 'email.sent', note_content: null, title: 'Event ID: event-1' },
      ],
      pagination: { has_more: false, next_cursor: null },
    });

    const result = await register();

    expect(result?.data?.alreadyRegistered).toBe(false);
    expect(addNote).toHaveBeenCalled();
  });

  it('finds an earlier registration on a later timeline page (up to 3 pages)', async () => {
    contactsCreate.mockRejectedValue(Object.assign(new Error('exists'), { status: 409 }));
    activities
      .mockResolvedValueOnce({
        data: [{ id: 'a1', type: 'note.added', note_content: 'Website form: contact' }],
        pagination: { has_more: true, next_cursor: 'c2' },
      })
      .mockResolvedValueOnce({
        data: [{ id: 'a2', type: 'note.edited', note_content: 'Event ID: event-1' }],
        pagination: { has_more: true, next_cursor: 'c3' },
      });

    const result = await register();

    expect(result?.data?.alreadyRegistered).toBe(true);
    expect(activities).toHaveBeenNthCalledWith(2, 'contact-9', { limit: 100, cursor: 'c2' });
  });

  it('stops after 3 timeline pages and registers', async () => {
    contactsCreate.mockRejectedValue(Object.assign(new Error('exists'), { status: 409 }));
    activities.mockResolvedValue({
      data: [{ id: 'a', type: 'note.added', note_content: 'something else' }],
      pagination: { has_more: true, next_cursor: 'more' },
    });

    const result = await register();

    expect(activities).toHaveBeenCalledTimes(3);
    expect(result?.data?.alreadyRegistered).toBe(false);
    expect(addNote).toHaveBeenCalled();
  });

  it('still registers when the timeline cannot be read', async () => {
    contactsCreate.mockRejectedValue(Object.assign(new Error('exists'), { status: 409 }));
    activities.mockRejectedValue(new Error('timeline down'));

    const result = await register();

    expect(result?.data?.success).toBe(true);
    expect(addNote).toHaveBeenCalled();
  });

  it('fails with the user message when Medal is not configured', async () => {
    getMedal.mockResolvedValue(null);

    const result = await register();

    expect(result?.serverError).toBe(UNAVAILABLE);
    expect(result?.data).toBeUndefined();
    expect(logError).toHaveBeenCalled();
  });

  it('fails with the user message when Medal rejects the contact', async () => {
    contactsCreate.mockRejectedValue(Object.assign(new Error('boom'), { status: 500 }));

    const result = await register();

    expect(result?.serverError).toBe(UNAVAILABLE);
  });

  it('never writes to Sanity', async () => {
    await register();

    expect(getWriteClient).not.toHaveBeenCalled();
  });

  it('accepts event registrations only', async () => {
    const result = await register({ source: { type: 'newsletter', url: 'https://example.com/' } });

    expect(result?.validationErrors).toBeDefined();
    expect(contactsCreate).not.toHaveBeenCalled();
  });

  it('rejects a registration without a submission timestamp', async () => {
    const result = await register({ _submissionTimestamp: undefined });

    expect(result?.validationErrors).toBeDefined();
    expect(contactsCreate).not.toHaveBeenCalled();
  });
});
