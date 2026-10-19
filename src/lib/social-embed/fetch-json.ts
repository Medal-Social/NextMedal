import { logger } from '@/lib/core/logger';
import { SOCIAL_EMBED_REVALIDATE_SECONDS } from './cache';

/** Upper bound so a hung provider cannot stall article rendering indefinitely. */
export const SOCIAL_EMBED_FETCH_TIMEOUT_MS = 8000;

export async function fetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; status: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SOCIAL_EMBED_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      signal: init?.signal ? AbortSignal.any([init.signal, controller.signal]) : controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {}),
      },
      next: { revalidate: SOCIAL_EMBED_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      logger.warn({ url, status: response.status }, 'social-embed fetch non-OK');
      return { ok: false, status: response.status };
    }

    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch (error) {
    logger.warn({ url, err: error }, 'social-embed fetch failed');
    return { ok: false, status: 0 };
  } finally {
    clearTimeout(timeout);
  }
}
