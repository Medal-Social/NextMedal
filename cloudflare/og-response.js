// ImageResponse renders lazily. Catching its constructor misses stream errors
// and promises abandoned by an earlier Worker invocation. Keep a request-local
// deadline alive, and finish the image before committing the HTTP response.
export async function withOgFallback(request, env, render, timeoutMs = 5000) {
  const url = new URL(request.url);
  if (!['GET', 'HEAD'].includes(request.method) || !/^\/api\/og(?:\/|$)/.test(url.pathname))
    return render();
  let timer;
  let reader;
  try {
    return await Promise.race([
      (async () => {
        const response = await render();
        if (response.status >= 500) throw new Error('Image renderer failed');
        if (response.status !== 200 || request.method === 'HEAD') return response;
        reader = response.body?.getReader();
        const chunks = [];
        if (reader) {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
        }
        const headers = new Headers(response.headers);
        headers.delete('Content-Length');
        const body = new Uint8Array(chunks.reduce((size, chunk) => size + chunk.byteLength, 0));
        let offset = 0;
        for (const chunk of chunks) {
          body.set(chunk, offset);
          offset += chunk.byteLength;
        }
        return new Response(body, { status: response.status, headers });
      })(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Image render deadline exceeded')), timeoutMs);
      }),
    ]);
  } catch {
    // Cancellation can itself reject after a renderer has failed.
    void reader?.cancel().catch(() => {});
    const fallbackUrl = new URL('/og-fallback.png', url);
    if (env?.ASSETS) {
      const fallback = await env.ASSETS.fetch(new Request(fallbackUrl, { method: request.method }));
      if (fallback.ok) {
        const headers = new Headers(fallback.headers);
        headers.set('Cache-Control', 'public, max-age=60');
        headers.set('X-OG-Fallback', '1');
        return new Response(fallback.body, { status: 200, headers });
      }
    }
    return Response.redirect(fallbackUrl, 302);
  } finally {
    clearTimeout(timer);
  }
}
