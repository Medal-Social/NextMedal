import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import resolveUrl from '@/lib/resolveUrl';
import { stegaClean } from 'next-sanity';
import { Fragment } from 'react';

export default async function Breadcrumbs({
  crumbs,
  hideCurrent,
  currentPage,
}: Partial<{
  crumbs: Sanity.Link[];
  hideCurrent?: boolean;
  currentPage: Sanity.Page | Sanity.BlogPost;
  isTabbedModule?: boolean;
}>) {
  return (
    <Breadcrumb className="section py-4  text-sm">
      <BreadcrumbList itemScope itemType="https://schema.org/BreadcrumbList">
        {crumbs?.map((crumb) => (
          <Fragment
            key={crumb.external || (crumb.internal && resolveUrl(crumb.internal, { base: false }))}
          >
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
    </Breadcrumb>
  );
}
