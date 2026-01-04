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
import moduleProps from '@/lib/sanity/module-props';
import resolveUrl from '@/lib/sanity/resolve-url-server';

export default async function Breadcrumbs({
  crumbs,
  hideCurrent,
  currentPage,
  ...props
}: Sanity.Breadcrumbs) {
  // Pre-resolve all internal URLs
  const resolvedCrumbs = await Promise.all(
    (crumbs || []).map(async (crumb) => ({
      ...crumb,
      resolvedUrl: crumb.internal
        ? await resolveUrl(crumb.internal as Sanity.PageBase, { base: false })
        : crumb.external
          ? stegaClean(crumb.external)
          : '/',
    }))
  );

  return (
    <Section as={Breadcrumb} className="py-4 text-sm" spacing="none" {...moduleProps(props)}>
      <BreadcrumbList itemScope itemType="https://schema.org/BreadcrumbList">
        {resolvedCrumbs?.map((crumb, index) => (
          <Fragment key={(crumb as Sanity.MenuItem & { _key?: string })._key || index}>
            <BreadcrumbItem
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className="line-clamp-1"
            >
              <BreadcrumbLink href={crumb.resolvedUrl} className="hover:underline" itemProp="item">
                <span itemProp="name">
                  {crumb.label || crumb.internal?.title || crumb.external}
                </span>
                <meta
                  itemProp="position"
                  content={(resolvedCrumbs?.indexOf(crumb) + 1).toString()}
                />
              </BreadcrumbLink>
            </BreadcrumbItem>

            {(resolvedCrumbs?.indexOf(crumb) < resolvedCrumbs.length - 1 || !hideCurrent) && (
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
