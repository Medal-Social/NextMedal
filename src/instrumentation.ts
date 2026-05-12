import { logger } from '@/lib/core/logger';

export function register() {
  return;
}

export const onRequestError = (
  err: unknown,
  request: { path: string; method: string; headers: Record<string, string> },
  context: { routerKind: string; routePath: string; routeType: string; renderSource: string }
) => {
  const requestSummary = {
    method: request.method,
    path: request.path,
  };

  // Log as warning for "Failed to find Server Action".
  // This usually happens during deployment transitions.
  if (err instanceof Error && err.message.includes('Failed to find Server Action')) {
    logger.warn(
      { err, request: requestSummary, context },
      'Next.js: Failed to find Server Action (deployment drift suspected)'
    );
    return;
  }

  logger.error({ err, request: requestSummary, context }, 'Unhandled Next.js request error');
};
