import resolveSlug from '@/sanity/lib/resolveSlug';
import { PiFlowArrow } from 'react-icons/pi';
import { defineField, defineType } from 'sanity';

const regex = /^(\/|https?:\/\/)/;

export default defineType({
  name: 'redirect',
  title: 'Redirect',
  icon: PiFlowArrow,
  type: 'document',
  fields: [
    defineField({
      name: 'source',
      description: 'Redirect from',
      placeholder: 'e.g. /old-path, /old-blog/:slug',
      type: 'string',
      validation: (Rule) => Rule.required().regex(regex),
    }),
    defineField({
      name: 'destination',
      description: 'Redirect to',
      type: 'object',
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
          to: [{ type: 'page' }, { type: 'blog.post' }],
          validation: (Rule) =>
            Rule.custom((value, context: any) => {
              // Only require if this is an internal link
              if (context.parent?.type === 'internal' && !value) {
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
            }).custom((value, context: any) => {
              // Only require if this is an external link
              if (context.parent?.type === 'external' && !value) {
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
