import AccordionList from '@/ui/modules/AccordionList';
import Breadcrumbs from '@/ui/modules/Breadcrumbs';
import Callout from '@/ui/modules/Callout';
import Hero from '@/ui/modules/hero/Hero';
import RichtextModule from '@/ui/modules/RichtextModule';

// Mock Portable Text content - simulating what Sanity would provide
const heroContent = [
  {
    _type: 'block',
    _key: 'hero-h1',
    style: 'h1',
    children: [{ _type: 'span', text: 'Privacy Policy' }],
  },
  {
    _type: 'block',
    _key: 'hero-p',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'Your privacy is important to us. This policy explains how we collect, use, and protect your personal information when you use our services.',
      },
    ],
  },
];

const mainContent = [
  // Introduction
  {
    _type: 'block',
    _key: 'intro-h2',
    style: 'h2',
    children: [{ _type: 'span', text: 'Introduction' }],
  },
  {
    _type: 'block',
    _key: 'intro-p1',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'Welcome to our Privacy Policy. This document describes how Medal Social ("we", "our", or "us") collects, uses, and shares information about you when you use our websites, mobile applications, and other online products and services (collectively, the "Services") or when you otherwise interact with us.',
      },
    ],
  },
  {
    _type: 'block',
    _key: 'intro-p2',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'We encourage you to read this Privacy Policy carefully to understand our practices regarding your information. By accessing or using our Services, you acknowledge that you have read and understood this Privacy Policy.',
      },
    ],
  },

  // Information We Collect
  {
    _type: 'block',
    _key: 'collect-h2',
    style: 'h2',
    children: [{ _type: 'span', text: 'Information We Collect' }],
  },
  {
    _type: 'block',
    _key: 'collect-p1',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'We collect information in several ways to provide and improve our Services:',
      },
    ],
  },

  // Personal Information subsection
  {
    _type: 'block',
    _key: 'personal-h3',
    style: 'h3',
    children: [{ _type: 'span', text: 'Personal Information' }],
  },
  {
    _type: 'block',
    _key: 'personal-p1',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'Information you provide directly to us includes:',
      },
    ],
  },
  {
    _type: 'block',
    _key: 'personal-li1',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Account Information: ', marks: ['strong'] },
      { _type: 'span', text: 'Name, email address, password, and profile details' },
    ],
  },
  {
    _type: 'block',
    _key: 'personal-li2',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Contact Information: ', marks: ['strong'] },
      { _type: 'span', text: 'Phone number, mailing address, and communication preferences' },
    ],
  },
  {
    _type: 'block',
    _key: 'personal-li3',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Payment Information: ', marks: ['strong'] },
      {
        _type: 'span',
        text: 'Credit card details, billing address (processed securely by our payment partners)',
      },
    ],
  },
  {
    _type: 'block',
    _key: 'personal-li4',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Communications: ', marks: ['strong'] },
      { _type: 'span', text: 'Messages you send us, feedback, and support requests' },
    ],
  },

  // Automatically Collected Data subsection
  {
    _type: 'block',
    _key: 'auto-h3',
    style: 'h3',
    children: [{ _type: 'span', text: 'Automatically Collected Data' }],
  },
  {
    _type: 'block',
    _key: 'auto-p1',
    style: 'normal',
    children: [{ _type: 'span', text: 'When you use our Services, we automatically collect:' }],
  },
  {
    _type: 'block',
    _key: 'auto-li1',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Device Information: ', marks: ['strong'] },
      { _type: 'span', text: 'Browser type, operating system, device identifiers' },
    ],
  },
  {
    _type: 'block',
    _key: 'auto-li2',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Usage Data: ', marks: ['strong'] },
      { _type: 'span', text: 'Pages visited, features used, time spent, click patterns' },
    ],
  },
  {
    _type: 'block',
    _key: 'auto-li3',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Location Data: ', marks: ['strong'] },
      { _type: 'span', text: 'General location based on IP address (country/region level)' },
    ],
  },
  {
    _type: 'block',
    _key: 'auto-li4',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Log Data: ', marks: ['strong'] },
      { _type: 'span', text: 'Access times, error reports, referral URLs' },
    ],
  },

  // How We Use Your Information
  {
    _type: 'block',
    _key: 'use-h2',
    style: 'h2',
    children: [{ _type: 'span', text: 'How We Use Your Information' }],
  },
  {
    _type: 'block',
    _key: 'use-p1',
    style: 'normal',
    children: [
      { _type: 'span', text: 'We use the information we collect for various purposes, including:' },
    ],
  },
  {
    _type: 'block',
    _key: 'use-li1',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Service Delivery: ', marks: ['strong'] },
      { _type: 'span', text: 'Provide, maintain, and improve our Services' },
    ],
  },
  {
    _type: 'block',
    _key: 'use-li2',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Communication: ', marks: ['strong'] },
      { _type: 'span', text: 'Send updates, security alerts, and support messages' },
    ],
  },
  {
    _type: 'block',
    _key: 'use-li3',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Personalization: ', marks: ['strong'] },
      { _type: 'span', text: 'Customize content and recommendations' },
    ],
  },
  {
    _type: 'block',
    _key: 'use-li4',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Analytics: ', marks: ['strong'] },
      { _type: 'span', text: 'Understand usage patterns and optimize performance' },
    ],
  },
  {
    _type: 'block',
    _key: 'use-li5',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Security: ', marks: ['strong'] },
      { _type: 'span', text: 'Detect and prevent fraud, abuse, and unauthorized access' },
    ],
  },
  {
    _type: 'block',
    _key: 'use-li6',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Legal Compliance: ', marks: ['strong'] },
      { _type: 'span', text: 'Meet legal obligations and enforce our terms' },
    ],
  },

  // Data Sharing
  {
    _type: 'block',
    _key: 'share-h2',
    style: 'h2',
    children: [{ _type: 'span', text: 'Data Sharing & Third Parties' }],
  },
  {
    _type: 'block',
    _key: 'share-p1',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'We do not sell your personal information. We may share your information with:',
      },
    ],
  },
  {
    _type: 'block',
    _key: 'share-li1',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Service Providers: ', marks: ['strong'] },
      {
        _type: 'span',
        text: 'Companies that help us operate our business (hosting, analytics, customer support)',
      },
    ],
  },
  {
    _type: 'block',
    _key: 'share-li2',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Legal Requirements: ', marks: ['strong'] },
      { _type: 'span', text: 'When required by law, regulation, or legal process' },
    ],
  },
  {
    _type: 'block',
    _key: 'share-li3',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Business Transfers: ', marks: ['strong'] },
      { _type: 'span', text: 'In connection with mergers, acquisitions, or asset sales' },
    ],
  },
  {
    _type: 'block',
    _key: 'share-li4',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'With Your Consent: ', marks: ['strong'] },
      { _type: 'span', text: 'When you explicitly agree to share your information' },
    ],
  },

  // Your Rights
  {
    _type: 'block',
    _key: 'rights-h2',
    style: 'h2',
    children: [{ _type: 'span', text: 'Your Rights' }],
  },
  {
    _type: 'block',
    _key: 'rights-p1',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'Depending on your location, you may have certain rights regarding your personal information:',
      },
    ],
  },
  {
    _type: 'block',
    _key: 'rights-li1',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Access: ', marks: ['strong'] },
      { _type: 'span', text: 'Request a copy of your personal data' },
    ],
  },
  {
    _type: 'block',
    _key: 'rights-li2',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Correction: ', marks: ['strong'] },
      { _type: 'span', text: 'Request correction of inaccurate data' },
    ],
  },
  {
    _type: 'block',
    _key: 'rights-li3',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Deletion: ', marks: ['strong'] },
      { _type: 'span', text: 'Request deletion of your personal data' },
    ],
  },
  {
    _type: 'block',
    _key: 'rights-li4',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Portability: ', marks: ['strong'] },
      { _type: 'span', text: 'Receive your data in a portable format' },
    ],
  },
  {
    _type: 'block',
    _key: 'rights-li5',
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', text: 'Object: ', marks: ['strong'] },
      { _type: 'span', text: 'Object to processing for direct marketing' },
    ],
  },

  // Security
  {
    _type: 'block',
    _key: 'security-h2',
    style: 'h2',
    children: [{ _type: 'span', text: 'Security Measures' }],
  },
  {
    _type: 'block',
    _key: 'security-p1',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'We implement appropriate technical and organizational measures to protect your personal information, including TLS/SSL encryption, encryption at rest for sensitive data, regular security audits, access controls, and employee security training.',
      },
    ],
  },

  // Contact
  {
    _type: 'block',
    _key: 'contact-h2',
    style: 'h2',
    children: [{ _type: 'span', text: 'Contact Us' }],
  },
  {
    _type: 'block',
    _key: 'contact-p1',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'If you have any questions about this Privacy Policy or our data practices, please contact us at privacy@medalsocial.com.',
      },
    ],
  },
];

// FAQ items for AccordionList
const faqContent = [
  {
    _type: 'block',
    _key: 'faq-title',
    style: 'h2',
    children: [{ _type: 'span', text: 'Frequently Asked Questions' }],
  },
];

const faqItems = [
  {
    _key: 'faq-1',
    summary: 'What personal data do you collect?',
    content: [
      {
        _type: 'block',
        _key: 'faq-1-p',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'We collect information you provide directly (name, email, account details) and data collected automatically (IP address, browser type, usage patterns). We only collect what is necessary to provide our services.',
          },
        ],
      },
    ],
  },
  {
    _key: 'faq-2',
    summary: 'How long do you keep my data?',
    content: [
      {
        _type: 'block',
        _key: 'faq-2-p',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'We retain your personal data only as long as necessary to fulfill the purposes outlined in this policy, typically for the duration of your account plus 30 days. Some data may be retained longer for legal or business requirements.',
          },
        ],
      },
    ],
  },
  {
    _key: 'faq-3',
    summary: 'Can I request deletion of my data?',
    content: [
      {
        _type: 'block',
        _key: 'faq-3-p',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Yes, you have the right to request deletion of your personal data. Contact us at privacy@medalsocial.com and we will process your request within 30 days, subject to any legal retention requirements.',
          },
        ],
      },
    ],
  },
  {
    _key: 'faq-4',
    summary: 'Do you share my data with third parties?',
    content: [
      {
        _type: 'block',
        _key: 'faq-4-p',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'We only share data with trusted service providers who help us operate our services, and only when necessary. We never sell your personal data to third parties for marketing purposes.',
          },
        ],
      },
    ],
  },
  {
    _key: 'faq-5',
    summary: 'How do I opt out of marketing communications?',
    content: [
      {
        _type: 'block',
        _key: 'faq-5-p',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'You can opt out at any time by clicking the unsubscribe link in any marketing email, or by updating your preferences in your account settings. We will honor your request within 10 business days.',
          },
        ],
      },
    ],
  },
];

// Callout content
const calloutContent = [
  {
    _type: 'block',
    _key: 'callout-h2',
    style: 'h2',
    children: [{ _type: 'span', text: 'Your Privacy Matters to Us' }],
  },
  {
    _type: 'block',
    _key: 'callout-p',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: "We're committed to transparency and protecting your data. If you have any concerns or questions, don't hesitate to reach out.",
      },
    ],
  },
];

const calloutCtas = [
  {
    _key: 'cta-1',
    label: 'Contact Us',
    type: 'internal',
    internal: { _type: 'page', metadata: { slug: { current: 'contact' } } },
    style: 'primary',
  },
  {
    _key: 'cta-2',
    label: 'Terms of Service',
    type: 'internal',
    internal: { _type: 'page', metadata: { slug: { current: 'terms' } } },
    style: 'secondary',
  },
];

// Breadcrumbs data
const breadcrumbsCrumbs = [
  {
    _key: 'crumb-1',
    label: 'Legal',
    external: '/legal',
  },
];

export default function PrivacyPage() {
  return (
    <>
      {/* Breadcrumbs Module */}
      <Breadcrumbs
        _type="breadcrumbs"
        _key="privacy-breadcrumbs"
        crumbs={breadcrumbsCrumbs}
        currentPage={{ title: 'Privacy Policy' }}
      />

      {/* Hero Module */}
      <Hero
        _type="hero"
        _key="privacy-hero"
        content={heroContent}
        options={{ bgFrom: 'brand-purple', bgTo: 'brand-vibrant' }}
      />

      {/* Main Content - RichtextModule */}
      <RichtextModule _type="richtext" _key="privacy-content" content={mainContent} />

      {/* FAQ - AccordionList Module */}
      <AccordionList
        _type="accordion-list"
        _key="privacy-faq"
        content={faqContent}
        items={faqItems}
        generateSchema={true}
      />

      {/* CTA - Callout Module */}
      <Callout _type="callout" _key="privacy-callout" content={calloutContent} ctas={calloutCtas} />
    </>
  );
}
