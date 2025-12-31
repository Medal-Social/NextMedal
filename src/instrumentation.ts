import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/core/logger';

export async function register() {
  const IS_PRODUCTION =
    process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  if (!IS_PRODUCTION) {
    return;
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = (
  err: unknown,
  request: { path: string; method: string; headers: Record<string, string> },
  context: { routerKind: string; routePath: string; routeType: string; renderSource: string }
) => {
  const IS_PRODUCTION =
    process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  // Log as warning and skip Sentry for "Failed to find Server Action"
  // This usually happens during deployment transitions.
  if (err instanceof Error && err.message.includes('Failed to find Server Action')) {
    logger.warn(
      { err, request, context },
      'Next.js: Failed to find Server Action (deployment drift suspected)'
    );
    return;
  }

  if (IS_PRODUCTION) {
    return Sentry.captureRequestError(err, request, context);
  }
};
