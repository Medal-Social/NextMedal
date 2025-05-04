// Import commonly used icon packages - add more as needed
import * as Lucide from 'lucide-react';
import { stegaClean } from 'next-sanity';
import type { ComponentProps } from 'react';

export default function Icon({
  icon,
  size = 24, // Default size of 24px
  ...props
}: {
  icon?: Sanity.Icon;
  size?: number;
} & Omit<ComponentProps<'img'>, 'width' | 'height'>) {
  if (!icon) return null;

  // For ic0n, use react-icons instead of img
  if (icon.ic0n) {
    const iconName = stegaClean(icon.ic0n);

    // Get the icon library prefix (e.g., 'Fa' from 'FaHome')
    const name = iconName.includes('/') ? iconName.split('/')[1] : iconName;
    if (name in Lucide) {
      //@ts-ignore - dynamically accessing the icon
      const IconComponent = Lucide[name];
      return <IconComponent size={size} {...props} />;
    }
    if (name.substring(0, 2) === 'Lu') {
      const stippedName = name.substring(2);
      if (stippedName in Lucide) {
        // @ts-ignore - dynamically accessing the icon
        const IconComponent = Lucide[stippedName];
        return <IconComponent size={size} {...props} />;
      }
    }

    // Access the correct icon library based on prefix

    // Check if the icon exists in the library
    // @ts-ignore - dynamically accessing the icon

    // Fallback to original img if icon not found in react-icons
    return (
      <img
        src={`https://ic0n.dev/${iconName}`}
        width={size}
        height={size}
        alt={iconName}
        loading="lazy"
        {...props}
      />
    );
  }

  // Use Img component for image-based icons
  return null;
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
