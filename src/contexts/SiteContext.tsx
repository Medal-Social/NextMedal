'use client';

import { createContext, type ReactNode, useContext } from 'react';

interface SiteContextType {
  site: Sanity.Site | null;
}

const SiteContext = createContext<SiteContextType>({ site: null });

export function SiteProvider({ children, site }: { children: ReactNode; site: Sanity.Site }) {
  return <SiteContext.Provider value={{ site }}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context.site) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context.site;
}

export function useSiteOptional() {
  return useContext(SiteContext).site;
}
