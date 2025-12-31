/**
 * Event Detail Component
 * @version 1.0.0
 * @lastUpdated 2025-12-30
 * @description Renders a collection event detail page (webinars, videos, physical events)
 */

import { Calendar, Clock, ExternalLink, MapPin, Play, Radio, Video } from 'lucide-react';
import { Fragment } from 'react';
import Content from '@/components/blocks/modules/content/RichtextModule/Content';
import MobileSidebar from '@/components/blocks/modules/frontpage/articles/MobileSidebar';
import { Date as DateDisplay, Img, Time } from '@/components/blocks/objects/core';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { createStegaAttribute } from '@/sanity/lib/client';
import EventDetailActions from './EventDetailActions';

interface EventDetailProps {
  event: Sanity.CollectionEvents;
  collectionSlug: string;
  locale: string;
}

// Event type configuration
const eventTypeConfig = {
  webinar: { label: 'Webinar', icon: Video, color: 'bg-blue-500' },
  video: { label: 'Video', icon: Play, color: 'bg-purple-500' },
  physical: { label: 'In-Person', icon: MapPin, color: 'bg-green-500' },
  hybrid: { label: 'Hybrid', icon: Radio, color: 'bg-orange-500' },
} as const;

// Status configuration
const statusConfig = {
  upcoming: { label: 'Upcoming', variant: 'default' as const },
  live: { label: 'Live Now', variant: 'destructive' as const },
  completed: { label: 'Completed', variant: 'secondary' as const },
} as const;

// Build breadcrumbs from event data
function buildBreadcrumbs(
  event: Sanity.CollectionEvents,
  collectionSlug: string
): Array<{ label: string; href: string }> {
  const collectionTitle = event.collection?.metadata?.title || collectionSlug;
  return [{ label: collectionTitle, href: `/${collectionSlug}` }];
}

// Breadcrumbs component
function EventBreadcrumbs({
  crumbs,
  currentTitle,
}: {
  crumbs: Array<{ label: string; href: string }>;
  currentTitle?: string;
}) {
  return (
    <Breadcrumb className="mb-6 font-medium text-muted-foreground">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {crumbs.map((crumb) => (
          <Fragment key={crumb.label}>
            <BreadcrumbItem>
              <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </Fragment>
        ))}

        <BreadcrumbItem>
          <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Event type badge
function EventTypeBadge({ type }: { type: Sanity.CollectionEvents['eventType'] }) {
  const config = eventTypeConfig[type];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white ${config.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

// Status badge
function StatusBadge({ status }: { status: 'upcoming' | 'live' | 'completed' }) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className="text-xs">
      {status === 'live' && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1" />}
      {config.label}
    </Badge>
  );
}

// Event header section
function EventHeader({
  event,
  collectionSlug,
  stega,
  status,
}: {
  event: Sanity.CollectionEvents;
  collectionSlug: string;
  stega: ReturnType<typeof createStegaAttribute>;
  status: 'upcoming' | 'live' | 'completed';
}) {
  const crumbs = buildBreadcrumbs(event, collectionSlug);

  return (
    <section className="bg-background pt-24 md:pt-32 pb-8 border-b border-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <EventBreadcrumbs crumbs={crumbs} currentTitle={event.metadata?.title} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-8">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {event.eventType && <EventTypeBadge type={event.eventType} />}
              <StatusBadge status={status} />
            </div>

            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight mb-6"
              data-sanity={stega.scope('metadata.title').toString()}
            >
              {event.metadata?.title}
            </h1>

            <EventMeta event={event} stega={stega} />
          </div>
        </div>
      </div>
    </section>
  );
}

// Event metadata (date, time, location)
function EventMeta({
  event,
  stega,
}: {
  event: Sanity.CollectionEvents;
  stega: ReturnType<typeof createStegaAttribute>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-muted-foreground text-sm">
      {/* Date */}
      {event.startDateTime && (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <DateDisplay
            value={event.startDateTime}
            data-sanity={stega.scope('startDateTime').toString()}
          />
        </div>
      )}

      {/* Time */}
      {event.startDateTime && (
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <Time value={event.startDateTime} />
          {event.endDateTime && (
            <>
              <span>-</span>
              <Time value={event.endDateTime} />
            </>
          )}
          {event.timezone && <span className="text-xs">({event.timezone})</span>}
        </div>
      )}

      {/* Location for physical/hybrid events */}
      {event.location?.venue &&
        (event.eventType === 'physical' || event.eventType === 'hybrid') && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{event.location.venue}</span>
            {event.location.city && <span>, {event.location.city}</span>}
          </div>
        )}
    </div>
  );
}

// Event image
function EventImage({
  event,
  stega,
}: {
  event: Sanity.CollectionEvents;
  stega: ReturnType<typeof createStegaAttribute>;
}) {
  if (!event.seo?.image && !event.metadata?.title) return null;

  const fallbackImage = {
    src: `/api/og/event-fallback?title=${encodeURIComponent(event.metadata?.title || '')}&type=${encodeURIComponent(event.eventType || '')}`,
    alt: event.metadata?.title || '',
    width: 1200,
    height: 630,
  };

  return (
    <div
      className="w-full rounded-xl overflow-hidden shadow-md mb-8 bg-muted aspect-video"
      data-sanity={stega.scope('seo.image').toString()}
    >
      <Img
        image={event.seo?.image || fallbackImage}
        className="w-full h-full object-cover"
        sizes="(max-width: 768px) 100vw, 900px"
        priority
        fetchPriority="high"
        alt={event.metadata?.title || ''}
        unoptimized={!event.seo?.image}
      />
    </div>
  );
}

/**
 * Compute event status based on start time and duration
 */
function computeEventStatus(
  startDateTime: string,
  duration?: number
): 'upcoming' | 'live' | 'completed' {
  const now = new Date();
  const startDate = new Date(startDateTime);
  const durationHours = duration || 1;
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

  if (now > endDate) return 'completed';
  if (now < startDate) return 'upcoming';
  return 'live';
}

// Speakers section
function SpeakersSection({ speakers }: { speakers?: Sanity.CollectionEvents['speakers'] }) {
  if (!speakers || speakers.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl p-6 border shadow-sm mb-8">
      <h3 className="text-lg font-semibold mb-4">Speakers</h3>
      <div className="space-y-4">
        {speakers.map((speaker) => (
          <div key={speaker._id} className="flex items-center gap-4">
            {speaker.image && (
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                <Img
                  image={speaker.image}
                  className="w-full h-full object-cover"
                  sizes="48px"
                  alt={speaker.name || ''}
                />
              </div>
            )}
            <div>
              <p className="font-medium text-foreground">{speaker.name}</p>
              {speaker.role && <p className="text-sm text-muted-foreground">{speaker.role}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Location details for physical events
function LocationDetails({ location }: { location?: Sanity.CollectionEvents['location'] }) {
  if (!location?.venue) return null;

  const hasAddress = location.address || location.city || location.country;

  return (
    <div className="bg-card rounded-2xl p-6 border shadow-sm mb-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        Location
      </h3>
      <div className="space-y-2">
        <p className="font-medium text-foreground">{location.venue}</p>
        {hasAddress && (
          <p className="text-sm text-muted-foreground">
            {location.address && <span>{location.address}</span>}
            {location.city && (
              <span>
                {location.address ? ', ' : ''}
                {location.city}
              </span>
            )}
            {location.country && (
              <span>
                {location.address || location.city ? ', ' : ''}
                {location.country}
              </span>
            )}
          </p>
        )}
        {location.mapUrl && (
          <a
            href={location.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-2"
          >
            View on Map
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

// Sidebar content
function EventSidebar({ event }: { event: Sanity.CollectionEvents }) {
  return (
    <div className="space-y-6">
      <SpeakersSection speakers={event.speakers} />

      {(event.eventType === 'physical' || event.eventType === 'hybrid') && (
        <LocationDetails location={event.location} />
      )}

      {/* Event details card */}
      <div className="bg-card rounded-2xl p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Event Details</h3>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Event Type</dt>
            <dd className="font-medium">{eventTypeConfig[event.eventType || 'webinar'].label}</dd>
          </div>
          {event.startDateTime && (
            <div>
              <dt className="text-muted-foreground">Date</dt>
              <dd className="font-medium">
                <DateDisplay value={event.startDateTime} />
              </dd>
            </div>
          )}
          {event.startDateTime && (
            <div>
              <dt className="text-muted-foreground">Time</dt>
              <dd className="font-medium">
                <Time value={event.startDateTime} />
                {event.endDateTime && (
                  <>
                    {' - '}
                    <Time value={event.endDateTime} />
                  </>
                )}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

export default function EventDetail({ event, collectionSlug }: EventDetailProps) {
  const stega = createStegaAttribute({
    id: event._id,
    type: event._type,
  });

  // Compute status from dates (not stored in schema)
  const status = event.startDateTime
    ? computeEventStatus(event.startDateTime, event.duration)
    : 'upcoming';

  const eventSlug = event.metadata?.slug?.current || '';

  return (
    <article>
      <EventHeader event={event} collectionSlug={collectionSlug} stega={stega} status={status} />

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Content Column */}
          <div className="lg:col-span-8">
            <EventImage event={event} stega={stega} />
            <EventDetailActions
              event={event}
              status={status}
              collectionSlug={collectionSlug}
              eventSlug={eventSlug}
            />
            <MobileSidebar headings={event.headings} />

            {event.body && (
              <Content
                value={event.body}
                className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-xl"
                data-sanity={stega.scope('body').toString()}
              />
            )}

            {/* Mobile sidebar content */}
            <div className="lg:hidden mt-12">
              <EventSidebar event={event} />
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24 self-start">
            <EventSidebar event={event} />
          </div>
        </div>
      </div>
    </article>
  );
}
