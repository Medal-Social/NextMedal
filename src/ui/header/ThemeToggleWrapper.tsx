'use client';

import HeaderThemeToggle from './ThemeToggle';

// Import with no SSR since it depends on theme state

export default function ThemeToggleWrapper({ className, dropdownAlign }: { className?: string, dropdownAlign?: 'start' | 'end' | 'center' }) {
  return <HeaderThemeToggle className={className} dropdownAlign={dropdownAlign} />;
}
