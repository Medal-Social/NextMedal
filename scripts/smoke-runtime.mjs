import { setTimeout } from 'node:timers/promises';

const origin = new URL(process.env.SMOKE_URL);
if (origin.protocol !== 'https:') throw new Error('Smoke checks require an HTTPS site URL');
for (let attempt = 1; attempt <= 6; attempt++) {
  try {
    for (const path of ['/', '/robots.txt']) {
      const url = new URL(path, origin);
      url.searchParams.set('deploy_check', process.env.GITHUB_SHA || 'manual');
      const response = await fetch(url, {
        signal: AbortSignal.timeout(20_000),
        headers: { 'User-Agent': 'Medal-Deployment-Smoke/1.0' },
      });
      if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
      const text = await response.text();
      if (
        path === '/' &&
        (!response.headers.get('content-type')?.includes('text/html') || !/<html[\s>]/i.test(text))
      )
        throw new Error('Homepage did not return HTML');
      if (path === '/robots.txt' && !/user-agent:/i.test(text))
        throw new Error('robots.txt did not return robots directives');
      console.log(`${origin.origin}${path}: HTTP ${response.status}, content verified`);
    }
    const checks = [
      ['/__medal_missing_asset__.js', 404, null],
      ...(process.env.SMOKE_OG_PATH ? [[process.env.SMOKE_OG_PATH, 200, 'image/']] : []),
      ...(process.env.SMOKE_FAVICON === 'true' ? [['/favicon.ico', 200, 'image/']] : []),
    ];
    for (const [path, expectedStatus, contentType] of checks) {
      const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(20_000) });
      if (response.status !== expectedStatus)
        throw new Error(`${path}: HTTP ${response.status}, expected ${expectedStatus}`);
      if (contentType && !response.headers.get('content-type')?.startsWith(contentType))
        throw new Error(`${path}: expected image content`);
      const body = await response.arrayBuffer();
      if (contentType && body.byteLength === 0) throw new Error(`${path}: empty image`);
      console.log(`${origin.origin}${path}: HTTP ${response.status}, content verified`);
    }
    process.exit(0);
  } catch (error) {
    console.error(`Smoke attempt ${attempt}/6: ${error.message}`);
    if (attempt === 6) process.exit(1);
    await setTimeout(10_000);
  }
}
