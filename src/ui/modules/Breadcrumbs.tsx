import { stegaClean } from 'next-sanity';
import { Fragment } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Section } from '@/components/ui/section';
import resolveUrl from '@/lib/resolveUrl';

export default async function Breadcrumbs({
  crumbs,
  hideCurrent,
  currentPage,
  ...props
}: Partial<{
  crumbs: Sanity.Link[];
  hideCurrent?: boolean;
  currentPage: Sanity.Page | Sanity.BlogPost | Sanity.ComponentLibrary;
}> &
  React.ComponentProps<typeof Section>) {
  return (
    <Section as={Breadcrumb} className="py-4 text-sm" spacing="none" {...props}>
      <BreadcrumbList itemScope itemType="https://schema.org/BreadcrumbList">
        {crumbs?.map((crumb, index) => (
          <Fragment key={(crumb as any)._key || index}>
            <BreadcrumbItem
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className="line-clamp-1"
            >
              <BreadcrumbLink
                href={
                  crumb.internal
                    ? resolveUrl(crumb.internal, { base: false })
                    : crumb.external
                      ? stegaClean(crumb.external)
                      : '/'
                }
                className="hover:underline"
                itemProp="item"
              >
                <span itemProp="name">
                  {stegaClean(crumb.label || crumb.internal?.title || crumb.external)}
                </span>
                <meta itemProp="position" content={(crumbs?.indexOf(crumb) + 1).toString()} />
              </BreadcrumbLink>
            </BreadcrumbItem>

            {(crumbs?.indexOf(crumb) < crumbs.length - 1 || !hideCurrent) && (
              <BreadcrumbSeparator />
            )}
          </Fragment>
        ))}

        {!hideCurrent && currentPage && (
          <BreadcrumbItem
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
            className="line-clamp-1"
          >
            <BreadcrumbPage>
              <span itemProp="name">{currentPage.title || currentPage.metadata?.title}</span>
              <meta itemProp="position" content={((crumbs?.length || 0) + 1).toString()} />
            </BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Section>
  );
}
