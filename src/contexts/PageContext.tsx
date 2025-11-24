'use client';

import { createContext, useContext, type ReactNode } from 'react';

interface PageContextType {
	page?: Sanity.PageBase;
}

const PageContext = createContext<PageContextType>({ page: undefined });

export function PageProvider({
	children,
	page,
}: {
	children: ReactNode;
	page?: Sanity.PageBase;
}) {
	return <PageContext.Provider value={{ page }}>{children}</PageContext.Provider>;
}

export function usePage() {
	return useContext(PageContext);
}
