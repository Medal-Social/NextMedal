// Import commonly used icon packages - add more as needed
import * as Lucide from 'lucide-react';
import { stegaClean } from 'next-sanity';
import type { ComponentProps } from 'react';

export default function Icon({
  icon,
  ...props
}: { icon: string } & Omit<ComponentProps<'img'>, 'width' | 'height'>) {
  if (!icon) return null;

  // For ic0n, use react-icons instead of img
  if (icon) {
    const iconName = stegaClean(icon);

    // Get the icon library prefix (e.g., 'Fa' from 'FaHome')
    const name = iconName.includes('/') ? iconName.split('/')[1] : iconName;
    if (name in Lucide) {
      //@ts-ignore - dynamically accessing the icon
      const IconComponent = Lucide[name];
      return <IconComponent {...props} />;
    }
    if (name.substring(0, 2) === 'Lu') {
      const stippedName = name.substring(2);
      if (stippedName in Lucide) {
        // @ts-ignore - dynamically accessing the icon
        const IconComponent = Lucide[stippedName];
        return <IconComponent {...props} />;
      }
    }

    // Fallback to original img if icon not found in react-icons
    return <img src={`https://ic0n.dev/${iconName}`} alt="" loading="lazy" {...props} />;
  }
  return null;
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
