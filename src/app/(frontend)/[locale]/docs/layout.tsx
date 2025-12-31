import type { ReactNode } from 'react';
import DocsLayoutClient from './DocsLayoutClient';

interface DocsLayoutProps {
  children: ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return <DocsLayoutClient>{children}</DocsLayoutClient>;
}
