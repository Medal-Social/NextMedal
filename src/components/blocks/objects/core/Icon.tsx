import { stegaClean } from 'next-sanity';
import { getFallbackIconUrl, resolveIcon } from './utils/resolveIcon';

interface IconProps {
  icon?: Sanity.Icon;
  size?: number;
  className?: string;
}

export default function Icon({ icon, size = 24, className }: IconProps) {
  if (!icon) return null;

  // Handle icon field (can be 'icon' or legacy 'ic0n')
  const iconName = icon.icon || icon.ic0n;
  if (!iconName) return null;

  const IconComponent = resolveIcon(iconName);
  if (IconComponent) {
    return <IconComponent size={size} className={className} />;
  }

  // Fallback to external icon service
  const cleanName = stegaClean(iconName);
  return (
    // biome-ignore lint/performance/noImgElement: external icon service
    <img
      src={getFallbackIconUrl(cleanName)}
      width={size}
      height={size}
      alt={cleanName}
      loading="lazy"
      className={className}
    />
  );
}

// Keep getPixels for backward compatibility with existing data
export function getPixels(size?: string) {
  const s = stegaClean(size);

  if (!s || typeof s !== 'string') return 24; // Default to 24px

  if (s.endsWith('px')) {
    return Number.parseFloat(s);
  }

  if (s.endsWith('em') || s.endsWith('lh')) {
    return Number.parseFloat(s) * 16;
  }

  return 24; // Default fallback
}
