export class BucketCachePurge {}
export class DOQueueHandler {}
export class DOShardedTagCache {}

export default {
  fetch() {
    return new Response('<rss>collection</rss>', {
      headers: { 'Content-Type': 'application/rss+xml' },
    });
  },
};
