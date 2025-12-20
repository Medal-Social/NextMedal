// UI Components for Global items

import { notFound } from 'next/navigation';
import type { Locale } from 'next-intl';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { getComponentSchema } from '@/app/actions/get-component-schema';
import { ComponentPreview } from '@/components/component-preview/ComponentPreview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { routing } from '@/i18n/routing';
import { mockPost as robustMockPost } from '@/lib/mock-blog-post';
import BannerClient from '@/ui/Banner-client';
import DateDisplay from '@/ui/Date';
import Icon from '@/ui/Icon';
import { Img } from '@/ui/Img';
import Modules from '@/ui/modules';
import Breadcrumbs from '@/ui/modules/Breadcrumbs';
import Authors from '@/ui/modules/blog/Authors';
import Categories from '@/ui/modules/blog/Categories';
import ReadTime from '@/ui/modules/blog/ReadTime';
import Content from '@/ui/modules/RichtextModule/Content';

export const dynamic = 'force-static';

// --- Helpers ---

const pt = (text: string, style = 'normal') => ({
  _type: 'block',
  style,
  _key: Math.random().toString(36).substring(7),
  children: [
    {
      _type: 'span',
      _key: Math.random().toString(36).substring(7),
      text,
    },
  ],
});

const image = (url: string, alt: string, w = 800, h = 600) => ({
  _type: 'image',
  src: url,
  alt,
  width: w,
  height: h,
});

// --- Mock Data ---

const heroModule: Sanity.Module = {
  _type: 'hero',
  _key: 'hero1',
  pretitle: 'The Ultimate Next.js Starter',
  content: [
    pt('Ship your SaaS in days, not months.', 'h1'),
    pt(
      'Medal is the most advanced Next.js 15 template with Sanity Studio, Tailwind CSS, and TypeScript. Built for performance, SEO, and developer experience.'
    ),
  ],
  ctas: [
    { _type: 'cta', _key: 'c1', title: 'Get Started', link: { _type: 'menuItem', external: '#' } },
    {
      _type: 'cta',
      _key: 'c2',
      title: 'View Documentation',
      link: { _type: 'menuItem', external: '#' },
      style: 'outline',
    },
  ],
  bgImage: image(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    'Abstract background'
  ),
  textAlign: 'center',
  alignItems: 'center',
} as any;

const featuresModule: Sanity.Module = {
  _type: 'features',
  _key: 'fg1',
  pretitle: 'Batteries Included',
  intro: [pt('Everything you need to build world-class web applications.', 'h2')],
  items: [
    {
      _key: 'f1',
      summary: 'Next.js 15 (App Router)',
      content: [
        pt('Built on the latest React Server Components architecture with Turbopack support.'),
      ],
      icon: { ic0n: 'Zap' },
    },
    {
      _key: 'f2',
      summary: 'Sanity Studio',
      content: [pt('Embedded headless CMS with visual editing and live previews.')],
      icon: { ic0n: 'Edit' },
    },
    {
      _key: 'f3',
      summary: 'TypeScript',
      content: [pt('Fully typed codebase for better developer experience and fewer bugs.')],
      icon: { ic0n: 'FileCode' },
    },
    {
      _key: 'f4',
      summary: 'Tailwind CSS',
      content: [pt('Utility-first CSS framework with a custom design system and dark mode.')],
      icon: { ic0n: 'Palette' },
    },
    {
      _key: 'f5',
      summary: 'Framer Motion',
      content: [pt('Beautiful animations and layout transitions out of the box.')],
      icon: { ic0n: 'Sparkles' },
    },
    {
      _key: 'f6',
      summary: 'SEO Optimized',
      content: [pt('Perfect Lighthouse scores, dynamic sitemaps, and Open Graph generation.')],
      icon: { ic0n: 'BarChart' },
    },
  ],
} as any;

const logoCloudModule: Sanity.Module = {
  _type: 'logo-cloud',
  _key: 'logo1',
  content: [
    pt('Trusted by Industry Leaders', 'h3'),
    pt('Powering the next generation of web applications.'),
  ],
  logos: [
    {
      _key: 'l1',
      name: 'Vercel',
      link: 'https://vercel.com',
      image: { default: image('https://placehold.co/200x80/333333/ffffff?text=Vercel', 'Vercel') },
    },
    {
      _key: 'l2',
      name: 'Sanity',
      link: 'https://sanity.io',
      image: { default: image('https://placehold.co/200x80/333333/ffffff?text=Sanity', 'Sanity') },
    },
    {
      _key: 'l3',
      name: 'Stripe',
      link: 'https://stripe.com',
      image: { default: image('https://placehold.co/200x80/333333/ffffff?text=Stripe', 'Stripe') },
    },
    {
      _key: 'l4',
      name: 'OpenAI',
      link: 'https://openai.com',
      image: { default: image('https://placehold.co/200x80/333333/ffffff?text=OpenAI', 'OpenAI') },
    },
    {
      _key: 'l5',
      name: 'Linear',
      link: 'https://linear.app',
      image: { default: image('https://placehold.co/200x80/333333/ffffff?text=Linear', 'Linear') },
    },
    {
      _key: 'l6',
      name: 'Resend',
      link: 'https://resend.com',
      image: { default: image('https://placehold.co/200x80/333333/ffffff?text=Resend', 'Resend') },
    },
  ],
} as any;

const productComparisonModule: Sanity.Module = {
  _type: 'product-comparison',
  _key: 'comp1',
  pretitle: 'Why Choose Medal?',
  intro: [pt('Compare Medal against traditional development.', 'h2')],
  products: [
    { name: 'Traditional Dev', highlight: false, _key: 'p1' },
    { name: 'Medal Template', highlight: true, _key: 'p2' },
  ],
  features: [
    { name: 'Setup Time', featureDetails: ['2-4 Weeks', '5 Minutes'], _key: 'ft1' },
    { name: 'Visual Editing', featureDetails: ['false', 'true'], _key: 'ft2' },
    { name: 'SEO Score', featureDetails: ['Variable', '100/100'], _key: 'ft3' },
    { name: 'Dark Mode', featureDetails: ['Manual Setup', 'Built-in'], _key: 'ft4' },
    { name: 'Type Safety', featureDetails: ['Optional', 'Strict'], _key: 'ft5' },
    { name: 'Components', featureDetails: ['Build from scratch', '50+ Pre-built'], _key: 'ft6' },
  ],
} as any;

const pricingComparisonModule: Sanity.Module = {
  _type: 'pricing-comparison',
  _key: 'pc1',
  title: 'Detailed Feature Comparison',
  description: 'A deep dive into what is included in each plan.',
  tiers: [
    { name: 'Hobby', price: 'Free', _key: 't1' },
    { name: 'Pro', price: '$49', popular: true, _key: 't2' },
    { name: 'Enterprise', price: 'Custom', _key: 't3' },
  ],
  featureCategories: [
    {
      category: 'Core Features',
      _key: 'c1',
      items: [
        {
          name: 'Projects',
          _key: 'f1',
          tiers: [
            { type: 'string', title: '5' },
            { type: 'string', title: 'Unlimited' },
            { type: 'string', title: 'Unlimited' },
          ],
        },
        {
          name: 'Users',
          _key: 'f2',
          tiers: [
            { type: 'string', title: '1' },
            { type: 'string', title: '5' },
            { type: 'string', title: 'Unlimited' },
          ],
        },
      ],
    },
    {
      category: 'Support',
      _key: 'c2',
      items: [
        {
          name: 'Community Support',
          _key: 'f3',
          tiers: [
            { type: 'boolean', title: true },
            { type: 'boolean', title: true },
            { type: 'boolean', title: true },
          ],
        },
        {
          name: 'Priority Support',
          _key: 'f4',
          tiers: [
            { type: 'boolean', title: false },
            { type: 'boolean', title: true },
            { type: 'boolean', title: true },
          ],
        },
        {
          name: 'Dedicated Manager',
          _key: 'f5',
          tiers: [
            { type: 'boolean', title: false },
            { type: 'boolean', title: false },
            { type: 'boolean', title: true },
          ],
        },
      ],
    },
  ],
} as any;

const teamModuleGrid: Sanity.Module = {
  _type: 'team',
  _key: 'team1',
  layout: 'grid',
  pretitle: 'Meet the Team',
  intro: [pt('The experts behind the platform.', 'h2')],
  people: [
    {
      _key: 'p1',
      name: 'Alex Rivera',
      title: 'Lead Architect',
      image: image(
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop',
        'Alex Rivera'
      ),
      bio: [
        pt(
          'Ex-Google engineer with 10+ years of experience in distributed systems and React performance.',
          'normal'
        ),
      ],
      socialLinks: [
        { _key: 'sl1', platform: 'twitter', url: 'https://twitter.com' },
        { _key: 'sl2', platform: 'linkedin', url: 'https://linkedin.com' },
      ],
    },
    {
      _key: 'p2',
      name: 'Sarah Chen',
      title: 'Design Director',
      image: image(
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop',
        'Sarah Chen'
      ),
      bio: [
        pt(
          'Award-winning UI/UX designer obsessed with typography and micro-interactions.',
          'normal'
        ),
      ],
      socialLinks: [
        { _key: 'sl3', platform: 'twitter', url: 'https://twitter.com' },
        { _key: 'sl4', platform: 'instagram', url: 'https://instagram.com' },
      ],
    },
    {
      _key: 'p3',
      name: 'Michael Ross',
      title: 'Head of Product',
      image: image(
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop',
        'Michael Ross'
      ),
      bio: [
        pt('Product strategist ensuring we solve real problems for real developers.', 'normal'),
      ],
      socialLinks: [{ _key: 'sl5', platform: 'linkedin', url: 'https://linkedin.com' }],
    },
    {
      _key: 'p4',
      name: 'Emily Zhang',
      title: 'Developer Advocate',
      image: image(
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1000&auto=format&fit=crop',
        'Emily Zhang'
      ),
      bio: [
        pt(
          'Bridge between our engineering team and the community. Teaching best practices.',
          'normal'
        ),
      ],
      socialLinks: [
        { _key: 'sl6', platform: 'twitter', url: 'https://twitter.com' },
        { _key: 'sl7', platform: 'youtube', url: 'https://youtube.com' },
      ],
    },
  ],
} as any;

const teamModuleList: Sanity.Module = {
  ...teamModuleGrid,
  _key: 'team2',
  layout: 'split',
  pretitle: 'Leadership',
  intro: [pt('Board Members (Split Layout)', 'h2')],
} as any;

const pricingListModule: Sanity.Module = {
  _type: 'pricing-list',
  _key: 'price1',
  pretitle: 'Simple Pricing',
  intro: [pt('Choose the plan that fits your needs.', 'h2')],
  tiers: [
    {
      _id: 't1',
      title: 'Hobby',
      description: 'For personal projects',
      price: { base: '0', currency: '$', suffix: '/mo' },
      ctas: [
        {
          _type: 'cta',
          title: 'Start Free',
          link: { _type: 'menuItem', external: '#' },
          style: 'outline',
        },
      ],
      content: [pt('• 1 User\n• 5 Projects\n• Community Support')],
    },
    {
      _id: 't2',
      title: 'Pro',
      description: 'For growing teams',
      price: { base: '49', currency: '$', suffix: '/mo' },
      highlight: 'Most Popular',
      ctas: [{ _type: 'cta', title: 'Get Started', link: { _type: 'menuItem', external: '#' } }],
      content: [pt('• 5 Users\n• Unlimited Projects\n• Priority Support\n• Advanced Analytics')],
    },
    {
      _id: 't3',
      title: 'Enterprise',
      description: 'For large organizations',
      price: { base: '199', currency: '$', suffix: '/mo' },
      ctas: [
        {
          _type: 'cta',
          title: 'Contact Sales',
          link: { _type: 'menuItem', external: '#' },
          style: 'outline',
        },
      ],
      content: [pt('• Unlimited Users\n• SSO & SAML\n• Dedicated Success Manager\n• Custom SLAs')],
    },
  ],
} as any;

const accordionListModule: Sanity.Module = {
  _type: 'accordion-list',
  _key: 'acc1',
  pretitle: 'FAQ',
  intro: [pt('Frequently Asked Questions', 'h2')],
  items: [
    {
      _key: 'q1',
      summary: 'Is this template production ready?',
      content: [
        pt(
          'Yes, absolutely. We use this same stack for all our enterprise client projects. It includes production-grade configurations for security, SEO, and performance.'
        ),
      ],
    },
    {
      _key: 'q2',
      summary: 'How do I deploy this?',
      content: [
        pt(
          'We recommend Vercel for the frontend and Sanity for the content. The repo comes with a "Deploy to Vercel" button that sets everything up automatically.'
        ),
      ],
    },
    {
      _key: 'q3',
      summary: 'Can I use my own components?',
      content: [
        pt(
          'Of course. The system is modular. You can easily add, remove, or modify components in the `src/ui/modules` directory.'
        ),
      ],
    },
    {
      _key: 'q4',
      summary: 'Do you offer support?',
      content: [
        pt(
          'We offer community support via GitHub discussions and premium priority support for Pro and Enterprise customers.'
        ),
      ],
    },
    {
      _key: 'q5',
      summary: 'Is the design customizable?',
      content: [
        pt(
          'Yes, we use Tailwind CSS. You can change the entire look and feel by simply updating the `globals.css` theme variables or the Tailwind config.'
        ),
      ],
    },
  ],
} as any;

const calloutModule: Sanity.Module = {
  _type: 'callout',
  _key: 'call1',
  content: [
    pt('Ready to build your next big idea?', 'h2'),
    pt('Join thousands of developers using Medal to ship faster.'),
  ],
  ctas: [
    { _type: 'cta', title: 'Get Started Now', link: { _type: 'menuItem', external: '#' } },
    {
      _type: 'cta',
      title: 'Read the Docs',
      link: { _type: 'menuItem', external: '#' },
      style: 'outline',
    },
  ],
} as any;

const richtextModule: Sanity.Module = {
  _type: 'richtext',
  _key: 'rt1',
  content: [
    pt('The Future of Web Development', 'h2'),
    pt(
      'Web development has evolved rapidly over the last decade. From static HTML files to complex SPAs, and now to the era of Server Components and edge computing. Next.js 15 represents the pinnacle of this evolution.'
    ),
    pt('Why Server Components Matter', 'h3'),
    pt(
      'React Server Components (RSC) allow us to write UI that can be rendered and cached on the server. This reduces the amount of JavaScript sent to the client, improving initial page load times and Time to Interactive (TTI).'
    ),
    {
      _type: 'block',
      style: 'blockquote',
      children: [
        {
          _type: 'span',
          text: '"Server Components are the biggest shift in the React ecosystem since Hooks. They completely change how we think about data fetching and composition." - Industry Expert',
        },
      ],
    },
    pt(
      'Combined with Sanity CMS, you get the best of both worlds: a structured content lake for your data and a high-performance rendering engine for your UI. This architecture scales from personal blogs to massive e-commerce platforms without breaking a sweat.'
    ),
    {
      _type: 'block',
      style: 'normal',
      _key: 'link-block',
      children: [
        {
          _type: 'span',
          _key: 'span1',
          text: 'Check out the ',
        },
        {
          _type: 'span',
          _key: 'span2',
          marks: ['link1'],
          text: 'Sanity documentation',
        },
        {
          _type: 'span',
          _key: 'span3',
          text: ' for more information.',
        },
      ],
      markDefs: [
        {
          _key: 'link1',
          _type: 'link',
          href: 'https://www.sanity.io/docs',
        },
      ],
    },
  ],
} as any;

const videoHeroModule: Sanity.Module = {
  _type: 'videoHero',
  _key: 'vh1',
  title: 'Cinematic Experience',
  type: 'youtube',
  videoId: 'dQw4w9WgXcQ', // Placeholder
  thumbnail: image(
    'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=2000&auto=format&fit=crop',
    'Cinematic landscape'
  ),
} as any;

const breadcrumbsModule: Sanity.Module = {
  _type: 'breadcrumbs',
  _key: 'bc1',
  crumbs: [
    { _type: 'menuItem', _key: 'l1', label: 'Home', external: '/' },
    { _type: 'menuItem', _key: 'l2', label: 'Components', external: '#' },
    { _type: 'menuItem', _key: 'l3', label: 'Breadcrumbs', external: '#' },
  ],
} as any;

const componentGalleryModule: Sanity.Module = {
  _type: 'component-gallery',
  _key: 'cg1',
  intro: [
    pt('Component Gallery Demo', 'h2'),
    pt('This module itself can display other modules with filtering.'),
  ],
  groups: [
    {
      _key: 'g1',
      title: 'Demo Group',
      items: [
        { ...heroModule, _key: 'demo-hero' },
        { ...calloutModule, _key: 'demo-callout' },
      ],
    },
  ],
} as any;

const mockPosts: Sanity.BlogPost[] = [
  {
    _type: 'blog.post',
    _id: 'post1',
    featured: true,
    publishDate: '2023-01-01',
    metadata: {
      title: 'The Future of Next.js',
      description: 'Exploring the new features in Next.js 15.',
      slug: { current: 'nextjs-future' },
      image: image(
        'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=1000&auto=format&fit=crop',
        'Code'
      ),
    },
    categories: [{ title: 'Development', slug: { current: 'dev' } } as any],
    authors: [
      {
        name: 'Alex Rivera',
        image: image(
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop',
          'Alex'
        ),
      } as any,
    ],
  } as any,
  {
    _type: 'blog.post',
    _id: 'post2',
    featured: false,
    publishDate: '2023-02-15',
    metadata: {
      title: 'Mastering Tailwind CSS',
      description: 'Tips and tricks for building beautiful UIs.',
      slug: { current: 'tailwind-mastery' },
      image: image(
        'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1000&auto=format&fit=crop',
        'Design'
      ),
    },
    categories: [{ title: 'Design', slug: { current: 'design' } } as any],
    authors: [
      {
        name: 'Sarah Chen',
        image: image(
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop',
          'Sarah'
        ),
      } as any,
    ],
  } as any,
  {
    _type: 'blog.post',
    _id: 'post3',
    featured: false,
    publishDate: '2023-03-10',
    metadata: {
      title: 'Sanity Studio v3',
      description: 'A deep dive into the new studio structure.',
      slug: { current: 'sanity-v3' },
      image: image(
        'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=1000&auto=format&fit=crop',
        'Studio'
      ),
    },
    categories: [{ title: 'CMS', slug: { current: 'cms' } } as any],
    authors: [
      {
        name: 'Michael Ross',
        image: image(
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop',
          'Michael'
        ),
      } as any,
    ],
  } as any,
];

const blogFrontpageModule: Sanity.Module = {
  _type: 'blog-frontpage',
  _key: 'bf1',
  mainPost: 'featured',
  showFeaturedPostsFirst: true,
  itemsPerPage: 3,
  posts: mockPosts,
} as any;

const latestArticlesModule: Sanity.Module = {
  _type: 'latest-articles',
  _key: 'la1',
  pretitle: 'From the Blog',
  intro: [pt('Latest Updates', 'h2')],
  layout: 'grid',
  showFeaturedPostsFirst: true,
  displayFilters: true,
  limit: 3,
  posts: mockPosts,
} as any;

// Global Components Mock Data
const templateFeatures = [
  {
    category: 'Core Tech',
    items: [
      { title: 'Next.js 16', desc: 'Latest App Router, Server Components, Turbopack' },
      { title: 'React 19', desc: 'Bleeding edge React features' },
      { title: 'TypeScript', desc: 'End-to-end type safety' },
      { title: 'Tailwind CSS 4', desc: 'Modern utility-first styling' },
    ],
  },
  {
    category: 'Content & Media',
    items: [
      { title: 'Sanity CMS', desc: 'Visual editing, real-time collaboration' },
      { title: 'Mux Video', desc: 'High-performance video streaming' },
      { title: 'Next-Intl', desc: 'Built-in internationalization' },
      { title: 'Portable Text', desc: 'Structured content format' },
    ],
  },
  {
    category: 'UI & UX',
    items: [
      { title: 'Framer Motion', desc: 'Production-ready animations' },
      { title: 'Radix UI', desc: 'Accessible unstyled primitives' },
      { title: 'Dark Mode', desc: 'System-aware theme switching' },
      { title: 'Responsive', desc: 'Mobile-first design' },
    ],
  },
  {
    category: 'Quality & DX',
    items: [
      { title: 'Biome', desc: 'Fast linting and formatting' },
      { title: 'Vitest', desc: 'Unit and integration testing' },
      { title: 'SEO Ready', desc: 'Dynamic sitemaps, OG images' },
      { title: 'Accessibility', desc: 'WCAG 2.1 compliant' },
    ],
  },
];

const bannerData: Sanity.Banner & Sanity.Module = {
  _type: 'banner',
  _id: 'ann1',
  content: [pt('New: Next.js 15 Support is here!')],
  cta: { _type: 'menuItem', label: 'Learn More', external: '#' },
} as any;

const siteSettings: Sanity.Site = {
  _type: 'site',
  title: 'NextMedal',
  tagline: [pt('The ultimate starter kit')],
  logo: {
    _type: 'logo',
    image: {
      default: image('https://placehold.co/100x40/333333/ffffff?text=Medal', 'Logo'),
    },
    name: 'NextMedal',
  },
  headerMenu: {
    items: [
      { _type: 'menuItem', label: 'Features', external: '#features' },
      { _type: 'menuItem', label: 'Pricing', external: '#pricing' },
      { _type: 'menuItem', label: 'Blog', external: '#blog' },
    ],
  },
  footerMenu: {
    items: [
      { _type: 'menuItem', label: 'Terms', external: '#' },
      { _type: 'menuItem', label: 'Privacy', external: '#' },
    ],
  },
  ctas: [{ _type: 'cta', title: 'Get Started', link: { _type: 'menuItem', external: '#' } }],
  copyright: [pt('© 2024 NextMedal. All rights reserved.')],
  socialLinks: [
    { _key: 's1', text: 'Twitter', url: 'https://twitter.com' },
    { _key: 's2', text: 'GitHub', url: 'https://github.com' },
  ],
} as any;

const redirectData = {
  _type: 'redirect',
  source: '/old-path',
  destination: '/new-path',
  permanent: true,
} as any;

const navigationData = {
  _type: 'navigation',
  title: 'Main Navigation',
  items: [
    { _type: 'menuItem', label: 'Home', external: '/' },
    { _type: 'menuItem', label: 'About', external: '/about' },
    { _type: 'menuItem', label: 'Contact', external: '/contact' },
  ],
} as any;

const globalModuleData = {
  _type: 'global-module',
  path: '/blog/*',
  before: [
    {
      _type: 'banner',
      content: [pt('Global Blog Banner')],
      cta: { _type: 'menuItem', label: 'Subscribe', external: '#' },
    },
  ],
} as any;

const pricingData = {
  _type: 'pricing',
  title: 'Enterprise Tier',
  description: 'For large scale applications',
  price: { base: '999', currency: '$', suffix: '/mo' },
  ctas: [{ _type: 'cta', title: 'Contact Sales', link: { _type: 'menuItem', external: '#' } }],
  content: [pt('• Unlimited everything\n• 24/7 Support\n• Custom integrations')],
} as any;

const personData = {
  _type: 'person',
  name: 'Jane Doe',
  title: 'Senior Engineer',
  image: image(
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop',
    'Jane Doe'
  ),
  bio: [pt('Passionate about building scalable web applications.')],
  socialLinks: [{ _key: 'sl1', platform: 'twitter', url: 'https://twitter.com' }],
} as any;

const logoData = {
  _type: 'logo',
  name: 'Acme Corp',
  image: { default: image('https://placehold.co/200x80/333333/ffffff?text=Acme', 'Acme') },
} as any;

const mockModules = [
  breadcrumbsModule,
  heroModule,
  logoCloudModule,
  featuresModule,
  productComparisonModule,
  pricingComparisonModule,
  teamModuleGrid,
  teamModuleList,
  pricingListModule,
  accordionListModule,
  videoHeroModule,
  richtextModule,
  calloutModule,
  componentGalleryModule,
  blogFrontpageModule,
  latestArticlesModule,
];

type Props = {
  params: Promise<{ locale: Locale }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function AllComponentsPage({ params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // Fetch all schemas
  const modulesWithSchema = await Promise.all(
    mockModules.map(async (module) => {
      const { code, html, object } = await getComponentSchema(module._type);
      return {
        ...module,
        schemaCode: code,
        schemaHtml: html,
        schemaObject: object,
      };
    })
  );

  const bannerSchemaInfo = await getComponentSchema('banner');
  const bannerWithSchema = {
    ...bannerData,
    schemaCode: bannerSchemaInfo.code,
    schemaHtml: bannerSchemaInfo.html,
    schemaObject: bannerSchemaInfo.object,
  };

  const siteSchemaInfo = await getComponentSchema('site');
  const siteWithSchema = {
    ...siteSettings,
    schemaCode: siteSchemaInfo.code,
    schemaHtml: siteSchemaInfo.html,
    schemaObject: siteSchemaInfo.object,
  };

  const redirectSchemaInfo = await getComponentSchema('redirect');
  const redirectWithSchema = {
    ...redirectData,
    schemaCode: redirectSchemaInfo.code,
    schemaHtml: redirectSchemaInfo.html,
    schemaObject: redirectSchemaInfo.object,
  };

  const navigationSchemaInfo = await getComponentSchema('navigation');
  const navigationWithSchema = {
    ...navigationData,
    schemaCode: navigationSchemaInfo.code,
    schemaHtml: navigationSchemaInfo.html,
    schemaObject: navigationSchemaInfo.object,
  };

  const globalModuleSchemaInfo = await getComponentSchema('global-module');
  const globalModuleWithSchema = {
    ...globalModuleData,
    schemaCode: globalModuleSchemaInfo.code,
    schemaHtml: globalModuleSchemaInfo.html,
    schemaObject: globalModuleSchemaInfo.object,
  };

  const pricingSchemaInfo = await getComponentSchema('pricing');
  const pricingWithSchema = {
    ...pricingData,
    schemaCode: pricingSchemaInfo.code,
    schemaHtml: pricingSchemaInfo.html,
    schemaObject: pricingSchemaInfo.object,
  };

  const personSchemaInfo = await getComponentSchema('person');
  const personWithSchema = {
    ...personData,
    schemaCode: personSchemaInfo.code,
    schemaHtml: personSchemaInfo.html,
    schemaObject: personSchemaInfo.object,
  };

  const logoSchemaInfo = await getComponentSchema('logo');
  const logoWithSchema = {
    ...logoData,
    schemaCode: logoSchemaInfo.code,
    schemaHtml: logoSchemaInfo.html,
    schemaObject: logoSchemaInfo.object,
  };

  // Fetch Blog Post Schema
  const blogPostSchemaInfo = await getComponentSchema('blog.post');
  const blogPostWithSchema = {
    ...robustMockPost,
    schemaCode: blogPostSchemaInfo.code,
    schemaHtml: blogPostSchemaInfo.html,
    schemaObject: blogPostSchemaInfo.object,
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="py-24 text-center">
        <h1 className="text-4xl font-bold mb-4">Medal Component System</h1>
        <p className="text-muted-foreground text-lg">
          A comprehensive overview of all available modules with realistic mock data.
        </p>
      </div>

      <div className="flex flex-col gap-12 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Templates Section */}
        <div className="mb-12 border-b pb-12">
          <div className="mb-8 px-2">
            <h2 className="text-2xl font-bold mb-2">Page Templates</h2>
            <p className="text-muted-foreground">
              Full page layouts that combine multiple components and modules.
              <br />
              <a href="/blog/example-post" className="text-primary hover:underline font-medium">
                View standalone page →
              </a>
            </p>
          </div>

          <div className="flex flex-col gap-12">
            {/* Blog Post Template */}
            <section className="relative border rounded-lg overflow-hidden bg-background shadow-sm">
              <ComponentPreview
                moduleType="blog.post (Page Template)"
                schemaCode={blogPostWithSchema.schemaCode}
                schemaHtml={blogPostWithSchema.schemaHtml}
                schemaObject={blogPostWithSchema.schemaObject}
              >
                <div className="bg-background">
                  {/* Simulate Page Layout */}
                  <article className="section space-y-8 md:space-y-12 py-12 md:py-24">
                    <div className="container max-w-4xl mx-auto px-4 space-y-8">
                      <Breadcrumbs
                        crumbs={[
                          {
                            label: 'Blog',
                            internal: {
                              _type: 'page',
                              metadata: { slug: { current: 'blog' }, title: 'Blog' },
                            },
                          } as any,
                        ]}
                        currentPage={robustMockPost as any}
                      />

                      <div className="space-y-6">
                        <Categories categories={robustMockPost.categories as any} linked badge />

                        <h1 className="text-4xl md:text-6xl font-bold">
                          {robustMockPost.metadata.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                          <DateDisplay value={robustMockPost.publishDate} />
                          {robustMockPost.readTime && <ReadTime value={robustMockPost.readTime} />}
                        </div>

                        <Authors authors={robustMockPost.authors as any} bio socialLinks />
                      </div>

                      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
                        <Img
                          image={robustMockPost.metadata.image}
                          className="object-cover w-full h-full"
                          sizes="(max-width: 768px) 100vw, 900px"
                          priority
                          alt={robustMockPost.metadata.title || ''}
                        />
                      </div>

                      <div className="grid gap-12 lg:grid-cols-[1fr,250px]">
                        <Content value={robustMockPost.body} />

                        <div className="hidden lg:block space-y-8">
                          <div className="rounded-lg border p-6 bg-muted/30">
                            <h4 className="font-bold mb-2">Table of Contents</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              <li>1. Shift to Server Components</li>
                              <li>Key Benefits</li>
                              <li>Implementation Strategy</li>
                              <li>2. Advanced Formatting</li>
                              <li>3. Integrated Modules</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Render any modules attached to the post */}
                      {robustMockPost.modules && <Modules modules={robustMockPost.modules} />}
                    </div>
                  </article>
                </div>
              </ComponentPreview>
            </section>
          </div>
        </div>

        {/* Template Features Section */}
        <div className="mb-12 border-b pb-12">
          <div className="mb-8 px-2">
            <h2 className="text-2xl font-bold mb-2">Template Features</h2>
            <p className="text-muted-foreground">
              A complete list of features included in the NextMedal template.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templateFeatures.map((group, i) => (
              <div key={i} className="space-y-4">
                <h3 className="font-bold text-lg text-primary">{group.category}</h3>
                <ul className="space-y-3">
                  {group.items.map((item, j) => (
                    <li key={j} className="bg-card border rounded-lg p-4 shadow-sm">
                      <div className="font-semibold mb-1">{item.title}</div>
                      <div className="text-sm text-muted-foreground">{item.desc}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Design System Section */}
        <div className="mb-12 border-b pb-12">
          <div className="mb-8 px-2">
            <h2 className="text-2xl font-bold mb-2">Design System</h2>
            <p className="text-muted-foreground">
              The foundational elements of the template's visual language.
            </p>
          </div>

          <div className="flex flex-col gap-12">
            {/* Colors */}
            <section className="relative border rounded-lg overflow-hidden bg-background shadow-sm p-8">
              <h3 className="font-bold mb-4">Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <div className="h-20 w-full rounded bg-primary shadow-sm"></div>
                  <div className="text-xs font-mono">Primary</div>
                </div>
                <div className="space-y-2">
                  <div className="h-20 w-full rounded bg-secondary shadow-sm"></div>
                  <div className="text-xs font-mono">Secondary</div>
                </div>
                <div className="space-y-2">
                  <div className="h-20 w-full rounded bg-accent shadow-sm"></div>
                  <div className="text-xs font-mono">Accent</div>
                </div>
                <div className="space-y-2">
                  <div className="h-20 w-full rounded bg-muted shadow-sm"></div>
                  <div className="text-xs font-mono">Muted</div>
                </div>
                <div className="space-y-2">
                  <div className="h-20 w-full rounded bg-destructive shadow-sm"></div>
                  <div className="text-xs font-mono">Destructive</div>
                </div>
                <div className="space-y-2">
                  <div className="h-20 w-full rounded bg-background border shadow-sm"></div>
                  <div className="text-xs font-mono">Background</div>
                </div>
              </div>
            </section>

            {/* Typography */}
            <section className="relative border rounded-lg overflow-hidden bg-background shadow-sm p-8">
              <h3 className="font-bold mb-6">Typography</h3>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-baseline">
                  <span className="text-muted-foreground font-mono text-xs">Heading 1</span>
                  <h1 className="col-span-2 text-4xl font-bold tracking-tight">
                    The quick brown fox
                  </h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-baseline">
                  <span className="text-muted-foreground font-mono text-xs">Heading 2</span>
                  <h2 className="col-span-2 text-3xl font-bold tracking-tight">
                    Jumps over the lazy dog
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-baseline">
                  <span className="text-muted-foreground font-mono text-xs">Heading 3</span>
                  <h3 className="col-span-2 text-2xl font-bold tracking-tight">
                    Pack my box with five dozen liquor jugs
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-baseline">
                  <span className="text-muted-foreground font-mono text-xs">Body</span>
                  <p className="col-span-2 text-base leading-relaxed text-muted-foreground">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                    nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-baseline">
                  <span className="text-muted-foreground font-mono text-xs">Small</span>
                  <p className="col-span-2 text-sm font-medium leading-none">
                    The quick brown fox jumps over the lazy dog.
                  </p>
                </div>
              </div>
            </section>

            {/* UI Elements */}
            <section className="relative border rounded-lg overflow-hidden bg-background shadow-sm p-8">
              <h3 className="font-bold mb-6">UI Elements</h3>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <span className="text-muted-foreground font-mono text-xs">Buttons</span>
                  <div className="col-span-2 flex flex-wrap gap-4">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <span className="text-muted-foreground font-mono text-xs">Badges</span>
                  <div className="col-span-2 flex flex-wrap gap-4">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <span className="text-muted-foreground font-mono text-xs">Forms</span>
                  <div className="col-span-2 space-y-4 max-w-sm">
                    <Input placeholder="Input field..." />
                    <div className="flex items-center gap-2">
                      <Switch id="demo-switch" />
                      <label htmlFor="demo-switch" className="text-sm">
                        Toggle Switch
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Media & Icons */}
            <section className="relative border rounded-lg overflow-hidden bg-background shadow-sm p-8">
              <h3 className="font-bold mb-6">Media & Icons</h3>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <span className="text-muted-foreground font-mono text-xs">Icons (Lucide)</span>
                  <div className="col-span-2 flex flex-wrap gap-6 text-foreground/80">
                    <Icon icon={{ _type: 'icon', ic0n: 'Home' }} size={24} />
                    <Icon icon={{ _type: 'icon', ic0n: 'User' }} size={24} />
                    <Icon icon={{ _type: 'icon', ic0n: 'Settings' }} size={24} />
                    <Icon icon={{ _type: 'icon', ic0n: 'Search' }} size={24} />
                    <Icon icon={{ _type: 'icon', ic0n: 'Menu' }} size={24} />
                    <Icon icon={{ _type: 'icon', ic0n: 'ArrowRight' }} size={24} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <span className="text-muted-foreground font-mono text-xs">Image Component</span>
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="aspect-video relative rounded-lg overflow-hidden border">
                        <Img
                          image={image(
                            'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
                            'Gradient'
                          )}
                          className="object-cover w-full h-full"
                          width={400}
                          height={225}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">Aspect Video</div>
                    </div>
                    <div className="space-y-2">
                      <div className="aspect-square relative rounded-lg overflow-hidden border">
                        <Img
                          image={image(
                            'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80',
                            'Abstract'
                          )}
                          className="object-cover w-full h-full"
                          width={400}
                          height={400}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">Aspect Square</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Data Visualization Section */}
        <div className="mb-12 border-b pb-12">
          <div className="mb-8 px-2">
            <h2 className="text-2xl font-bold mb-2">Data Visualization</h2>
            <p className="text-muted-foreground">
              Examples of data-heavy displays using the Geist Mono font.
            </p>
          </div>

          <div className="flex flex-col gap-12">
            {/* KPI Cards */}
            <section className="relative border rounded-lg overflow-hidden bg-background shadow-sm p-8">
              <h3 className="font-bold mb-6">KPI Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 border rounded-lg bg-card">
                  <div className="text-sm text-muted-foreground mb-2">Total Revenue</div>
                  <div className="text-3xl font-bold font-numeric">$124,592.00</div>
                  <div className="text-xs text-green-600 mt-1 font-numeric flex items-center">
                    +12.5%{' '}
                    <span className="text-muted-foreground ml-1 font-sans">vs last month</span>
                  </div>
                </div>
                <div className="p-6 border rounded-lg bg-card">
                  <div className="text-sm text-muted-foreground mb-2">Active Users</div>
                  <div className="text-3xl font-bold font-numeric">8,549</div>
                  <div className="text-xs text-green-600 mt-1 font-numeric flex items-center">
                    +5.2%{' '}
                    <span className="text-muted-foreground ml-1 font-sans">vs last month</span>
                  </div>
                </div>
                <div className="p-6 border rounded-lg bg-card">
                  <div className="text-sm text-muted-foreground mb-2">Avg. Response Time</div>
                  <div className="text-3xl font-bold font-numeric">245ms</div>
                  <div className="text-xs text-red-600 mt-1 font-numeric flex items-center">
                    -1.4%{' '}
                    <span className="text-muted-foreground ml-1 font-sans">vs last month</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Financial Table */}
            <section className="relative border rounded-lg overflow-hidden bg-background shadow-sm p-8">
              <h3 className="font-bold mb-6">Financial Data Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-muted-foreground font-medium border-b">
                    <tr>
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-3 px-4">#TRX-8859</td>
                      <td className="py-3 px-4">2023-12-01</td>
                      <td className="py-3 px-4">Cloud Services</td>
                      <td className="py-3 px-4 text-right">$1,299.00</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Paid
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">#TRX-8860</td>
                      <td className="py-3 px-4">2023-12-02</td>
                      <td className="py-3 px-4">Software License</td>
                      <td className="py-3 px-4 text-right">$49.99</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          Pending
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">#TRX-8861</td>
                      <td className="py-3 px-4">2023-12-03</td>
                      <td className="py-3 px-4">Hosting</td>
                      <td className="py-3 px-4 text-right">$250.50</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Paid
                        </span>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="border-t bg-muted/20 font-medium">
                    <tr>
                      <td colSpan={3} className="py-3 px-4">
                        Total
                      </td>
                      <td className="py-3 px-4 text-right">$1,599.49</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          </div>
        </div>

        {/* Global Components Section */}
        <div className="mb-12 border-b pb-12">
          <div className="mb-8 px-2">
            <h2 className="text-2xl font-bold mb-2">Global Settings</h2>
            <p className="text-muted-foreground">
              Site-wide configuration including navigation, footer, and banners.
            </p>
          </div>

          <div className="flex flex-col gap-12">
            {/* Banner */}
            <section className="relative border rounded-lg overflow-hidden bg-background shadow-sm">
              <ComponentPreview
                moduleType="banner"
                schemaCode={bannerWithSchema.schemaCode}
                schemaHtml={bannerWithSchema.schemaHtml}
                schemaObject={bannerWithSchema.schemaObject}
              >
                <div className="p-4 bg-muted/10">
                  <BannerClient banner={bannerData} />
                </div>
              </ComponentPreview>
            </section>

            {/* Header & Footer (using Site settings) */}
            <section className="relative border rounded-lg overflow-hidden bg-background shadow-sm">
              <ComponentPreview
                moduleType="site (Header & Footer)"
                schemaCode={siteWithSchema.schemaCode}
                schemaHtml={siteWithSchema.schemaHtml}
                schemaObject={siteWithSchema.schemaObject}
              >
                <div className="flex flex-col min-h-[400px]">
                  {/* Mock Header */}
                  <header className="border-b p-4 flex items-center justify-between">
                    <div className="font-bold text-xl">NextMedal</div>
                    <nav className="flex gap-4">
                      {siteSettings.headerMenu?.items?.map((item: any, i: number) => (
                        <span key={i} className="text-sm font-medium">
                          {item.label}
                        </span>
                      ))}
                    </nav>
                    <div className="flex gap-2">
                      {siteSettings.ctas?.map((cta: any, i: number) => (
                        <button
                          type="button"
                          key={i}
                          className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm"
                        >
                          {cta.title}
                        </button>
                      ))}
                    </div>
                  </header>

                  <main className="flex-1 p-8 text-center text-muted-foreground flex items-center justify-center bg-muted/5">
                    <div className="border border-dashed p-8 rounded-lg">
                      Page Content Placeholder
                    </div>
                  </main>

                  {/* Mock Footer */}
                  <footer className="border-t p-8 bg-muted/5">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div>
                        <div className="font-bold mb-4">NextMedal</div>
                        <p className="text-sm text-muted-foreground">The ultimate starter kit</p>
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex gap-4">
                          {siteSettings.footerMenu?.items?.map((item: any, i: number) => (
                            <span
                              key={i}
                              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              {item.label}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        © 2024 NextMedal. All rights reserved.
                      </div>
                    </div>
                  </footer>
                </div>
              </ComponentPreview>
            </section>
          </div>
        </div>

        {/* System Configuration Section */}
        <div className="mb-12 border-b pb-12">
          <div className="mb-8 px-2">
            <h2 className="text-2xl font-bold mb-2">System Configuration</h2>
            <p className="text-muted-foreground">
              Technical settings for routing, navigation structures, and global rules.
            </p>
          </div>
          <div className="flex flex-col gap-12">
            {/* Redirect */}
            <section className="relative border rounded-lg overflow-hidden bg-background shadow-sm">
              <ComponentPreview
                moduleType="redirect"
                schemaCode={redirectWithSchema.schemaCode}
                schemaHtml={redirectWithSchema.schemaHtml}
                schemaObject={redirectWithSchema.schemaObject}
              >
                <div className="p-8 bg-muted/10 flex flex-col items-center justify-center text-center">
                  <div className="bg-background border p-6 rounded-lg shadow-sm max-w-md w-full">
                    <div className="font-mono text-sm mb-4 bg-muted p-2 rounded">
                      {redirectData.source} → {redirectData.destination}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Type: {redirectData.permanent ? 'Permanent (308)' : 'Temporary (307)'}
                    </div>
                  </div>
                </div>
              </ComponentPreview>
            </section>

            {/* Navigation */}
            <section className="relative border rounded-lg overflow-hidden bg-background shadow-sm">
              <ComponentPreview
                moduleType="navigation"
                schemaCode={navigationWithSchema.schemaCode}
                schemaHtml={navigationWithSchema.schemaHtml}
                schemaObject={navigationWithSchema.schemaObject}
              >
                <div className="p-8 bg-muted/10 flex flex-col items-center justify-center">
                  <div className="bg-background border p-6 rounded-lg shadow-sm w-full max-w-lg">
                    <h3 className="font-bold mb-4 border-b pb-2">{navigationData.title}</h3>
                    <ul className="space-y-2">
                      {navigationData.items.map((item: any, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 rounded-full bg-primary/50"></span>
                          {item.label}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {item.external}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ComponentPreview>
            </section>

            {/* Global Module */}
            <section className="relative border rounded-lg overflow-hidden bg-background shadow-sm">
              <ComponentPreview
                moduleType="global-module"
                schemaCode={globalModuleWithSchema.schemaCode}
                schemaHtml={globalModuleWithSchema.schemaHtml}
                schemaObject={globalModuleWithSchema.schemaObject}
              >
                <div className="p-8 bg-muted/10">
                  <div className="bg-background border rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-muted px-4 py-2 border-b text-xs font-mono flex gap-2">
                      <span className="font-bold">Rule:</span>
                      <span>Path matches {globalModuleData.path}</span>
                    </div>
                    <div className="p-4 border-b bg-primary/5 text-center text-sm py-2">
                      (Global Module Injection Point: Before Content)
                    </div>
                    <div className="p-8 text-center text-muted-foreground border-b border-dashed">
                      Page Content...
                    </div>
                  </div>
                </div>
              </ComponentPreview>
            </section>
          </div>
        </div>

        {/* Content Types Section */}
        <div className="mb-12 border-b pb-12">
          <div className="mb-8 px-2">
            <h2 className="text-2xl font-bold mb-2">Content Assets</h2>
            <p className="text-muted-foreground">
              Reusable content items referenced by other modules.
            </p>
          </div>
          <div className="flex flex-col gap-12">
            {/* Pricing Tier */}
            <section className="relative border rounded-lg overflow-hidden bg-background shadow-sm">
              <ComponentPreview
                moduleType="pricing"
                schemaCode={pricingWithSchema.schemaCode}
                schemaHtml={pricingWithSchema.schemaHtml}
                schemaObject={pricingWithSchema.schemaObject}
              >
                <div className="p-8 bg-muted/10 flex justify-center">
                  <div className="bg-background border rounded-lg shadow-sm p-6 w-full max-w-sm">
                    <div className="text-xl font-bold mb-2">{pricingData.title}</div>
                    <div className="text-3xl font-bold mb-4">
                      {pricingData.price.currency}
                      {pricingData.price.base}
                      <span className="text-base font-normal text-muted-foreground">
                        {pricingData.price.suffix}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="w-full bg-primary text-primary-foreground py-2 rounded mb-4"
                    >
                      {pricingData.ctas[0].title}
                    </button>
                    <div className="text-sm text-muted-foreground">
                      {pricingData.content[0].children[0].text}
                    </div>
                  </div>
                </div>
              </ComponentPreview>
            </section>

            {/* Person */}
            <section className="relative border rounded-lg overflow-hidden bg-background shadow-sm">
              <ComponentPreview
                moduleType="person"
                schemaCode={personWithSchema.schemaCode}
                schemaHtml={personWithSchema.schemaHtml}
                schemaObject={personWithSchema.schemaObject}
              >
                <div className="p-8 bg-muted/10 flex justify-center">
                  <div className="bg-background border rounded-lg shadow-sm p-6 w-full max-w-xs text-center">
                    <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 overflow-hidden relative">
                      {/* Using a placeholder since we can't easily render the helper image function output without the helper context, 
                              but actually we used the helper function in mock data so we can try to render it if we extract the src */}
                      <Img
                        image={personData.image}
                        alt={personData.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-lg">{personData.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{personData.title}</p>
                    <p className="text-sm mb-4">{personData.bio[0].children[0].text}</p>
                  </div>
                </div>
              </ComponentPreview>
            </section>

            {/* Logo */}
            <section className="relative border rounded-lg overflow-hidden bg-background shadow-sm">
              <ComponentPreview
                moduleType="logo"
                schemaCode={logoWithSchema.schemaCode}
                schemaHtml={logoWithSchema.schemaHtml}
                schemaObject={logoWithSchema.schemaObject}
              >
                <div className="p-8 bg-muted/10 flex justify-center">
                  <div className="bg-background border p-8 rounded-lg shadow-sm">
                    <Img
                      image={logoData.image.default}
                      alt={logoData.name}
                      className="h-12 w-auto object-contain"
                    />
                    <p className="text-center text-xs text-muted-foreground mt-2">
                      {logoData.name}
                    </p>
                  </div>
                </div>
              </ComponentPreview>
            </section>
          </div>
        </div>

        {/* Modules Section */}
        <div>
          <div className="mb-8 px-2">
            <h2 className="text-2xl font-bold mb-2">Page Modules</h2>
            <p className="text-muted-foreground">Visual building blocks used to construct pages.</p>
          </div>
          <div className="flex flex-col gap-12">
            {modulesWithSchema.map((item) => (
              <section
                key={item._key}
                className="relative border rounded-lg overflow-hidden bg-background shadow-sm"
              >
                <ComponentPreview
                  moduleType={item._type}
                  schemaCode={item.schemaCode}
                  schemaHtml={item.schemaHtml}
                  schemaObject={item.schemaObject}
                  hasRegistry={true}
                >
                  <Modules modules={[item]} />
                </ComponentPreview>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
