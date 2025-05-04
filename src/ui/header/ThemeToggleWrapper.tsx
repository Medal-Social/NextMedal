'use client';

import HeaderThemeToggle from './ThemeToggle';

// Import with no SSR since it depends on theme state

export default function ThemeToggleWrapper() {
  return <HeaderThemeToggle />;
}
