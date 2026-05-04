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
    let anchor: string | null = null;
    if (params) {
      anchor = params.startsWith('#') ? params : `#${params}`;
    }

    return ['/', path, anchor].filter(Boolean).join('');
  }

  return undefined;
}
