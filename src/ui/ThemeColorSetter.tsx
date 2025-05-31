'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface Theme {
  title?: string;
  background?: { hex: string };
  foreground?: { hex: string };
  primary?: { hex: string };
  primaryForeground?: { hex: string };
  secondary?: { hex: string };
  secondaryForeground?: { hex: string };
  accent?: { hex: string };
  accentForeground?: { hex: string };
  muted?: { hex: string };
  mutedForeground?: { hex: string };
  border?: { hex: string };
  input?: { hex: string };
  ring?: { hex: string };
  // Additional theme properties might exist
  [key: string]: any;
}

interface ThemeColorSetterProps {
  lightTheme?: Theme;
  darkTheme?: Theme;
}

export default function ThemeColorSetter({ lightTheme, darkTheme }: ThemeColorSetterProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Set mounted state when component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update CSS variables when theme changes
  useEffect(() => {
    if (!mounted) return;
    if (!lightTheme && !darkTheme) return;
    if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') return;

    const theme = resolvedTheme === 'dark' ? darkTheme : lightTheme;
    if (!theme) return;

    // Set each CSS variable directly
    const root = document.documentElement;

    // Helper to update CSS variable
    function updateCssVar(name: string, value: { hex?: string } | undefined) {
      if (value?.hex) {
        root.style.setProperty(name, value.hex);
      }
    }

    // Apply standard variables
    updateCssVar('--background', theme.background);
    updateCssVar('--foreground', theme.foreground);
    updateCssVar('--primary', theme.primary);
    updateCssVar('--primary-foreground', theme.primaryForeground);
    updateCssVar('--secondary', theme.secondary);
    updateCssVar('--secondary-foreground', theme.secondaryForeground);
    updateCssVar('--accent', theme.accent);
    updateCssVar('--accent-foreground', theme.accentForeground);
    updateCssVar('--muted', theme.muted);
    updateCssVar('--muted-foreground', theme.mutedForeground);
    updateCssVar('--border', theme.border);
    updateCssVar('--input', theme.input);
    updateCssVar('--ring', theme.ring);

    // Apply any additional properties
    const knownProps = [
      'title',
      'background',
      'foreground',
      'primary',
      'primaryForeground',
      'secondary',
      'secondaryForeground',
      'accent',
      'accentForeground',
      'muted',
      'mutedForeground',
      'border',
      'input',
      'ring',
    ];

    for (const key of Object.keys(theme)) {
      if (
        !knownProps.includes(key) &&
        typeof theme[key] === 'object' &&
        theme[key] !== null &&
        'hex' in theme[key]
      ) {
        const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        updateCssVar(cssVar, theme[key]);
      }
    }
  }, [resolvedTheme, lightTheme, darkTheme, mounted]);

  // This component doesn't render anything visible
  return null;
}
