import type { PathSegment, SlugValidationContext } from 'sanity';
import { logger } from '@/lib/logger';

/**
 * Converts a Sanity path to a safe GROQ path string.
 * This prevents GROQ injection by ensuring each segment is properly formatted or sanitized.
 *
 * @param path - The Sanity path array
 * @returns A safe GROQ path string (e.g., "metadata.slug")
 */
export function toSafeGroqPath(path: PathSegment[]): string {
  return path.reduce<string>((acc, segment) => {
    if (typeof segment === 'string') {
      // Strict whitelist for field names: only alphanumeric and underscores, must start with letter/underscore
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(segment)) {
        throw new Error(`Invalid GROQ path segment: "${segment}"`);
      }
      return acc ? `${acc}.${segment}` : segment;
    }

    if (typeof segment === 'number') {
      return `${acc}[${segment}]`;
    }

    if (typeof segment === 'object' && '_key' in segment) {
      // Sanitize the key: it must not contain quotes that could break out of the string
      const safeKey = segment._key.replace(/['"\\]/g, '');
      return `${acc}[_key == "${safeKey}"]`;
    }

    throw new Error(`Unsupported GROQ path segment type: ${typeof segment}`);
  }, '');
}

type ExtendedSlugValidationContext = SlugValidationContext & {
  defaultIsUnique: (slug: string, context: SlugValidationContext) => Promise<boolean>;
  path: PathSegment[];
};

/**
 * Custom slug uniqueness validator that checks uniqueness per locale.
 *
 * Defaults to Sanity's standard unique check if the document has no language field.
 *
 * @param slug - The slug string to check
 * @param context - Validation context provided by Sanity
 * @returns true if unique, false if duplicate
 */
export async function isUniqueAcrossLocale(
  slug: string,
  context: SlugValidationContext
): Promise<boolean> {
  const { document, getClient, defaultIsUnique, path } = context as ExtendedSlugValidationContext;

  // Fallback to default behavior if no language is present on the document
  if (!document?.language) {
    return defaultIsUnique(slug, context);
  }

  const client = getClient({ apiVersion: '2025-12-23' });
  const id = document._id.replace(/^drafts\./, '');
  const params = {
    draft: `drafts.${id}`,
    published: id,
    slug,
    language: document.language,
  };

  try {
    // Construct the field path safely to prevent GROQ injection
    const fieldPath = toSafeGroqPath(path || []);
    const slugField = `${fieldPath}.current`;

    const query = `!defined(*[
      language == $language &&
      ${slugField} == $slug &&
      !(_id in [$draft, $published])
    ][0]._id)`;

    return await client.fetch(query, params);
  } catch (error) {
    // Fail safe: if path construction fails, reject the slug
    logger.error({ err: error }, 'GROQ path safety check failed');
    return false;
  }
}
