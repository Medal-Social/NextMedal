// UI Components for Global items

import { notFound } from 'next/navigation';
import type { Locale } from 'next-intl';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { getComponentSchema } from '@/app/actions/get-component-schema';
import { ComponentPreview } from '@/components/component-preview/ComponentPreview';
import { routing } from '@/i18n/routing';
import BannerClient from '@/ui/Banner-client';
import { Img } from '@/ui/Img';
import Modules from '@/ui/modules';

export const dynamic = 'force-static';

// --- Helpers ---

const pt = (text: string, style = 'normal') => ({
  _type: 'block',
  style,
  _key: Math.random().toString(36).substring(7),
  markDefs: [],
  children: [
    {
      _type: 'span',
      _key: Math.random().toString(36).substring(7),
      text,
      marks: [],
    },
  ],
});

const image = (url: string, alt: string) => ({
  _type: 'image',
  asset: {
    _type: 'reference',
    _ref: 'image-0000000000000000000000000000000000000000-0x0-jpg',
  },
  // Frontend-only props for preview
  src: url,
  alt,
});

const img = (url: string, alt: string) => ({
  _type: 'img',
  image: image(url, alt),
});

const menuItem = (label: string, external?: string) => ({
  _type: 'menuItem',
  type: 'external',
  label,
  external: external || '#',
});

const cta = (label: string, style = 'primary', external?: string) => ({
  _type: 'cta',
  link: menuItem(label, external),
  style,
});

// --- Mock Data ---

const heroModule: Sanity.Module = {
  _type: 'hero',
  _key: 'hero1',
  content: [
    pt('Ship your SaaS in days, not months.', 'h1'),
    pt(
      'Medal is the most advanced Next.js 15 template with Sanity Studio, Tailwind CSS, and TypeScript. Built for performance, SEO, and developer experience.'
    ),
  ],
  ctas: [
    { ...cta('Get Started'), _key: 'c1' },
    { ...cta('View Documentation', 'outline'), _key: 'c2' },
  ],
  videoType: 'image',
  image: img(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    'Abstract background'
  ),
  options: {
    bgFrom: 'brand-vibrant',
    bgTo: 'brand-purple',
  },
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
      icon: { ic0n: 'Zap', _type: 'icon' },
    },
    {
      _key: 'f2',
      summary: 'Sanity Studio',
      content: [pt('Embedded headless CMS with visual editing and live previews.')],
      icon: { ic0n: 'Edit', _type: 'icon' },
    },
    {
      _key: 'f3',
      summary: 'TypeScript',
      content: [pt('Fully typed codebase for better developer experience and fewer bugs.')],
      icon: { ic0n: 'FileCode', _type: 'icon' },
    },
    {
      _key: 'f4',
      summary: 'Tailwind CSS',
      content: [pt('Utility-first CSS framework with a custom design system and dark mode.')],
      icon: { ic0n: 'Palette', _type: 'icon' },
    },
    {
      _key: 'f5',
      summary: 'Framer Motion',
      content: [pt('Beautiful animations and layout transitions out of the box.')],
      icon: { ic0n: 'Sparkles', _type: 'icon' },
    },
    {
      _key: 'f6',
      summary: 'SEO Optimized',
      content: [pt('Perfect Lighthouse scores, dynamic sitemaps, and Open Graph generation.')],
      icon: { ic0n: 'BarChart', _type: 'icon' },
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

const metalSocialComparisonModule: Sanity.Module = {
  _type: 'product-comparison',
  _key: 'metal-social-comp',
  intro: [
    pt('Supercharge with Metal Social', 'h2'),
    pt(
      'Metal Social delivers enterprise-grade capabilities to your Next Medal template.',
      'normal'
    ),
  ],
  products: [
    { name: 'Self-hosted', highlight: false, _key: 'p1' },
    { name: 'Metal Social Managed', highlight: true, _key: 'p2' },
  ],
  features: [
    {
      name: 'Account Manager',
      featureDetails: ['None / DIY Support', 'Dedicated Success Manager'],
      _key: 'ft1',
    },
    {
      name: 'SLA / Uptime Guarantee',
      featureDetails: ['None', '99.9% Uptime Guarantee'],
      _key: 'ft2',
    },
    {
      name: 'Marketing Tools',
      featureDetails: ['Standard', 'Advanced Suite'],
      _key: 'ft3',
    },
    {
      name: 'Privacy and Compliance',
      featureDetails: ['Standard (GDPR)', 'Enterprise (SOC2, HIPAA)'],
      _key: 'ft4',
    },
    {
      name: 'Marketing Automation',
      featureDetails: ['None', 'Full Automation Workflows'],
      _key: 'ft5',
    },
    {
      name: 'AI Brand Understanding',
      featureDetails: ['Basic', 'Custom Brand Model'],
      _key: 'ft6',
    },
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
  intro: [pt('Meet the Team', 'h2'), pt('The experts behind the platform.', 'normal')],
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
  intro: [pt('Leadership', 'h2'), pt('Board Members (Split Layout)', 'normal')],
} as any;

const pricingListModule: Sanity.Module = {
  _type: 'pricing-list',
  _key: 'price1',
  intro: [pt('Simple Pricing', 'h2'), pt('Choose the plan that fits your needs.', 'normal')],
  tiers: [
    {
      _id: 't1',
      title: 'Hobby',
      description: 'For personal projects',
      price: { base: '0', currency: '$', suffix: '/mo' },
      ctas: [cta('Start Free', 'outline')],
      content: [pt('• 1 User\n• 5 Projects\n• Community Support')],
    },
    {
      _id: 't2',
      title: 'Pro',
      description: 'For growing teams',
      price: { base: '49', currency: '$', suffix: '/mo' },
      highlight: 'Most Popular',
      ctas: [cta('Get Started')],
      content: [pt('• 5 Users\n• Unlimited Projects\n• Priority Support\n• Advanced Analytics')],
    },
    {
      _id: 't3',
      title: 'Enterprise',
      description: 'For large organizations',
      price: { base: '199', currency: '$', suffix: '/mo' },
      ctas: [cta('Contact Sales', 'outline')],
      content: [pt('• Unlimited Users\n• SSO & SAML\n• Dedicated Success Manager\n• Custom SLAs')],
    },
  ],
} as any;

const accordionListModule: Sanity.Module = {
  _type: 'accordion-list',
  _key: 'acc1',
  intro: [pt('FAQ', 'h2'), pt('Frequently Asked Questions', 'normal')],
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
    cta('Get Started Now'),
    cta('Read the Docs', 'outline'),
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
    { ...menuItem('Home', '/'), _key: 'l1', type: 'external' },
    { ...menuItem('Components', '#'), _key: 'l2', type: 'external' },
    { ...menuItem('Breadcrumbs', '#'), _key: 'l3', type: 'external' },
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
    featured: 'featured',
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
    featured: 'standard',
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
    featured: 'standard',
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
  intro: [pt('From the Blog', 'h2'), pt('Latest Updates', 'normal')],
  layout: 'grid',
  showFeaturedPostsFirst: true,
  displayFilters: true,
  limit: 3,
  posts: mockPosts,
} as any;

const bannerData: Sanity.Banner & Sanity.Module = {
  _type: 'banner',
  _id: 'ann1',
  content: [pt('New: Next.js 15 Support is here!')],
  cta: menuItem('Learn More', '#'),
} as any;

const metalSocialModule: Sanity.Module = {
  _type: 'features',
  _key: 'metal-social',
  pretitle: 'Optional Integration',
  intro: [
    pt('Supercharge with Metal Social', 'h2'),
    pt(
      'NextMedal seamlessly integrates with Metal Social platform, offering enterprise-grade capabilities out of the box. Fully optional, but powerful when you need it.'
    ),
  ],
  items: [
    {
      _key: 'ms1',
      summary: 'Dedicated Account Manager',
      content: [
        pt('Your personal implementation expert acting as a partner for your business success.'),
      ],
      icon: { ic0n: 'UserCheck', _type: 'icon' },
    },
    {
      _key: 'ms2',
      summary: 'SLA Guarantee',
      content: [
        pt('Comprehensive Service Level Agreements to ensure reliability and peace of mind.'),
      ],
      icon: { ic0n: 'FileCheck', _type: 'icon' },
    },
    {
      _key: 'ms3',
      summary: 'Enterprise Security',
      content: [pt('Top-tier security features including encryption and data sovereignty.')],
      icon: { ic0n: 'ShieldCheck', _type: 'icon' },
    },
    {
      _key: 'ms4',
      summary: 'Marketing Automation',
      content: [pt('Mass emailing and automated workflows for sophisticated user journeys.')],
      icon: { ic0n: 'Mail', _type: 'icon' },
    },
    {
      _key: 'ms5',
      summary: 'Deep Analytics',
      content: [pt('Gain actionable insights with integrated analytics dashboards.')],
      icon: { ic0n: 'BarChart3', _type: 'icon' },
    },
    {
      _key: 'ms6',
      summary: 'GDPR Compliance',
      content: [pt('Built-in tools and features to ensure full GDPR compliance.')],
      icon: { ic0n: 'Cookie', _type: 'icon' },
    },
    {
      _key: 'ms7',
      summary: 'Unified Channels',
      content: [pt('Integrate all your communication channels in one centralized place.')],
      icon: { ic0n: 'MessagesSquare', _type: 'icon' },
    },
    {
      _key: 'ms8',
      summary: 'Focus on Growth',
      content: [
        pt('Stop buying 10 different tools. Get everything you need to scale in one platform.'),
      ],
      icon: { ic0n: 'TrendingUp', _type: 'icon' },
    },
  ],
} as any;

const teamModuleGridSanity = {
  ...teamModuleGrid,
  people: [
    { _type: 'reference', _ref: 'person-1', _key: 'p1' },
    { _type: 'reference', _ref: 'person-2', _key: 'p2' },
    { _type: 'reference', _ref: 'person-3', _key: 'p3' },
    { _type: 'reference', _ref: 'person-4', _key: 'p4' },
  ],
};

const teamModuleListSanity = {
  ...teamModuleList,
  people: [
    { _type: 'reference', _ref: 'person-1', _key: 'p1' },
    { _type: 'reference', _ref: 'person-2', _key: 'p2' },
    { _type: 'reference', _ref: 'person-3', _key: 'p3' },
    { _type: 'reference', _ref: 'person-4', _key: 'p4' },
  ],
};

const pricingListModuleSanity = {
  ...pricingListModule,
  tiers: [
    { _type: 'reference', _ref: 'pricing-1', _key: 't1' },
    { _type: 'reference', _ref: 'pricing-2', _key: 't2' },
    { _type: 'reference', _ref: 'pricing-3', _key: 't3' },
  ],
};

const logoCloudModuleSanity = {
  ...logoCloudModule,
  logos: [
    { _type: 'reference', _ref: 'logo-1', _key: 'l1' },
    { _type: 'reference', _ref: 'logo-2', _key: 'l2' },
    { _type: 'reference', _ref: 'logo-3', _key: 'l3' },
    { _type: 'reference', _ref: 'logo-4', _key: 'l4' },
    { _type: 'reference', _ref: 'logo-5', _key: 'l5' },
    { _type: 'reference', _ref: 'logo-6', _key: 'l6' },
  ],
};

const latestArticlesModuleSanity = {
  ...latestArticlesModule,
  posts: undefined,
};

const blogFrontpageModuleSanity = {
  ...blogFrontpageModule,
  posts: undefined,
};

const breadcrumbsModuleSanity = {
  ...breadcrumbsModule,
  crumbs: [
    { _type: 'menuItem', _key: 'l1', type: 'external', label: 'Home', external: '/' },
    { _type: 'menuItem', _key: 'l2', type: 'external', label: 'Components', external: '#' },
    { _type: 'menuItem', _key: 'l3', type: 'external', label: 'Breadcrumbs', external: '#' },
  ],
};

const mockModules = [
  { ...breadcrumbsModule, sanityData: breadcrumbsModuleSanity },
  { ...heroModule, sanityData: heroModule },
  { ...logoCloudModule, sanityData: logoCloudModuleSanity },
  { ...featuresModule, sanityData: featuresModule },
  { ...productComparisonModule, sanityData: productComparisonModule },
  { ...metalSocialComparisonModule, sanityData: metalSocialComparisonModule },
  { ...pricingComparisonModule, sanityData: pricingComparisonModule },
  { ...teamModuleGrid, sanityData: teamModuleGridSanity },
  { ...teamModuleList, sanityData: teamModuleListSanity },
  { ...pricingListModule, sanityData: pricingListModuleSanity },
  { ...accordionListModule, sanityData: accordionListModule },
  { ...videoHeroModule, sanityData: videoHeroModule },
  { ...richtextModule, sanityData: richtextModule },
  { ...calloutModule, sanityData: calloutModule },
  { ...componentGalleryModule, sanityData: componentGalleryModule },
  { ...blogFrontpageModule, sanityData: blogFrontpageModuleSanity },
  { ...latestArticlesModule, sanityData: latestArticlesModuleSanity },
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

  const featuresSchemaInfo = await getComponentSchema('features');

  const withSchema = (module: any, schemaInfo: any) => ({
    ...module,
    schemaCode: schemaInfo.code,
    schemaHtml: schemaInfo.html,
    schemaObject: schemaInfo.object,
  });

  const metalSocialWithSchema = withSchema(metalSocialModule, featuresSchemaInfo);

  const comparisonSchemaInfo = await getComponentSchema('product-comparison');
  const comparisonWithSchema = withSchema(productComparisonModule, comparisonSchemaInfo);
  
  const metalSocialComparisonWithSchema = withSchema(
    metalSocialComparisonModule,
    comparisonSchemaInfo
  );

  const bannerSchemaInfo = await getComponentSchema('banner');
  const bannerWithSchema = {
    ...bannerData,
    schemaCode: bannerSchemaInfo.code,
    schemaHtml: bannerSchemaInfo.html,
    schemaObject: bannerSchemaInfo.object,
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
        {/* Metal Social Section */}
        <div className="mb-12 border-b pb-12">
          <div className="mb-8 px-2">
            <h2 className="text-2xl font-bold mb-2">Platform Integration</h2>
            <p className="text-muted-foreground">
              Demonstrating the optional Metal Social integration capabilities.
            </p>
          </div>
          <section className="relative border rounded-lg overflow-hidden bg-background shadow-sm mb-12">
            <ComponentPreview
              moduleType="features (Metal Social)"
              schemaObject={metalSocialWithSchema.schemaObject}
              componentData={metalSocialModule}
            >
              <Modules modules={[metalSocialWithSchema]} />
            </ComponentPreview>
          </section>

          <section className="relative border rounded-lg overflow-hidden bg-background shadow-sm">
            <ComponentPreview
              moduleType="product-comparison (Metal Social)"
              schemaObject={metalSocialComparisonWithSchema.schemaObject}
              componentData={metalSocialComparisonModule}
            >
              <Modules modules={[metalSocialComparisonWithSchema]} />
            </ComponentPreview>
          </section>
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
                schemaObject={bannerWithSchema.schemaObject}
                componentData={bannerData}
              >
                <div className="p-4 bg-muted/10">
                  <BannerClient banner={bannerData} />
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
            {modulesWithSchema.map((item) => {
              const { schemaCode, schemaHtml, schemaObject, sanityData, ...moduleData } = item;
              return (
                <section
                  key={item._key}
                  className="relative border rounded-lg overflow-hidden bg-background shadow-sm"
                >
                  <ComponentPreview
                    moduleType={item._type}
                    schemaObject={item.schemaObject}
                    componentData={sanityData || moduleData}
                    hasRegistry={true}
                  >
                    <Modules modules={[item]} />
                  </ComponentPreview>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
