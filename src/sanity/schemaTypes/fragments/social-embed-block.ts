/**
 * Social Embed Block Fragment
 * @version 1.1.0
 * @lastUpdated 2026-01-02
 * @description A reusable social embed block for Portable Text arrays.
 * Supports X, LinkedIn, Instagram, Threads, TikTok, and YouTube.
 * @changelog
 * - 1.1.0: Removed Bluesky and Facebook support
 * - 1.0.0: Initial version with multi-platform support
 */

import { ShareIcon } from '@sanity/icons';
import { defineArrayMember } from 'sanity';

export default defineArrayMember({
  name: 'socialEmbed',
  type: 'socialEmbed',
  icon: ShareIcon,
});
