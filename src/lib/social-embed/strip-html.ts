/**
 * Strip tags from oEmbed HTML snippets so we can show plain text on our card.
 * Not a full HTML sanitizer — input is trusted provider markup we discard.
 */
const ENTITIES: Record<string, string> = {
  nbsp: ' ',
  mdash: '—',
  '#8212': '—',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': "'",
};

export function stripHtml(html: string): string {
  let text = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n');
  // Repeat until stable so nested fragments like `<scr<b>ipt>` cannot reassemble a tag.
  let previous: string;
  do {
    previous = text;
    text = text.replace(/<[^<>]*>/g, '');
  } while (text !== previous);
  return (
    text
      // Drop any unmatched angle bracket left behind by malformed markup.
      .replace(/[<>]/g, '')
      // Decode entities in a single pass so `&amp;lt;` stays `&lt;` (no double unescaping).
      .replace(
        /&(nbsp|mdash|#8212|amp|lt|gt|quot|#39);/gi,
        (_, name: string) => ENTITIES[name.toLowerCase()] ?? _
      )
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
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
