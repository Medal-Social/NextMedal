import openNextWorker, {
  BucketCachePurge,
  DOQueueHandler,
  DOShardedTagCache,
} from './.open-next/worker.js';

// Re-export the OpenNext durable-object handlers so wrangler can resolve them if
// an R2 incremental cache / sharded tag cache or queue is enabled later. They're
// unused (and unbound) with the current minimal open-next.config.ts.
export { BucketCachePurge, DOQueueHandler, DOShardedTagCache };

const HTML_CONTENT_TYPE = 'text/html';

function acceptsGzip(request) {
  const clientAcceptEncoding =
    request.cf?.clientAcceptEncoding || request.headers.get('Accept-Encoding') || '';
  return /\bgzip\b/i.test(clientAcceptEncoding);
}

function shouldCompressHtml(request, response) {
  if (request.method === 'HEAD') return false;
  if (!response.body || response.headers.has('Content-Encoding')) return false;
  if (!acceptsGzip(request)) return false;

  const contentType = response.headers.get('Content-Type') || '';
  return response.status === 200 && contentType.toLowerCase().includes(HTML_CONTENT_TYPE);
}

// Gzip HTML responses. Cloudflare doesn't always compress streamed Worker
// responses at the edge, so do it here to keep document transfer small.
function gzipHtmlResponse(request, response) {
  if (!shouldCompressHtml(request, response)) return response;

  const headers = new Headers(response.headers);
  headers.set('Content-Encoding', 'gzip');
  headers.append('Vary', 'Accept-Encoding');
  headers.delete('Content-Length');

  return new Response(response.body.pipeThrough(new CompressionStream('gzip')), {
    status: response.status,
    statusText: response.statusText,
    headers,
    encodeBody: 'manual',
  });
}

export default {
  async fetch(request, env, ctx) {
    const response = await openNextWorker.fetch(request, env, ctx);
    return gzipHtmlResponse(request, response);
  },
};
