import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Event registration (captureLead) enforces the form's consent requirement on
 * the server, the same way submitForm does.
 */

const create = vi.fn();
const sanityFetch = vi.fn();

vi.mock('@/sanity/lib/client', () => ({
  client: { fetch: (...args: unknown[]) => sanityFetch(...args) },
}));
vi.mock('@/lib/medal-sdk/client', () => ({
  getMedal: async () => ({
    contacts: {
      create: (...args: unknown[]) => create(...args),
      list: vi.fn(),
      update: vi.fn(),
      addNote: vi.fn(),
      activities: vi.fn(),
    },
  }),
}));
vi.mock('@/lib/core/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

/** The event row the consent lookup reads: the event plus its registration form. */
const event = (form: Record<string, unknown> | null) => ({ title: 'Launch', form });

const { captureLead } = await import('@/actions/leads/capture-lead');

const register = (overrides: Record<string, unknown> = {}) =>
  captureLead({
    email: 'visitor@example.com',
    source: { type: 'event', referenceId: 'event-1', url: '/events/launch' },
    _submissionTimestamp: new Date(Date.now() - 10_000).toISOString(),
    ...overrides,
  } as never);

describe('captureLead consent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    create.mockResolvedValue({ data: { id: 'contact-1' } });
  });

  const required = event({ requireConsent: true });

  it('reads the requirement from the event, not from a form id sent by the browser', async () => {
    sanityFetch.mockResolvedValue(required);
    await register({ formId: 'form-free', consent: true });
    const [query, params] = sanityFetch.mock.calls[0] as [string, Record<string, string>];
    expect(query).toContain('registrationForm->');
    expect(params).toEqual({ eventId: 'event-1' });
  });

  it('enforces consent without a form id', async () => {
    sanityFetch.mockResolvedValue(required);
    const result = await register({ consent: false });
    expect(result?.serverError).toMatch(/accept/i);
    expect(create).not.toHaveBeenCalled();
  });

  it("ignores another form's id", async () => {
    sanityFetch.mockResolvedValue(required);
    const result = await register({ formId: 'consent-free-form', consent: false });
    expect(result?.serverError).toMatch(/accept/i);
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects an event registration without an event id', async () => {
    const result = await register({
      consent: true,
      source: { type: 'event', url: '/events/launch' },
    });
    expect(result?.serverError).toBeTruthy();
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects an event without a registration form', async () => {
    sanityFetch.mockResolvedValue(event(null));
    const result = await register({ consent: true });
    expect(result?.serverError).toBeTruthy();
    expect(create).not.toHaveBeenCalled();
  });

  it('accepts a registration with consent', async () => {
    sanityFetch.mockResolvedValue(required);
    const result = await register({ consent: true });
    expect(result?.data?.success).toBe(true);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ notes: expect.stringContaining('Privacy terms accepted: yes') })
    );
  });

  it('accepts a registration without consent when the form does not require it', async () => {
    sanityFetch.mockResolvedValue(event({ requireConsent: false }));
    const result = await register({ consent: false });
    expect(result?.data?.success).toBe(true);
  });

  it('honours the legacy acceptance.required flag', async () => {
    sanityFetch.mockResolvedValue(event({ legacyRequired: true }));
    const result = await register({ consent: false });
    expect(result?.serverError).toMatch(/accept/i);
  });

  it('during a Sanity outage uses the last answer seen for the event', async () => {
    sanityFetch.mockResolvedValueOnce(required);
    await register({ consent: true, source: { type: 'event', referenceId: 'event-cached' } });
    sanityFetch.mockRejectedValueOnce(new Error('sanity is down'));
    const result = await register({
      consent: false,
      source: { type: 'event', referenceId: 'event-cached' },
    });
    expect(result?.serverError).toMatch(/accept/i);
  });

  it('during a Sanity outage with no answer seen yet, refuses instead of guessing', async () => {
    sanityFetch.mockRejectedValueOnce(new Error('sanity is down'));
    const result = await register({
      consent: false,
      source: { type: 'event', referenceId: 'event-never-seen' },
    });
    expect(result?.serverError).toMatch(/temporarily unavailable/i);
    expect(create).not.toHaveBeenCalled();
  });

  it('during a Sanity outage keeps accepting a form last seen as consent-free', async () => {
    sanityFetch.mockResolvedValueOnce(event({ requireConsent: false }));
    await register({ consent: false, source: { type: 'event', referenceId: 'event-free' } });
    sanityFetch.mockRejectedValueOnce(new Error('sanity is down'));
    const result = await register({
      consent: false,
      source: { type: 'event', referenceId: 'event-free' },
    });
    expect(result?.data?.success).toBe(true);
  });
});
