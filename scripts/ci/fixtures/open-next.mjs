export class BucketCachePurge {}
export class DOQueueHandler {}
export class DOShardedTagCache {}

export const ogRequests = [];

export default {
  fetch(request) {
    const path = new URL(request.url).pathname;
    if (path === '/api/og/deadline-test') {
      ogRequests.push(request);
      return new Promise(() => {});
    }
    if (['/contact.html', '/articles/release.xml', '/nb/report.json'].includes(path)) {
      return new Response('CMS document', { headers: { 'Content-Type': 'text/html' } });
    }
    if (/\.(?:html?|xml|json)$/.test(path) && !path.endsWith('/rss.xml')) {
      return new Response('CMS document not found', { status: 404 });
    }
    return new Response('<rss>collection</rss>', {
      headers: { 'Content-Type': 'application/rss+xml' },
    });
  },
};
