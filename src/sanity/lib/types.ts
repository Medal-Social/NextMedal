/**
 * Sanity Schema Type Definitions
 * @version 1.0.1
 * @lastUpdated 2025-12-31
 */

import type { SanityDocument } from 'next-sanity';

// Base types (internal)
interface SanityBase {
  _type: string;
  _id?: string;
  _key: string;
  _rev?: string;
  _createdAt?: string;
  _updatedAt?: string;
}

interface SanityReference {
  _ref: string;
  _type: 'reference';
  _weak?: boolean;
}

interface SanityImage {
  _type: 'image';
  asset: SanityReference;
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
  alt?: string;
}

interface MuxAsset {
  playbackId?: string;
  _ref?: string;
  _type?: string;
  status?: 'ready' | 'preparing' | 'errored';
}

interface MuxVideo {
  asset?: MuxAsset;
  _type: 'mux.video';
}

interface PortableTextBlock {
  _type: 'block';
  _key: string;
  children: Array<{ _type: string; _key: string; text?: string }>;
  style?: string;
  markDefs?: Array<{ _type: string; _key: string }>;
}

interface CTA {
  _type: 'cta';
  text?: string;
  linkType?: 'internal' | 'external';
  internalLink?: SanityDocument;
  externalLink?: string;
  style?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  icon?: string;
  newTab?: boolean;
  params?: string;
  tracking?: {
    eventName?: string;
    eventCategory?: string;
  };
}

interface ModuleOptions {
  _type: 'module-options';
  background?: string;
  isFullWidth?: boolean;
  anchorId?: string;
}

// Module types (internal)
interface HeroModule extends SanityBase {
  _type: 'hero';
  content?: PortableTextBlock[];
  ctas?: CTA[];
  videoType?: 'image' | 'mux' | 'youtube';
  image?: { image: SanityImage };
  muxVideo?: MuxVideo;
  videoUrl?: string;
  assets?: SanityImage[];
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  layout?: 'default' | 'side-by-side';
  imagePosition?: 'left' | 'right';
  options?: ModuleOptions;
  sidebysidecontent?: PortableTextBlock[];
  sideBySideTextAlign?: 'left' | 'center' | 'right';
}

// Exported types
export type Module = HeroModule;
