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
    return ['/', path, params].filter(Boolean).join('');
  }

  return undefined;
}
