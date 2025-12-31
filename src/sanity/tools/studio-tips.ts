/**
 * Studio Tips
 *
 * Tips that rotate on the Studio dashboard to help editors discover features.
 * Each tip should be concise and actionable.
 *
 * To add a new tip:
 * 1. Add a new object to the STUDIO_TIPS array
 * 2. Include a clear description (what the feature does)
 * 3. Optionally add a keyboard shortcut
 */

export interface StudioTip {
  title: string;
  description: string;
  shortcut?: string;
}

export const STUDIO_TIPS: StudioTip[] = [
  {
    title: 'Command Palette',
    description: 'Quick access to all actions, documents, and tools',
    shortcut: '⌘K',
  },
  {
    title: 'Module Groups',
    description:
      'Modules are organized by type: Hero, Content, Marketing, Collections, and Utility',
  },
  {
    title: 'Live Preview',
    description: 'Edit and preview changes in real-time using the Visual Editor',
  },
  {
    title: 'Drafts First',
    description: 'All changes are saved as drafts until you explicitly publish them',
  },
  {
    title: 'Smart Slugs',
    description: 'URL slugs auto-generate from titles. Click "Generate" to refresh them',
  },
  {
    title: 'Collections Setup',
    description:
      'Create a page, add a frontpage module, then create posts that reference that page',
  },
  {
    title: 'Anchor Navigation',
    description: 'Use Anchor ID fields to create jump links between sections on the same page',
  },
  {
    title: 'Multilingual Content',
    description: 'Duplicate documents for Norwegian/English versions using the language selector',
  },
  {
    title: 'CTA Placement',
    description: 'Place call-to-action buttons in Hero and Marketing modules for lead capture',
  },
  {
    title: 'Module Order',
    description: 'Start with Hero, add content modules, then end with CTAs or contact forms',
  },
];
