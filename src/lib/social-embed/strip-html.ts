/**
 * Strip tags from oEmbed HTML snippets so we can show plain text on our card.
 * Not a full HTML sanitizer — input is trusted provider markup we discard.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Pull the trailing “Month Day, Year” date from a Twitter/X oEmbed blockquote footer. */
export function extractDateFromXOembedHtml(html: string): string | null {
  const match = html.match(
    />(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}<\/a>/i
  );
  return match ? match[0].replace(/^>/, '').replace(/<\/a>$/i, '') : null;
}
