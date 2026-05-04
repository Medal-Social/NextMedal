// Use dynamic import() because Turbopack tree-shakes the static
// `import { Medal } from '@medalsocial/sdk'` to `void 0` in this app's
// build. Verified empirically: even with SDK 1.1.5 (correct paths) AND
// `serverExternalPackages: ['@medalsocial/sdk']` set, the static import
// still produces `r=new(void 0)(...)` in `.next/server/chunks/*.js`.
//
// A fresh isolated Next 16 + SDK 1.1.5 repro DOES NOT reproduce this,
// so the trigger is something specific to this app's plugin/workspace
// stack (Sentry + next-intl + OpenTelemetry transitive deps + pnpm
// monorepo) — not pinned down. Tracking: Medal-Social/MedalSocial-SDK#49.
//
// Hiding the module name behind `Array.join()` defeats Turbopack's
// static analysis, so the import resolves at runtime against the real
// SDK module.
import type { Medal as MedalType } from '@medalsocial/sdk';

let _medal: MedalType | null = null;
let _medalPromise: Promise<MedalType | null> | null = null;

/**
 * Returns a singleton Medal SDK client, or null if MEDAL_API_KEY isn't set.
 * Forms must NEVER fail because the SDK is unavailable — Sanity is the
 * source of truth and SDK calls are best-effort.
 *
 * Reads directly from process.env so this file stays Studio-bundle-safe
 * (the strict env validator throws when env vars aren't loaded).
 */
export async function getMedal(): Promise<MedalType | null> {
  const apiKey = typeof process !== 'undefined' ? process.env?.MEDAL_API_KEY : undefined;
  const baseUrl = typeof process !== 'undefined' ? process.env?.MEDAL_API_ENDPOINT : undefined;

  if (!apiKey || apiKey.startsWith('pending')) {
    return null;
  }

  if (_medal) return _medal;

  if (!_medalPromise) {
    _medalPromise = (async (): Promise<MedalType | null> => {
      try {
        const moduleName = ['@medalsocial', 'sdk'].join('/');
        const sdk = (await import(/* webpackIgnore: true */ moduleName)) as Record<string, unknown>;
        const MedalClass =
          (sdk.Medal as typeof MedalType | undefined) ??
          (sdk.default as typeof MedalType | undefined);
        if (!MedalClass) return null;
        _medal = new MedalClass(apiKey, { baseUrl: baseUrl || undefined });
        return _medal;
      } catch {
        // Forms must NEVER fail because the SDK is unavailable —
        // contract is "return null on any failure". Reset the memo
        // so a subsequent call can retry (transient failures, e.g.
        // module not yet ready post-deploy, shouldn't permanently
        // disable the SDK across the worker's lifetime).
        _medalPromise = null;
        return null;
      }
    })();
  }

  return _medalPromise;
}
