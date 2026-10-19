import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Behavioural tests for the shared `submitForm` server action.
 *
 * Medal Social is the only place a submission goes (owner decision
 * 2026-10-19): the Sanity dataset is public, so nothing personal is written
 * there. When Medal can't take the submission the visitor is told so — the
 * form must never show its success state for a message nobody received.
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

vi.mock('@/lib/medal-sdk/client', () => ({
  getMedal: () => getMedal(),
}));

vi.mock('@/lib/core/logger', () => ({
  logger: {
    error: (...a: unknown[]) => logError(...a),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

const { submitForm } = await import('@/actions/forms/submit-form');

const UNAVAILABLE = "We couldn't send your message right now. Please try again or email us.";

/** A timestamp old enough to clear the 3-second fast-submit guard. */
const humanTimestamp = () => new Date(Date.now() - 10_000).toISOString();

const submit = (overrides: Record<string, unknown> = {}) =>
  submitForm({
    intent: 'contact',
    _submissionTimestamp: humanTimestamp(),
    data: { email: 'human@example.com', name: 'Human', message: 'Hello there' },
    ...overrides,
  });

const medal = () => ({
  contacts: {
    create: contactsCreate,
    list: contactsList,
    update: contactsUpdate,
    addNote,
    activities,
  },
});

const conflict = () =>
  Object.assign(new Error('A contact with this email already exists'), { status: 409 });

/** The note sent with the created contact. */
const createdNote = () =>
  (contactsCreate.mock.calls[0]?.[0] as { notes?: string } | undefined)?.notes ?? '';

describe('submitForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sanityFetch.mockResolvedValue(null);
    getMedal.mockResolvedValue(medal());
    contactsCreate.mockResolvedValue({ data: { id: 'contact-1' } });
    contactsList.mockResolvedValue({
      data: [],
      pagination: { has_more: false, next_cursor: null },
    });
    contactsUpdate.mockResolvedValue({ data: { success: true } });
    addNote.mockResolvedValue({ data: { id: 'note-1' } });
    activities.mockResolvedValue({ data: [], pagination: { has_more: false, next_cursor: null } });
  });

  describe('sending to Medal', () => {
    it('creates a lead contact with the message as a note', async () => {
      const result = await submit();

      expect(result?.data).toEqual({ success: true });
      expect(contactsCreate).toHaveBeenCalledTimes(1);
      expect(contactsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'human@example.com',
          first_name: 'Human',
          status: 'lead',
          labels: ['contact'],
          notes: expect.stringContaining('Hello there'),
        })
      );
    });

    it('sends no custom fields (Medal rejects keys the workspace has not defined)', async () => {
      await submit({ metadata: { locale: 'en', url: 'https://example.com/contact' } });

      expect(contactsCreate.mock.calls[0]?.[0]).not.toHaveProperty('custom_fields');
    });

    it('records the page, language and consent decision in the note', async () => {
      await submit({
        consent: true,
        metadata: { locale: 'nb', url: 'https://example.com/kontakt' },
      });

      const note = createdNote();
      expect(note).toContain('Page: https://example.com/kontakt');
      expect(note).toContain('Language: nb');
      expect(note).toContain('Privacy terms accepted: yes');
    });

    it('records a missing consent as "no"', async () => {
      await submit();

      expect(createdNote()).toContain('Privacy terms accepted: no');
    });

    it('sends company, job title and phone to their contact fields', async () => {
      await submit({
        data: {
          email: 'human@example.com',
          company: 'Acme',
          jobTitle: 'CTO',
          phone: '+4790000000',
        },
      });

      expect(contactsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ company: 'Acme', job_title: 'CTO', phone: '+4790000000' })
      );
    });

    it('keeps caller context that has no field of its own in the note', async () => {
      // The brand-test widgets post quiz results; without them the CRM entry
      // can't be told apart from a plain contact message.
      await submit({
        data: { email: 'human@example.com', name: 'Human', answerVector: [1, 4, 2] },
        metadata: { locale: 'en', source: 'brand-test', overallScore: 72 },
      });

      const note = createdNote();
      expect(note).toContain('"answerVector"');
      expect(note).toContain('"overallScore": 72');
      expect(note).not.toContain('"email"');
    });

    it('subscribes a newsletter sign-up', async () => {
      await submit({ intent: 'newsletter', data: { email: 'human@example.com' } });

      expect(contactsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ email_status: 'subscribed', labels: ['newsletter'] })
      );
    });

    it('does not set the email status for a contact message', async () => {
      await submit();

      expect(contactsCreate.mock.calls[0]?.[0]).not.toHaveProperty('email_status');
    });

    it('records which resource a download asked for', async () => {
      await submit({
        intent: 'download',
        data: { email: 'human@example.com', resource: 'the-2026-guide' },
      });

      expect(contactsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ labels: ['download'] })
      );
      expect(createdNote()).toContain('Resource: the-2026-guide');
    });

    it('never writes to Sanity', async () => {
      await submit({ consent: true });

      expect(getWriteClient).not.toHaveBeenCalled();
    });
  });

  describe('returning visitors', () => {
    const existing = {
      id: 'contact-9',
      email: 'human@example.com',
      first_name: 'Known',
      company: null,
      job_title: null,
      phone: null,
      label_ids: ['label-a'],
    };

    beforeEach(() => {
      contactsCreate.mockRejectedValue(conflict());
      contactsList.mockResolvedValue({
        data: [existing],
        pagination: { has_more: false, next_cursor: null },
      });
    });

    it('finds the contact by email, keeps its labels and adds the message as a note', async () => {
      const result = await submit({
        data: { email: 'human@example.com', company: 'Acme', message: 'Again' },
      });

      expect(result?.data).toEqual({ success: true });
      expect(contactsList).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'human@example.com' })
      );
      expect(contactsUpdate).toHaveBeenCalledWith('contact-9', {
        label_ids: ['label-a'],
        labels: ['contact'],
        company: 'Acme',
      });
      expect(addNote).toHaveBeenCalledWith('contact-9', {
        content: expect.stringContaining('Again'),
      });
    });

    it('a retry of the same submission (same form shown, same message) adds no second note', async () => {
      const shownAt = humanTimestamp();
      const first = { _submissionTimestamp: shownAt };
      await submit(first);
      const note = (addNote.mock.calls[0]?.[1] as { content: string } | undefined)?.content ?? '';
      const idLine = note.split('\n').find((line) => line.startsWith('Submission ID: '));
      expect(idLine).toMatch(/^Submission ID: [0-9a-f]{16}$/);

      vi.clearAllMocks();
      contactsCreate.mockRejectedValue(conflict());
      contactsList.mockResolvedValue({
        data: [existing],
        pagination: { has_more: false, next_cursor: null },
      });
      activities.mockResolvedValue({
        data: [{ id: 'a1', type: 'note.added', title: null, note_content: note }],
        pagination: { has_more: false, next_cursor: null },
      });
      const result = await submit(first);

      expect(result?.data).toEqual({ success: true });
      expect(addNote).not.toHaveBeenCalled();
    });

    it('a new message from the same visitor is still recorded', async () => {
      const shownAt = humanTimestamp();
      await submit({ _submissionTimestamp: shownAt });
      const note = (addNote.mock.calls[0]?.[1] as { content: string } | undefined)?.content ?? '';
      vi.clearAllMocks();
      contactsCreate.mockRejectedValue(conflict());
      contactsList.mockResolvedValue({
        data: [existing],
        pagination: { has_more: false, next_cursor: null },
      });
      activities.mockResolvedValue({
        data: [{ id: 'a1', type: 'note.added', title: null, note_content: note }],
        pagination: { has_more: false, next_cursor: null },
      });
      await submit({
        _submissionTimestamp: shownAt,
        data: { email: 'human@example.com', message: 'Something else' },
      });

      expect(addNote).toHaveBeenCalledTimes(1);
    });

    it('does not overwrite details the contact already has', async () => {
      await submit({ data: { email: 'human@example.com', name: 'Someone Else' } });

      expect(contactsUpdate.mock.calls[0]?.[1]).not.toHaveProperty('first_name');
    });

    it('never re-subscribes a contact who unsubscribed (the public form proves no ownership)', async () => {
      contactsList.mockResolvedValue({
        data: [{ ...existing, email_status: 'unsubscribed' }],
        pagination: { has_more: false, next_cursor: null },
      });

      const result = await submit({ intent: 'newsletter', data: { email: 'human@example.com' } });

      expect(result?.data).toEqual({ success: true });
      expect(contactsUpdate).toHaveBeenCalledWith(
        'contact-9',
        expect.objectContaining({ labels: ['newsletter'] })
      );
      expect(contactsUpdate.mock.calls[0]?.[1]).not.toHaveProperty('email_status');
      expect(addNote).toHaveBeenCalledWith('contact-9', {
        content: expect.stringContaining('unsubscribed'),
      });
    });

    it('subscribes a returning newsletter sign-up with no email status', async () => {
      contactsList.mockResolvedValue({
        data: [{ ...existing, email_status: null }],
        pagination: { has_more: false, next_cursor: null },
      });

      await submit({ intent: 'newsletter', data: { email: 'human@example.com' } });

      expect(contactsUpdate.mock.calls[0]?.[1]).toHaveProperty('email_status', 'subscribed');
    });

    it.each(['bounced', 'complained', 'subscribed'])(
      'never overwrites a %s email status',
      async (status) => {
        contactsList.mockResolvedValue({
          data: [{ ...existing, email_status: status }],
          pagination: { has_more: false, next_cursor: null },
        });

        await submit({ intent: 'newsletter', data: { email: 'human@example.com' } });

        expect(contactsUpdate.mock.calls[0]?.[1]).not.toHaveProperty('email_status');
        expect(addNote).toHaveBeenCalled();
      }
    );

    it('fails when Medal reports a duplicate it then cannot find', async () => {
      contactsList.mockResolvedValue({
        data: [],
        pagination: { has_more: false, next_cursor: null },
      });

      const result = await submit();

      expect(result?.data).toEqual({ error: UNAVAILABLE });
    });

    it('fails when the note cannot be added', async () => {
      addNote.mockRejectedValue(new Error('medal is down'));

      const result = await submit();

      expect(result?.data).toEqual({ error: UNAVAILABLE });
    });
  });

  describe('failing closed', () => {
    it('tells the visitor when Medal is not configured, and logs it', async () => {
      getMedal.mockResolvedValue(null);

      const result = await submit();

      expect(result?.data).toEqual({ error: UNAVAILABLE });
      expect(logError).toHaveBeenCalled();
      expect(getWriteClient).not.toHaveBeenCalled();
    });

    it('tells the visitor when Medal rejects the contact, and logs it', async () => {
      contactsCreate.mockRejectedValue(Object.assign(new Error('boom'), { status: 500 }));

      const result = await submit();

      expect(result?.data).toEqual({ error: UNAVAILABLE });
      expect(logError).toHaveBeenCalled();
      expect(contactsList).not.toHaveBeenCalled();
    });
  });

  describe('bot protection', () => {
    it('rejects a submission made in under three seconds', async () => {
      const result = await submit({ _submissionTimestamp: new Date().toISOString() });

      expect(result?.validationErrors).toBeDefined();
      expect(result?.data?.success).toBeUndefined();
      expect(contactsCreate).not.toHaveBeenCalled();
    });

    it('rejects a submission without a timestamp', async () => {
      const result = await submit({ _submissionTimestamp: undefined });

      expect(result?.validationErrors).toBeDefined();
      expect(contactsCreate).not.toHaveBeenCalled();
    });

    it('silently accepts and discards a honeypot submission', async () => {
      const result = await submit({
        data: { email: 'bot@example.com', _honeypot: 'gotcha' },
      });

      expect(result?.data).toEqual({ success: true });
      expect(getMedal).not.toHaveBeenCalled();
      expect(contactsCreate).not.toHaveBeenCalled();
    });
  });

  describe('consent', () => {
    it('rejects a submission missing consent when the form document requires it', async () => {
      sanityFetch.mockResolvedValue({ requireConsent: true });

      const result = await submit({ formId: 'form-1', requireConsent: false, consent: false });

      expect(result?.data?.error).toContain('accept the privacy terms');
      expect(contactsCreate).not.toHaveBeenCalled();
    });

    it('ignores a client that claims consent is not required', async () => {
      // The request says "no consent needed"; Sanity is authoritative and says otherwise.
      sanityFetch.mockResolvedValue({ requireConsent: true });

      const result = await submit({ formId: 'form-1', requireConsent: false });

      expect(result?.data?.error).toContain('accept the privacy terms');
    });

    it('accepts the submission once consent is given for a consent-gated form', async () => {
      sanityFetch.mockResolvedValue({ requireConsent: true });

      const result = await submit({ formId: 'form-1', consent: true });

      expect(result?.data).toEqual({ success: true });
      expect(createdNote()).toContain('Privacy terms accepted: yes');
    });

    it('rejects a form id that was not configured for the submitted intent', async () => {
      // A consent-free newsletter id replayed against a contact submission
      // resolves to nothing, because the query matches on intent too.
      sanityFetch.mockResolvedValue(null);

      const result = await submit({ formId: 'newsletter-form', requireConsent: false });

      expect(result?.data?.error).toContain('accept the privacy terms');
      expect(contactsCreate).not.toHaveBeenCalled();
    });

    it('rejects a forged form id', async () => {
      sanityFetch.mockResolvedValue(null);

      const result = await submit({ formId: 'not-a-real-form', requireConsent: false });

      expect(result?.data?.error).toContain('accept the privacy terms');
      expect(contactsCreate).not.toHaveBeenCalled();
    });

    it('honours a legacy form that requires acceptance instead of consent', async () => {
      // Older documents store the requirement as `acceptance.required`, which
      // Form.tsx's adapter still maps; the server has to read it too.
      sanityFetch.mockResolvedValue({ requireConsent: undefined, legacyRequired: true });

      const result = await submit({ formId: 'legacy-form', requireConsent: false });

      expect(result?.data?.error).toContain('accept the privacy terms');
      expect(contactsCreate).not.toHaveBeenCalled();
    });

    it('reuses the last authoritative answer when Sanity later goes down', async () => {
      sanityFetch.mockResolvedValue({ requireConsent: true });
      await submit({ formId: 'cached-form', consent: true });

      // Same form, Sanity now unreachable, and a forged "no consent needed".
      sanityFetch.mockRejectedValue(new Error('sanity is down'));
      const result = await submit({ formId: 'cached-form', requireConsent: false });

      expect(result?.data?.error).toContain('accept the privacy terms');
    });

    it('matches the published form when submitted from draft mode', async () => {
      sanityFetch.mockResolvedValue({ requireConsent: false });

      const result = await submit({ formId: 'drafts.form-1' });

      expect(result?.data).toEqual({ success: true });
      expect(sanityFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ formId: 'form-1' })
      );
    });

    it('does not demand consent from widgets that post without a form document', async () => {
      // BrandTest/BoldNewsletter post directly and have no form doc; a consent
      // requirement configured on some other form must not block them.
      const result = await submit();

      expect(result?.data).toEqual({ success: true });
      expect(sanityFetch).not.toHaveBeenCalled();
    });

    it('honours a client asking for consent even when Sanity is unreachable', async () => {
      sanityFetch.mockRejectedValue(new Error('sanity is down'));

      const result = await submit({ formId: 'form-1', requireConsent: true, consent: false });

      expect(result?.data?.error).toContain('accept the privacy terms');
    });

    it('still accepts consent-free forms when the Sanity lookup fails', async () => {
      // A Sanity blip must not start rejecting forms that never wanted consent.
      // Distinct id so no earlier test's cached answer can decide this one.
      sanityFetch.mockRejectedValue(new Error('sanity is down'));

      const result = await submit({ formId: 'never-looked-up-form' });

      expect(sanityFetch).toHaveBeenCalledTimes(1);
      expect(result?.data).toEqual({ success: true });
    });
  });

  describe('validation', () => {
    it('requires an email address', async () => {
      const result = await submit({ data: { name: 'No Email' } });

      expect(result?.data?.error).toBe('Email is required.');
      expect(contactsCreate).not.toHaveBeenCalled();
    });

    it('rejects an unsupported intent before sending anything', async () => {
      const result = await submit({ intent: 'event' });

      expect(result?.data?.error).toContain('not set up correctly');
      expect(contactsCreate).not.toHaveBeenCalled();
    });
  });
});
