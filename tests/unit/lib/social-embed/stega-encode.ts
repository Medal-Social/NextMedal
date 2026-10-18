import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/**
 * Encode a string with Vercel/Sanity stega (same invisible chars draft mode adds).
 * Resolves `@vercel/stega` through `@sanity/client` so we don't add a direct dep.
 */
export function stegaEncodeForTest(value: string): string {
  const stegaPath = require.resolve('@vercel/stega', {
    paths: [require.resolve('@sanity/client/stega')],
  });
  const { vercelStegaCombine } = require(stegaPath) as {
    vercelStegaCombine: (plain: string, editInfo: string) => string;
  };
  return vercelStegaCombine(
    value,
    JSON.stringify({ origin: 'https://test.example.com', href: '/studio' })
  );
}
