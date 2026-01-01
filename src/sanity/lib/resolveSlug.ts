export default function resolveSlug({
  _type,
  internal,
  params,
  external,
}: {
  _type?: string;
  internal?: string;
  params?: string;
  external?: string;
}) {
  if (external) return external;

  if (internal) {
    const path = internal === 'index' ? null : internal;

    // Ensure params (anchor) starts with # if provided
    const anchor = params ? (params.startsWith('#') ? params : `#${params}`) : null;

    return ['/', path, anchor].filter(Boolean).join('');
  }

  return undefined;
}
