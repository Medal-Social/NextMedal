import { logger } from '@/lib/core/logger';

export function register() {
  return;
}

export const onRequestError = (
  err: unknown,
  request: { path: string; method: string; headers: Record<string, string> },
  context: { routerKind: string; routePath: string; routeType: string; renderSource: string }
) => {
  // Log as warning for "Failed to find Server Action".
  // This usually happens during deployment transitions.
  if (err instanceof Error && err.message.includes('Failed to find Server Action')) {
    logger.warn(
      { err, request, context },
      'Next.js: Failed to find Server Action (deployment drift suspected)'
    );
    return;
  }

  logger.error({ err, request, context }, 'Unhandled Next.js request error');
};
