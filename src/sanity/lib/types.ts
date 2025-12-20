/**
 * Sanity Schema Type Definitions
 * @version 1.0.0
 * @lastUpdated 2024-03-13
 */

import type { SanityDocument } from 'next-sanity';

// Base types
export interface SanityBase {
  _type: string;
  _id?: string;
  _rev?: string;
  _createdAt?: string;
  _updatedAt?: string;
}

export interface SanityReference {
  _ref: string;
  _type: 'reference';
  _weak?: boolean;
}

export interface SanityImage {
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

export interface MuxAsset {
  playbackId?: string;
  _ref?: string;
  _type?: string;
  status?: 'ready' | 'preparing' | 'errored';
}

export interface MuxVideo {
  asset?: MuxAsset;
  _type: 'mux.video';
}

// Document types
export interface Site extends SanityBase {
  _type: 'site';
  title: string;
  tagline?: any[];
  logo?: any;
}

export interface BlogPost extends SanityBase {
  _type: 'blog.post';
  body: any[];
  categories: SanityReference[];
  authors: SanityReference[];
  publishDate: string;
  featured?: boolean;
  metadata?: Metadata;
  relatedPosts?: SanityReference[];
}

// Object types
export interface Metadata {
  _type: 'metadata';
  title?: string;
  description?: string;
  keywords?: string[];
  image?: SanityImage;
  noIndex?: boolean;
  slug?: {
    _type: 'slug';
    current: string;
  };
}

export interface CTA {
  _type: 'cta';
  text?: string;
  linkType?: 'internal' | 'external';
  internalLink?: SanityDocument;
  externalLink?: string;
  style?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  icon?: any;
  newTab?: boolean;
  params?: string;
  tracking?: {
    eventName?: string;
    eventCategory?: string;
  };
}

export interface MenuItem {
  _type: 'menuItem';
  label?: string;
  internal?: SanityReference;
  external?: string;
  params?: Record<string, string>;
}

// Module types
export interface Hero extends SanityBase {
  _type: 'hero';
  pretitle?: string;
  content?: any[];
  ctas?: CTA[];
  assets?: SanityImage[];
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  layout?: 'default' | 'side-by-side';
  imagePosition?: 'left' | 'right';
  options?: ModuleOptions;
  sidebysidecontent?: any[];
  sideBySideTextAlign?: 'left' | 'center' | 'right';
}



export interface ModuleOptions {
  _type: 'module-options';
  background?: string;
  isFullWidth?: boolean;
}
