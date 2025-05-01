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
    const segment = _type === 'blog.post' ? '/blog/' : '/';
    const path = internal === 'index' ? null : internal;

    return [segment, path, params]
      .filter(Boolean)
      .join('');
  }

  return undefined;
}
