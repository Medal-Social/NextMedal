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
    .replace(/&mdash;/gi, '—')
    .replace(/&#8212;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const ENGLISH_MONTHS =
  'January|February|March|April|May|June|July|August|September|October|November|December';

/**
 * Pull the trailing “Month Day, Year” date from a Twitter/X oEmbed blockquote
 * footer. Returns a date-only `YYYY-MM-DD` string — oEmbed footers never carry
 * a clock time, so callers must not fabricate `00:00`.
 */
export function extractDateFromXOembedHtml(html: string): string | null {
  const match = html.match(new RegExp(`(${ENGLISH_MONTHS})\\s+(\\d{1,2}),\\s+(\\d{4})`, 'i'));
  if (!match) return null;
  const parsed = new Date(`${match[1]} ${match[2]}, ${match[3]} UTC`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

/** Keep only the first `<p>…</p>` body from X oEmbed HTML (drops the mdash footer). */
export function extractXOembedBodyHtml(html: string): string {
  return html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? '';
}
