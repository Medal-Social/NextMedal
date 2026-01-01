import { stegaClean } from 'next-sanity';

export default function moduleProps({
  _type,
  options,
  _key,
  ...rest
}: Partial<Sanity.Module> & { spacing?: string; width?: string }) {
  return {
    id: stegaClean(options?.anchorId) || `module-${_key}`,
    'data-module': _type,
    ...(rest.spacing ? { spacing: rest.spacing } : {}),
    ...(rest.width ? { width: rest.width } : {}),
  };
}
