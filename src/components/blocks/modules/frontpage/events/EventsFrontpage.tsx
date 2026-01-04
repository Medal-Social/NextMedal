/**
 * Events Frontpage Module Server Component
 * @version 2.0.0
 * @lastUpdated 2025-12-30
 * @description Server component that fetches events and renders the interactive client component.
 * Supports calendar, cards, list, and timeline layouts with layout switching.
 */

import { groq, stegaClean } from 'next-sanity';
import { Suspense } from 'react';
import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { Section } from '@/components/ui/section';
import { getCollectionSlugWithFallback } from '@/lib/collections/registry';
import moduleProps from '@/lib/sanity/module-props';
import { fetchSanityLive } from '@/sanity/lib/live';
import { IMAGE_QUERY, PERSON_PREVIEW_QUERY } from '@/sanity/lib/queries';
import EventsFrontpageClient from './EventsFrontpageClient';

interface EventsFrontpageProps extends Sanity.EventsFrontpage {
  collectionSlug?: string;
  locale?: string;
}

// Form field type from Sanity
interface FormField {
  _key: string;
  label: string;
  name: { current: string };
  type: 'text' | 'email' | 'tel' | 'textarea' | 'checkbox';
  placeholder?: string;
  required?: boolean;
}

// Registration form type
interface RegistrationForm {
  _id: string;
  formTitle: string;
  intent: 'lead' | 'newsletter' | 'download';
  fields: FormField[];
  acceptance?: {
    required?: boolean;
    text?: string;
  };
  submitButtonText: string;
  successMessage?: Sanity.BlockContent;
}

// Raw event data from Sanity (status is computed, not stored)
interface RawCollectionEvent {
  _id: string;
  _type: 'collection.events';
  metadata: {
    title: string;
    slug: { current: string };
    description?: string;
    image?: Sanity.Image;
  };
  eventType: 'webinar' | 'video' | 'physical' | 'hybrid';
  startDateTime: string;
  duration?: number; // Duration in hours
  timezone?: string;
  location?: {
    venue?: string;
    city?: string;
    country?: string;
  };
  registrationForm?: RegistrationForm;
  speakers?: Sanity.Person[];
}

// Event with computed status for display
interface CollectionEvent extends RawCollectionEvent {
  status: 'upcoming' | 'live' | 'completed';
}

// Fetch collection events based on collection slug
async function fetchCollectionEvents(
  collectionSlug: string,
  locale: string,
  options: {
    limit?: number;
    showUpcomingFirst?: boolean;
    hidePastEvents?: boolean;
    filterByType?: string;
  }
) {
  const {
    limit = 50,
    showUpcomingFirst = true,
    hidePastEvents = false,
    filterByType = 'all',
  } = options;

  const typeFilter =
    filterByType && filterByType !== 'all' ? `&& eventType == "${filterByType}"` : '';
  const pastFilter = hidePastEvents ? `&& startDateTime >= now()` : '';

  return await fetchSanityLive<RawCollectionEvent[]>({
    query: groq`
      *[
        _type == 'collection.events' &&
        collection->metadata.slug.current == $collectionSlug &&
        (language == $locale || language == null)
        ${typeFilter}
        ${pastFilter}
      ]|order(
        ${showUpcomingFirst ? 'startDateTime asc' : 'startDateTime desc'}
      )[0...$limit]{
        _id,
        _type,
        startDateTime,
        duration,
        timezone,
        eventType,
        metadata {
          title,
          description,
          "slug": { "current": slug.current },
          image { ${IMAGE_QUERY} }
        },
        location {
          venue,
          city,
          country
        },
        registrationForm->{
          _id,
          formTitle,
          intent,
          fields[] {
            _key,
            label,
            name,
            type,
            placeholder,
            required
          },
          acceptance {
            required,
            text
          },
          submitButtonText,
          successMessage
        },
        speakers[]->${PERSON_PREVIEW_QUERY}
      }
    `,
    params: {
      collectionSlug,
      locale,
      limit,
    },
  });
}

// Loading skeleton
function ListSkeleton({ count = 6, layout }: { count?: number; layout: string }) {
  if (layout === 'calendar') {
    return (
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden animate-pulse">
        <div className="h-14 bg-muted border-b" />
        <div className="grid grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={`header-${i}`} className="h-10 bg-muted/50 border-r border-b" />
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={`cell-${i}`} className="h-24 bg-muted/20 border-r border-b" />
          ))}
        </div>
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="flex gap-4 p-4 bg-card rounded-lg border animate-pulse"
          >
            <div className="w-32 h-24 bg-muted rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-muted rounded" />
                <div className="h-5 w-20 bg-muted rounded" />
              </div>
              <div className="h-5 w-3/4 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (layout === 'timeline') {
    return (
      <div className="border-l-2 border-border pl-8 space-y-8">
        {Array.from({ length: count }).map((_, i) => (
          <div key={`skeleton-${i}`} className="animate-pulse">
            <div className="h-4 w-24 bg-muted rounded mb-2" />
            <div className="p-4 bg-card rounded-lg border space-y-2">
              <div className="h-5 w-16 bg-muted rounded" />
              <div className="h-5 w-3/4 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Cards grid
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`skeleton-${i}`} className="bg-card rounded-xl border shadow-sm animate-pulse">
          <div className="aspect-video bg-muted rounded-t-xl" />
          <div className="p-5 space-y-3">
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-muted rounded" />
              <div className="h-5 w-20 bg-muted rounded" />
            </div>
            <div className="h-4 w-48 bg-muted rounded" />
            <div className="h-6 w-3/4 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Compute event status based on start time and duration
 * - upcoming: event hasn't started yet
 * - live: event is currently happening
 * - completed: event has ended
 */
function computeEventStatus(event: RawCollectionEvent): CollectionEvent['status'] {
  const now = new Date();
  const startDate = new Date(event.startDateTime);

  // Calculate end time from duration (default 1 hour if not set)
  const durationHours = event.duration || 1;
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

  // Check if event has ended
  if (now > endDate) return 'completed';

  // Event hasn't started yet
  if (now < startDate) return 'upcoming';

  // Event is currently happening
  return 'live';
}

// Async content component
async function EventsContent({
  collectionSlug,
  locale,
  layout,
  filterByType,
  showUpcomingFirst,
  hidePastEvents,
  limit,
  intro,
  showRssLink,
}: {
  collectionSlug: string;
  locale: string;
  layout: 'calendar' | 'cards' | 'list' | 'timeline';
  filterByType?: string;
  showUpcomingFirst?: boolean;
  hidePastEvents?: boolean;
  limit?: number;
  intro?: Sanity.BlockContent;
  showRssLink?: boolean;
}) {
  const rawEvents = await fetchCollectionEvents(collectionSlug, locale, {
    limit: limit || 50,
    showUpcomingFirst: showUpcomingFirst ?? true,
    hidePastEvents: hidePastEvents ?? false,
    filterByType: filterByType || 'all',
  });

  // Compute status for each event based on dates (server-side)
  const events = rawEvents.map((event) => ({
    ...event,
    status: computeEventStatus(event),
  }));

  return (
    <EventsFrontpageClient
      events={events}
      defaultLayout={layout}
      collectionSlug={collectionSlug}
      intro={intro ? <SharedPortableText value={intro} className="richtext" /> : undefined}
      showRssLink={showRssLink}
    />
  );
}

export default async function EventsFrontpage({
  intro,
  layout = 'cards',
  filterByType = 'all',
  showUpcomingFirst = true,
  hidePastEvents = false,
  limit = 50,
  showRssLink,
  collectionSlug: providedSlug,
  locale = 'en',
  ...props
}: EventsFrontpageProps) {
  // Self-determine collection slug from site settings if not provided
  let collectionSlug = providedSlug;

  if (!collectionSlug) {
    collectionSlug = getCollectionSlugWithFallback('collection.events', locale);
    if (!collectionSlug) {
      return (
        <Section className="space-y-8" {...moduleProps(props)}>
          <div className="text-center py-12 text-muted-foreground">
            <p>Events collection not configured for this language.</p>
            <p className="text-sm mt-2">Configure the events frontpage in site settings.</p>
          </div>
        </Section>
      );
    }
  }

  const cleanLayout = stegaClean(layout) as 'calendar' | 'cards' | 'list' | 'timeline';

  return (
    <Section className="space-y-8" {...moduleProps(props)}>
      <Suspense fallback={<ListSkeleton count={limit} layout={cleanLayout} />}>
        <EventsContent
          collectionSlug={collectionSlug}
          locale={locale}
          layout={cleanLayout}
          filterByType={filterByType}
          showUpcomingFirst={showUpcomingFirst}
          hidePastEvents={hidePastEvents}
          limit={limit}
          intro={intro}
          showRssLink={showRssLink}
        />
      </Suspense>
    </Section>
  );
}
