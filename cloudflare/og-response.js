// ImageResponse renders lazily. Catching its constructor misses stream errors
// and promises abandoned by an earlier Worker invocation. Keep a request-local
// deadline alive, and finish the image before committing the HTTP response.
export async function withOgFallback(request, env, render, timeoutMs = 5000) {
  const url = new URL(request.url);
  if (!['GET', 'HEAD'].includes(request.method) || !/^\/api\/og(?:\/|$)/.test(url.pathname))
    return render(request);
  // Cancellation is cooperative: imports and CPU-bound rendering cannot be
  // interrupted, but downstream I/O can observe this signal and late bodies
  // are discarded rather than consumed after the response deadline.
  const controller = new AbortController();
  const renderRequest = new Request(request, {
    signal: AbortSignal.any([request.signal, controller.signal]),
  });
  let phase = 'render';
  let timer;
  let reader;
  try {
    return await Promise.race([
      (async () => {
        const response = await render(renderRequest);
        if (controller.signal.aborted) {
          void response.body?.cancel().catch(() => undefined);
          throw controller.signal.reason;
        }
        if (response.status >= 500) throw new Error(`Image renderer returned ${response.status}`);
        if (response.status !== 200 || request.method === 'HEAD') return response;
        phase = 'stream';
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
        timer = setTimeout(() => {
          phase = 'deadline';
          const error = new Error('Image render deadline exceeded');
          controller.abort(error);
          reject(error);
        }, timeoutMs);
      }),
    ]);
  } catch (error) {
    clearTimeout(timer);
    // biome-ignore lint/suspicious/noConsole: Worker boundary has no application logger; Cloudflare captures this diagnostic.
    console.error('[api/og] response failed', { phase }, error);
    // Cancellation can itself reject after a renderer has failed.
    void reader?.cancel().catch(() => undefined);
    const fallbackUrl = new URL('/og-fallback.png', url);
    try {
      if (env?.ASSETS) {
        const fallback = await env.ASSETS.fetch(
          new Request(fallbackUrl, { method: request.method })
        );
        if (fallback.ok) {
          const headers = new Headers(fallback.headers);
          headers.set('Cache-Control', 'public, max-age=60');
          headers.set('X-OG-Fallback', '1');
          return new Response(fallback.body, { status: 200, headers });
        }
      }
    } catch (assetError) {
      // biome-ignore lint/suspicious/noConsole: Preserve the asset binding failure in Worker observability.
      console.error('[api/og] fallback asset failed', assetError);
    }
    return Response.redirect(fallbackUrl, 302);
  } finally {
    clearTimeout(timer);
  }
}
