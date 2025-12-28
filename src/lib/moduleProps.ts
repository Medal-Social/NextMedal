import { stegaClean } from 'next-sanity';

export default function ({
  _type,
  options,
  _key,
  ...rest
}: Partial<Sanity.Module> & { spacing?: string; width?: string }) {
  return {
    id: stegaClean(options?.uid) || `module-${_key}`,
    'data-module': _type,
    ...(rest.spacing ? { spacing: rest.spacing } : {}),
    ...(rest.width ? { width: rest.width } : {}),
  };
}
