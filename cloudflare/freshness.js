// Apply to the outgoing response, AFTER any internal edge cache has read or
// stored it. Browser freshness must not change the server-side cache lifetime.
export const DOCUMENT_CACHE_CONTROL = 'private, no-cache, max-age=0, must-revalidate';

export function withDocumentFreshness(request, response) {
  const contentType = response.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase();
  const isDocument = contentType === 'text/html' || contentType === 'text/x-component';
  const isDocumentValidation =
    response.status === 304 &&
    (request.headers.get('RSC') === '1' || request.headers.get('Accept')?.includes('text/html'));
  if (!isDocument && !isDocumentValidation) return response;

  const headers = new Headers(response.headers);
  const previous = headers.get('Cache-Control') || '';
  const preserve = ['no-store', 'no-transform'].filter((directive) =>
    new RegExp(`(?:^|,)\\s*${directive}\\s*(?:,|$)`, 'i').test(previous)
  );
  headers.set('Cache-Control', [DOCUMENT_CACHE_CONTROL, ...preserve].join(', '));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
    // The app's gzip wrapper may already have encoded this stream.
    encodeBody: 'manual',
  });
}
