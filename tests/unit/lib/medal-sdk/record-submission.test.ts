import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { recordSubmission, SUBMISSION_DEADLINE_MS } from '@/lib/medal-sdk/record-submission';

const logger = { error: vi.fn() };
const submission = { email: 'a@example.com', labels: ['contact'], note: 'Hello' };

describe('recordSubmission deadline', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('gives up after about 20 seconds, whatever the SDK is still waiting for', async () => {
    expect(SUBMISSION_DEADLINE_MS).toBeLessThanOrEqual(20_000);
    const medal = { contacts: { create: () => new Promise(() => {}) } };

    const pending = recordSubmission(medal as never, submission, logger);
    const settled = expect(pending).rejects.toThrow(/did not answer/i);
    await vi.advanceTimersByTimeAsync(SUBMISSION_DEADLINE_MS);
    await settled;
  });

  it('does not wait for the deadline when Medal answers', async () => {
    const medal = { contacts: { create: async () => ({ data: { id: 'c1' } }) } };

    await expect(recordSubmission(medal as never, submission, logger)).resolves.toEqual({
      status: 'created',
      contactId: 'c1',
    });
    expect(vi.getTimerCount()).toBe(0);
  });
});
