import type { Module } from '@/sanity/lib/types';

export type PlacementLocation = 'top' | 'bottom' | 'sidebar' | 'injection';

export interface Placement {
  _id: string;
  scope: string;
  location: PlacementLocation;
  injectionConfig?: {
    afterParagraph?: number;
  };
  modules?: Module[];
}

export interface Placements {
  top: Module[];
  bottom: Module[];
  sidebar: Module[];
  injection: Placement[];
}

export function groupPlacements(placements: Placement[]): Placements {
  const grouped: Placements = {
    top: [],
    bottom: [],
    sidebar: [],
    injection: [],
  };

  if (!placements) return grouped;

  for (const placement of placements) {
    if (!placement.modules || !placement.location) continue;

    const location = placement.location.toLowerCase();

    if (location === 'top') {
      grouped.top.push(...placement.modules);
    } else if (location === 'bottom') {
      grouped.bottom.push(...placement.modules);
    } else if (location === 'sidebar' || location.includes('sidebar')) {
      grouped.sidebar.push(...placement.modules);
    } else if (location === 'injection') {
      grouped.injection.push(placement);
    }
  }

  return grouped;
}
