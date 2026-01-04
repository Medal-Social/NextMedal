/**
 * Static Data for Dashboard
 *
 * Centralized data configuration for dashboard quick actions and social links.
 */

import {
  AddUserIcon,
  BookIcon,
  CogIcon,
  DatabaseIcon,
  DocumentsIcon,
  EyeOpenIcon,
  PlayIcon,
  StackCompactIcon,
} from '@sanity/icons';
import type { ComponentType } from 'react';
import { IconGithub, IconLinkedinIn, IconTwitterX } from '@/components/icons/social-icons';

export interface QuickAction {
  title: string;
  description: string;
  icon: ComponentType;
  type: 'internal' | 'external';
  path?: string;
  href?: string;
}

export interface SocialLink {
  href: string;
  icon: ComponentType;
  label: string;
}

/**
 * Quick access actions for the dashboard
 * @param projectId - The Sanity project ID for external manage URL
 */
export function getQuickActions(projectId: string): QuickAction[] {
  return [
    {
      title: 'Visual Editor',
      description: 'Edit with live preview',
      path: '/studio/editor',
      icon: EyeOpenIcon,
      type: 'internal',
    },
    {
      title: 'Content Library',
      description: 'Browse all documents',
      path: '/studio/structure',
      icon: DatabaseIcon,
      type: 'internal',
    },
    {
      title: 'Pages',
      description: 'Manage pages',
      path: '/studio/structure/page',
      icon: DocumentsIcon,
      type: 'internal',
    },
    {
      title: 'Collections',
      description: 'Articles, docs & more',
      path: '/studio/structure/collections',
      icon: StackCompactIcon,
      type: 'internal',
    },
    {
      title: 'Settings',
      description: 'Site config',
      path: '/studio/structure/site',
      icon: CogIcon,
      type: 'internal',
    },
    {
      title: 'Collaborate',
      description: 'Invite your team',
      href: `https://www.sanity.io/manage/project/${projectId}/members`,
      icon: AddUserIcon,
      type: 'external',
    },
    {
      title: 'Docs',
      description: 'Guides & Refs',
      href: 'https://www.nextmedal.com',
      icon: BookIcon,
      type: 'external',
    },
    {
      title: 'Videos',
      description: 'Tutorials',
      href: 'https://youtube.com/@medalsocial',
      icon: PlayIcon,
      type: 'external',
    },
  ];
}

/**
 * Social media links for the dashboard footer
 */
export const SOCIAL_LINKS: readonly SocialLink[] = [
  { href: 'https://github.com/Medal-Social', icon: IconGithub, label: 'GitHub' },
  { href: 'https://x.com/medalsocial', icon: IconTwitterX, label: 'X (Twitter)' },
  { href: 'https://linkedin.com/company/medalsocial', icon: IconLinkedinIn, label: 'LinkedIn' },
] as const;
