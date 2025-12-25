import type { SlugValidationContext } from 'sanity';

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
  const { document, getClient, defaultUnique, path } = context;

  // Fallback to default behavior if no language is present on the document
  if (!document?.language) {
    return defaultUnique(slug, context);
  }

  const client = getClient({ apiVersion: '2025-12-23' });
  const id = document._id.replace(/^drafts\./, '');
  const params = {
    draft: `drafts.${id}`,
    published: id,
    slug,
    language: document.language,
    type: document._type,
  };

  // Construct the field path dynamically (e.g. "metadata.slug.current")
  // We append .current because the validator receives the string value, but the field is an object
  // Note: This simple join assumes path segments are strings. Complex array paths with keys are not supported yet.
  const fieldPath = path.map((segment) => segment.toString()).join('.');
  const slugField = `${fieldPath}.current`;

  const query = `!defined(*[
    _type == $type &&
    language == $language &&
    ${slugField} == $slug &&
    !(_id in [$draft, $published])
  ][0]._id)`;

  return client.fetch(query, params);
}
