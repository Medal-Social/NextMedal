'use client';

import * as Sentry from '@sentry/nextjs';
import { Component, type ReactNode } from 'react';
import { logger } from '@/lib/core/logger';

type ErrorType = 'site-missing' | 'sanity-down' | 'other';

interface ErrorCategory {
  type: ErrorType;
  reportToSentry: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorType: ErrorType | null;
}

function categorizeError(error: Error): ErrorCategory {
  // 1. Check error codes for network errors (most reliable for network issues)
  const errorWithCode = error as Error & { code?: string };
  if (errorWithCode.code) {
    const networkErrorCodes = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNREFUSED',
      'FETCH_ERROR',
    ];
    if (networkErrorCodes.includes(errorWithCode.code)) {
      return { type: 'sanity-down', reportToSentry: false };
    }
  }

  // 2. Check error message patterns (necessary for errors without codes)
  const message = error.message.toLowerCase();

  // Expected state - site not configured yet
  if (message.includes('missing site settings') || message.includes('identity crisis')) {
    return { type: 'site-missing', reportToSentry: false };
  }

  // Transient failure - Sanity API down or network issues
  if (
    message.includes('fetch failed') ||
    message.includes('network') ||
    message.includes('econnreset') ||
    message.includes('timeout')
  ) {
    return { type: 'sanity-down', reportToSentry: false };
  }

  // Unexpected error - report to Sentry
  return { type: 'other', reportToSentry: true };
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorType: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const { type } = categorizeError(error);
    return {
      hasError: true,
      error,
      errorType: type,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { type, reportToSentry } = categorizeError(error);
    const { componentName = 'Unknown' } = this.props;

    // Log expected errors as warnings, unexpected errors as errors
    const logLevel = reportToSentry ? logger.error : logger.warn;
    logLevel(
      {
        error,
        errorInfo,
        errorType: type,
        component: componentName,
      },
      `Error boundary caught ${type} error in ${componentName}`
    );

    // Only report unexpected errors to Sentry
    if (reportToSentry) {
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        tags: {
          errorBoundary: componentName,
          errorType: type,
        },
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
