'use client';

import { AlertCircle, Home, RefreshCcw } from 'lucide-react';

/**
 * Root error UI. Avoids importing globals.css / next/font so their CSS does
 * not attach to every route via the shared client graph (that was keeping a
 * ~35KB render-blocking stylesheet on the lean `/qa/social-embeds` gate).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          background: '#fafafa',
          color: '#09090b',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        <div style={{ width: '100%', maxWidth: 28 * 16, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <div
              style={{
                borderRadius: 9999,
                background: 'rgba(220,38,38,0.1)',
                padding: 24,
                boxShadow: '0 0 0 8px rgba(220,38,38,0.05)',
              }}
            >
              <AlertCircle size={48} color="#dc2626" strokeWidth={1.5} aria-hidden />
            </div>
          </div>

          <h1
            style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 12px' }}
          >
            Something went wrong
          </h1>
          <p style={{ fontSize: 18, color: '#52525b', lineHeight: 1.6, margin: '0 0 24px' }}>
            We encountered an unexpected error. Our team has been notified and we&apos;re working on
            a fix.
          </p>

          {error.digest ? (
            <p
              style={{
                display: 'inline-block',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 10,
                color: '#52525b',
                background: '#f4f4f5',
                borderRadius: 9999,
                padding: '6px 12px',
                marginBottom: 24,
              }}
            >
              Error ID: <span style={{ userSelect: 'all' }}>{error.digest}</span>
            </p>
          ) : null}

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'center',
              marginTop: 16,
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: 48,
                padding: '0 32px',
                borderRadius: 8,
                border: 0,
                background: '#1a1035',
                color: '#fff',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              <RefreshCcw size={16} aria-hidden />
              Try again
            </button>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: 48,
                padding: '0 32px',
                borderRadius: 8,
                border: '1px solid #e4e4e7',
                background: '#fff',
                color: '#09090b',
                fontWeight: 600,
                fontSize: 16,
                textDecoration: 'none',
              }}
            >
              <Home size={16} aria-hidden />
              Return Home
            </a>
          </div>

          <p style={{ marginTop: 48, fontSize: 12, color: '#52525b', fontStyle: 'italic' }}>
            If the problem persists, please contact support.
          </p>
        </div>
      </body>
    </html>
  );
}
