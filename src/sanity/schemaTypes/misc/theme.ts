import { Palette } from 'lucide-react';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'theme',
  title: 'Theme',
  icon: Palette,
  type: 'document',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'core', title: 'Core Colors' },
    { name: 'ui', title: 'UI Components' },
    { name: 'sidebar', title: 'Sidebar & Popover' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      description: 'Name of the theme',
      type: 'string',
      group: 'general',
    }),
    defineField({
      name: 'background',
      title: 'Background Color',
      description: 'Main app background color (--background) - used for the page background',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'general',
    }),
    defineField({
      name: 'foreground',
      title: 'Foreground Color',
      description: 'Main text color (--foreground) - used for most text content on the background',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'general',
    }),
    defineField({
      name: 'primary',
      title: 'Primary Color',
      description:
        'Primary action color (--primary) - used for primary buttons, active states, and focus elements',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'core',
    }),
    defineField({
      name: 'primaryForeground',
      title: 'Primary Foreground Color',
      description:
        'Text color on primary elements (--primary-foreground) - used for text on primary buttons',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'core',
    }),
    defineField({
      name: 'secondary',
      title: 'Secondary Color',
      description:
        'Secondary action color (--secondary) - used for secondary buttons and hover states',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'core',
    }),
    defineField({
      name: 'secondaryForeground',
      title: 'Secondary Foreground Color',
      description:
        'Text color on secondary elements (--secondary-foreground) - used for text on secondary buttons',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'core',
    }),
    defineField({
      name: 'accent',
      title: 'Accent Color',
      description:
        'Accent color (--accent) - used for hover effects on non-primary/secondary elements',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'core',
    }),
    defineField({
      name: 'accentForeground',
      title: 'Accent Foreground Color',
      description:
        'Text color on accent elements (--accent-foreground) - used for text on accented areas',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'core',
    }),
    defineField({
      name: 'muted',
      title: 'Muted Color',
      description:
        'Muted background color (--muted) - used for badges, subtle backgrounds, and hover states',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'core',
    }),
    defineField({
      name: 'mutedForeground',
      title: 'Muted Foreground Color',
      description:
        'Muted text color (--muted-foreground) - used for placeholders, help text, and disabled states',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'core',
    }),
    defineField({
      name: 'card',
      title: 'Card Color',
      description: 'Card background color (--card) - used for cards, modals, and panels',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'ui',
    }),
    defineField({
      name: 'cardForeground',
      title: 'Card Foreground Color',
      description:
        'Text color on cards (--card-foreground) - used for text inside cards, modals, and panels',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'ui',
    }),
    defineField({
      name: 'destructive',
      title: 'Destructive Color',
      description:
        'Destructive action color (--destructive) - used for delete buttons and error states',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'ui',
    }),
    defineField({
      name: 'destructiveForeground',
      title: 'Destructive Foreground Color',
      description:
        'Text color on destructive elements (--destructive-foreground) - used for text on error buttons',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'ui',
    }),
    defineField({
      name: 'border',
      title: 'Border Color',
      description: 'Border color (--border) - used for dividers, outlines, and separators',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'ui',
    }),
    defineField({
      name: 'input',
      title: 'Input Color',
      description: 'Input border color (--input) - used for form input borders and outlines',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'ui',
    }),
    defineField({
      name: 'ring',
      title: 'Ring Color',
      description:
        'Focus ring color (--ring) - used for focus outlines around interactive elements',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'ui',
    }),
    defineField({
      name: 'chart1',
      title: 'Chart 1 Color',
      description: 'First chart color (--chart-1) - used in charts and data visualizations',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'ui',
    }),
    defineField({
      name: 'chart2',
      title: 'Chart 2 Color',
      description: 'Second chart color (--chart-2) - used in charts and data visualizations',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'ui',
    }),
    defineField({
      name: 'chart3',
      title: 'Chart 3 Color',
      description: 'Third chart color (--chart-3) - used in charts and data visualizations',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'ui',
    }),
    defineField({
      name: 'chart4',
      title: 'Chart 4 Color',
      description: 'Fourth chart color (--chart-4) - used in charts and data visualizations',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'ui',
    }),
    defineField({
      name: 'chart5',
      title: 'Chart 5 Color',
      description: 'Fifth chart color (--chart-5) - used in charts and data visualizations',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'ui',
    }),
    defineField({
      name: 'sidebarBackground',
      title: 'Sidebar Background Color',
      description:
        'Sidebar background color (--sidebar-background) - used for the sidebar background',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'sidebar',
    }),
    defineField({
      name: 'sidebarForeground',
      title: 'Sidebar Foreground Color',
      description:
        'Sidebar text color (--sidebar-foreground) - used for text content in the sidebar',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'sidebar',
    }),
    defineField({
      name: 'sidebarPrimary',
      title: 'Sidebar Primary Color',
      description:
        'Sidebar primary color (--sidebar-primary) - used for primary actions in the sidebar',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'sidebar',
    }),
    defineField({
      name: 'sidebarPrimaryForeground',
      title: 'Sidebar Primary Foreground Color',
      description:
        'Sidebar primary button text color (--sidebar-primary-foreground) - used for text on primary sidebar buttons',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'sidebar',
    }),
    defineField({
      name: 'sidebarAccent',
      title: 'Sidebar Accent Color',
      description:
        'Sidebar accent color (--sidebar-accent) - used for highlighting elements in the sidebar',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'sidebar',
    }),
    defineField({
      name: 'sidebarAccentForeground',
      title: 'Sidebar Accent Foreground Color',
      description:
        'Sidebar accent text color (--sidebar-accent-foreground) - used for text on accented sidebar elements',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'sidebar',
    }),
    defineField({
      name: 'sidebarBorder',
      title: 'Sidebar Border Color',
      description:
        'Sidebar border color (--sidebar-border) - used for dividers and separators in the sidebar',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'sidebar',
    }),
    defineField({
      name: 'sidebarRing',
      title: 'Sidebar Ring Color',
      description:
        'Sidebar focus ring color (--sidebar-ring) - used for focus outlines in the sidebar',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'sidebar',
    }),
    defineField({
      name: 'popover',
      title: 'Popover Color',
      description:
        'Popover background color (--popover) - used for dropdowns, tooltips, and context menus',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'sidebar',
    }),
    defineField({
      name: 'popoverForeground',
      title: 'Popover Foreground Color',
      description:
        'Popover text color (--popover-foreground) - used for text in dropdowns, tooltips, and menus',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      group: 'sidebar',
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
});
