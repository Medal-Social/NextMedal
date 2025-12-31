import Image from 'next/image';
import { stegaClean } from 'next-sanity';

import { getFallbackIconUrl, resolveIcon } from './utils/resolveIcon';

interface IconStringProps {
  icon: string;
  size?: number;
  className?: string;
}

export default function IconString({ icon, size = 24, className }: IconStringProps) {
  if (!icon) return null;

  const IconComponent = resolveIcon(icon);
  if (IconComponent) {
    return <IconComponent size={size} className={className} />;
  }

  // Fallback to external icon service
  const cleanName = stegaClean(icon);
  return (
    <Image
      src={getFallbackIconUrl(cleanName)}
      width={size}
      height={size}
      alt=""
      className={className}
      unoptimized
    />
  );
}

// ... existing getPixels function
export function getPixels(size?: string) {
  const s = stegaClean(size);

  if (!s || typeof s !== 'string') return undefined;

  if (s.endsWith('px')) {
    return Number.parseFloat(s);
  }

  if (s.endsWith('em') || s.endsWith('lh')) {
    return Number.parseFloat(s) * 16;
  }

  return undefined;
}
