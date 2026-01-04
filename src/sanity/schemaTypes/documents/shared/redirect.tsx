/**
 * Redirect Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description Defines URL redirects (HTTP 301/307/308).
 * @changelog
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Initial version
 */

import { TransferIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import resolveSlug from '@/sanity/lib/resolveSlug';
import { RedirectInput } from '../../../components/RedirectInput';

export default defineType({
  name: 'redirect',
  title: 'Redirect',
  icon: TransferIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'source',
      title: 'Redirect From',
      placeholder: 'e.g. /about-us or about-us',
      description: (
        <>
          <p>
            Enter the path to redirect from. If you don&apos;t include a leading slash{' '}
            <code>/</code>, it will be added automatically (e.g., <code>about-us</code> becomes{' '}
            <code>/about-us</code>).
          </p>
          <p style={{ marginTop: '8px', fontSize: '0.9em', opacity: 0.8 }}>
            <strong>Advanced:</strong> To match dynamic paths (like any article), use a colon +
            name. <br />
            <em>
              Example: <code>/articles/:slug</code> will match <code>/articles/anything</code>
            </em>
          </p>
        </>
      ),
      type: 'string',
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (!value) return true;

          // Reject full URLs
          if (typeof value === 'string' && value.startsWith('http')) {
            return 'Please enter a relative path (e.g. /about), not a full URL.';
          }

          // Reject empty paths or just whitespace
          if (typeof value === 'string' && value.trim() === '') {
            return 'Please enter a valid path.';
          }

          return true;
        }),
    }),
    defineField({
      name: 'destination',
      description: 'Redirect to',
      type: 'object',
      components: {
        // biome-ignore lint/suspicious/noExplicitAny: Sanity component casting
        input: RedirectInput as any,
      },
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'type',
          title: 'Link Type',
          description: 'Choose where this link should point to',
          type: 'string',
          options: {
            layout: 'radio',
            list: [
              { title: 'Internal Page', value: 'internal' },
              { title: 'External Website', value: 'external' },
            ],
          },
          validation: (Rule) => Rule.required(),
          initialValue: 'internal',
        }),
        defineField({
          name: 'internal',
          title: 'Internal Page',
          description: 'Select a page within this website',
          type: 'reference',
          to: [{ type: 'page' }, { type: 'collection.article' }],
          validation: (Rule) =>
            Rule.custom((value, context) => {
              // Only require if this is an internal link
              const parent = context.parent as { type?: string } | undefined;
              if (parent?.type === 'internal' && !value) {
                return 'Please select a page';
              }
              return true;
            }),
          hidden: ({ parent }) => parent?.type !== 'internal',
        }),
        defineField({
          name: 'external',
          title: 'External URL',
          description: 'Enter a link to an external website',
          placeholder: 'https://example.com',
          type: 'url',
          validation: (Rule) =>
            Rule.uri({
              scheme: ['http', 'https', 'mailto', 'tel'],
              allowRelative: true,
            }).custom((value, context) => {
              // Only require if this is an external link
              const parent = context.parent as { type?: string } | undefined;
              if (parent?.type === 'external' && !value) {
                return 'Please enter a URL';
              }
              return true;
            }),
          hidden: ({ parent }) => parent?.type !== 'external',
        }),
      ],
    }),
    defineField({
      name: 'permanent',
      type: 'boolean',
      initialValue: true,
      description: (
        <>
          <p>
            If <code>true</code> will use the 308 status code which instructs clients/search engines
            to cache the redirect forever, if <code>false</code> will use the 307 status code which
            is temporary and is not cached.
          </p>
          <p>
            <a
              href="https://nextjs.org/docs/app/api-reference/next-config-js/redirects"
              target="_blank"
              rel="noreferrer"
            >
              Next.js redirects documentation
            </a>
          </p>
        </>
      ),
    }),
  ],
  preview: {
    select: {
      title: 'source',
      _type: 'destination.internal._type',
      internal: 'destination.internal.metadata.slug.current',
      params: 'destination.params',
      external: 'destination.external',
    },
    prepare: ({ title, _type, internal, params, external }) => ({
      title,
      subtitle:
        (external || internal) && `to ${external || resolveSlug({ _type, internal, params })}`,
    }),
  },
});
