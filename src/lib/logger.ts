import * as Sentry from '@sentry/nextjs';
import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const hasSentry = !!process.env.NEXT_PUBLIC_SENTRY_DSN;

export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'error' : 'info'),
  transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  hooks: {
    logMethod(inputArgs, method, level) {
      if (level === 50 && hasSentry) {
        // 50 is the 'error' level in pino
        const [arg1, arg2] = inputArgs as unknown[];
        if (arg1 instanceof Error) {
          Sentry.captureException(arg1, { extra: { msg: arg2 } });
        } else if (typeof arg1 === 'string') {
          Sentry.captureMessage(arg1, 'error');
          if (arg2 instanceof Error) {
            Sentry.captureException(arg2, { extra: { data: arg1 } });
          }
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return method.apply(this, inputArgs as Parameters<typeof method>);
    },
  },
});
