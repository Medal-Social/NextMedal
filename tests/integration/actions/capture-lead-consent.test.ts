import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Event registration (captureLead) enforces the form's consent requirement on
 * the server, the same way submitForm does.
 */

const create = vi.fn();
const writeFetch = vi.fn();
const sanityFetch = vi.fn();

vi.mock('@/sanity/lib/client', () => ({
  client: { fetch: (...args: unknown[]) => sanityFetch(...args) },
  getWriteClient: () => ({
    create: (...args: unknown[]) => create(...args),
    fetch: (...args: unknown[]) => writeFetch(...args),
    config: () => ({ token: 'test-write-token' }),
  }),
}));
vi.mock('@/lib/core/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));
vi.mock('@/lib/utils', () => ({ withRetry: (fn: () => Promise<unknown>) => fn() }));

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
    writeFetch.mockResolvedValue(null);
    create.mockResolvedValue({ _id: 'lead-1' });
  });

  it('rejects a registration without consent when the form requires it', async () => {
    sanityFetch.mockResolvedValue({ requireConsent: true });
    const result = await register({ formId: 'form-req', consent: false });
    expect(result?.serverError).toMatch(/accept/i);
    expect(create).not.toHaveBeenCalled();
  });

  it('accepts it with consent', async () => {
    sanityFetch.mockResolvedValue({ requireConsent: true });
    const result = await register({ formId: 'form-req', consent: true });
    expect(result?.data?.success).toBe(true);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ consent: true }));
  });

  it('accepts it without consent when the form does not require it', async () => {
    sanityFetch.mockResolvedValue({ requireConsent: false });
    const result = await register({ formId: 'form-free', consent: false });
    expect(result?.data?.success).toBe(true);
  });

  it('checks the form that belongs to the event', async () => {
    sanityFetch.mockResolvedValue({ requireConsent: false });
    await register({ formId: 'form-free', consent: false });
    const [query, params] = sanityFetch.mock.calls[0] as [string, Record<string, string>];
    expect(query).toContain('registrationForm._ref');
    expect(params).toMatchObject({ formId: 'form-free', eventId: 'event-1' });
  });

  it('refuses a form id that is not the event form', async () => {
    sanityFetch.mockResolvedValue(null);
    const result = await register({ formId: 'other-form', consent: false });
    expect(result?.serverError).toMatch(/accept/i);
    expect(create).not.toHaveBeenCalled();
  });
});
