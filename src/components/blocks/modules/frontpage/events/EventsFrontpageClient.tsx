/**
 * Events Frontpage Client Component
 * @version 4.0.0
 * @lastUpdated 2025-12-30
 * @description Events display with shadcn calendar-31 style.
 * Uses react-day-picker for the calendar, native JS for date formatting.
 */

'use client';

import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Grid,
  List,
  MapPin,
  Monitor,
  Radio,
  Rss,
  Users,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Img } from '@/components/blocks/objects/core';
import { Button, buttonVariants } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  cn,
  formatEventDate,
  formatEventDateFull,
  formatRelativeDateTime,
  formatTime,
  formatTimeRange,
} from '@/lib/utils/index';
import { createStegaAttribute } from '@/sanity/lib/client';
import EventRegistrationModal from './EventRegistrationModal';

// Context for registration modal
interface RegistrationContext {
  openRegistration: (event: CollectionEvent, eventUrl: string) => void;
}
const RegistrationContext = createContext<RegistrationContext | null>(null);
const useRegistration = () => useContext(RegistrationContext);

// Form field type
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

// Types
interface CollectionEvent {
  _id: string;
  _type: 'collection.events';
  metadata: {
    title: string;
    slug: { current: string };
    description?: string;
    image?: Sanity.Image;
  };
  eventType: 'webinar' | 'video' | 'physical' | 'hybrid';
  status: 'upcoming' | 'live' | 'completed';
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

interface EventsFrontpageClientProps {
  events: CollectionEvent[];
  defaultLayout: 'calendar' | 'cards' | 'list' | 'timeline';
  collectionSlug: string;
  intro?: React.ReactNode;
  showRssLink?: boolean;
}

type LayoutType = 'calendar' | 'cards' | 'list' | 'timeline';

// Event type config - brand-aligned colors
const eventTypeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  webinar: {
    icon: <Monitor className="size-3.5" />,
    label: 'Webinar',
    color: 'bg-primary/10 text-primary', // Brand purple
  },
  video: {
    icon: <Video className="size-3.5" />,
    label: 'Video',
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  },
  physical: {
    icon: <MapPin className="size-3.5" />,
    label: 'In-Person',
    color: 'bg-muted text-foreground',
  },
  hybrid: {
    icon: <Radio className="size-3.5" />,
    label: 'Hybrid',
    color: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
  },
};

// Status config with badge styling (computed from dates, not stored in Sanity)
const statusConfig: Record<
  string,
  { label: string; color: string; badgeColor: string; dot?: boolean }
> = {
  upcoming: {
    label: 'Upcoming',
    color: 'text-primary',
    badgeColor: 'bg-primary/10 text-primary',
  },
  live: {
    label: 'Live Now',
    color: 'text-red-600 dark:text-red-400',
    badgeColor: 'bg-red-500/15 text-red-700 dark:text-red-400',
    dot: true,
  },
  completed: {
    label: 'Past',
    color: 'text-muted-foreground',
    badgeColor: 'bg-muted text-muted-foreground',
  },
};

// Compute event status from dates (not stored in Sanity)
function computeEventStatus(
  startDateTime: string,
  durationHours?: number
): 'upcoming' | 'live' | 'completed' {
  const now = new Date();
  const start = new Date(startDateTime);
  const durationMs = (durationHours || 1) * 60 * 60 * 1000; // Default 1 hour
  const end = new Date(start.getTime() + durationMs);

  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'completed';
}

// Add computed status to event
function withComputedStatus(event: CollectionEvent): CollectionEvent {
  return {
    ...event,
    status: computeEventStatus(event.startDateTime, event.duration),
  };
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Get status label with translation
function getStatusLabel(
  status: string,
  t: ReturnType<typeof useTranslations<'modules.events'>>
): string {
  if (status === 'upcoming') return t('upcoming');
  if (status === 'live') return t('liveNow');
  if (status === 'completed') return t('past');
  return statusConfig[status]?.label || status;
}

// Status badge component - shows event status
function StatusBadge({ status, size = 'default' }: { status: string; size?: 'small' | 'default' }) {
  const t = useTranslations('modules.events');
  const config = statusConfig[status] || statusConfig.upcoming;
  const sizeClasses = size === 'small' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs';
  const label = getStatusLabel(status, t);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-medium',
        sizeClasses,
        config.badgeColor
      )}
    >
      {config.dot && <span className="size-1.5 animate-pulse rounded-full bg-current" />}
      {label}
    </span>
  );
}

// Event type badge component
function EventTypeBadge({
  eventType,
  size = 'default',
}: {
  eventType: string;
  size?: 'small' | 'default';
}) {
  const type = eventTypeConfig[eventType] || eventTypeConfig.webinar;
  const sizeClasses =
    size === 'small' ? 'px-1.5 py-0.5 text-[10px] gap-1' : 'px-2 py-0.5 text-xs gap-1';

  return (
    <span
      className={cn('inline-flex items-center rounded-md font-medium', sizeClasses, type.color)}
    >
      {type.icon}
      {type.label}
    </span>
  );
}

// Speaker avatars component
function SpeakerAvatars({
  speakers,
  maxShow = 3,
}: {
  speakers: Sanity.Person[];
  maxShow?: number;
}) {
  const t = useTranslations('modules.events');

  if (!speakers || speakers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex -space-x-1.5">
        {speakers.slice(0, maxShow).map((speaker) =>
          speaker.image ? (
            <Img
              key={speaker._id}
              image={speaker.image}
              className="size-6 rounded-full object-cover ring-2 ring-background"
              sizes="24px"
              alt={speaker.name || ''}
            />
          ) : (
            <div
              key={speaker._id}
              className="size-6 rounded-full bg-muted flex items-center justify-center ring-2 ring-background"
            >
              <Users className="size-3 text-muted-foreground" />
            </div>
          )
        )}
      </div>
      <span className="text-xs text-muted-foreground truncate">
        {speakers.length === 1 ? speakers[0].name : t('speakers', { count: speakers.length })}
      </span>
    </div>
  );
}

// Event action buttons component
function EventActions({
  event,
  collectionSlug,
  showViewDetails = true,
}: {
  event: CollectionEvent;
  collectionSlug: string;
  showViewDetails?: boolean;
}) {
  const t = useTranslations('modules.events');
  const registration = useRegistration();
  const href = `/${collectionSlug}/${event.metadata?.slug?.current}`;
  const canRegister =
    event.registrationForm && (event.status === 'upcoming' || event.status === 'live');

  return (
    <div className="flex items-center gap-2 shrink-0">
      {showViewDetails && (
        <Link href={href} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          {t('viewDetails')}
        </Link>
      )}
      {canRegister && registration && (
        <Button
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            registration.openRegistration(event, href);
          }}
        >
          <Users className="mr-1.5 size-3.5" />
          {t('registerNow')}
        </Button>
      )}
    </div>
  );
}

// Get relative date color based on status
function getRelativeDateColor(status: string): string {
  if (status === 'live') return 'text-red-600 dark:text-red-400';
  if (status === 'upcoming') return 'text-primary';
  return 'text-muted-foreground';
}

// Relative date display component
function RelativeDate({
  startDateTime,
  status,
  locale,
  className,
  stegaPath,
}: {
  startDateTime: string;
  status: string;
  locale?: string;
  className?: string;
  stegaPath?: string;
}) {
  return (
    <span
      className={cn('font-semibold', getRelativeDateColor(status), className)}
      data-sanity={stegaPath}
    >
      {formatRelativeDateTime(startDateTime, locale)}
    </span>
  );
}

// Date box component - shows day and month
function DateBox({
  date,
  locale,
  image,
  isPast,
  stegaPath,
}: {
  date: Date;
  locale: string;
  image?: Sanity.Image;
  isPast: boolean;
  stegaPath?: string;
}) {
  if (image) {
    return (
      <div
        className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden"
        data-sanity={stegaPath}
      >
        <Img
          image={image}
          className={cn('absolute inset-0 size-full object-cover', isPast && 'grayscale-[30%]')}
          sizes="64px"
          alt=""
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative flex h-full flex-col items-center justify-center text-white">
          <span className="text-xl font-bold leading-none">{date.getDate()}</span>
          <span className="text-[10px] font-medium uppercase tracking-wide mt-0.5">
            {date.toLocaleDateString(locale, { month: 'short' })}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg text-center',
        isPast ? 'bg-muted/50' : 'bg-primary/10'
      )}
    >
      <span
        className={cn(
          'text-xl font-bold leading-none',
          isPast ? 'text-muted-foreground' : 'text-primary'
        )}
      >
        {date.getDate()}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mt-0.5">
        {date.toLocaleDateString(locale, { month: 'short' })}
      </span>
    </div>
  );
}

// Compact register button for grid cards
function CompactRegisterButton({
  event,
  collectionSlug,
}: {
  event: CollectionEvent;
  collectionSlug: string;
}) {
  const t = useTranslations('modules.events');
  const registration = useRegistration();
  const href = `/${collectionSlug}/${event.metadata?.slug?.current}`;
  const canRegister =
    event.registrationForm && (event.status === 'upcoming' || event.status === 'live');

  if (!canRegister || !registration) return null;

  return (
    <Button
      size="sm"
      className="mt-3 w-full h-8 text-xs"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        registration.openRegistration(event, href);
      }}
    >
      <Users className="mr-1 size-3" />
      {t('registerNow')}
    </Button>
  );
}

// Date badge overlay for grid cards
function DateBadgeOverlay({ date, locale }: { date: Date; locale: string }) {
  return (
    <div className="absolute left-2 top-2 rounded-md bg-background/90 backdrop-blur px-2 py-1 text-center shadow-sm">
      <div className="text-lg font-bold leading-none">{date.getDate()}</div>
      <div className="text-[10px] font-medium uppercase text-muted-foreground">
        {date.toLocaleDateString(locale, { month: 'short' })}
      </div>
    </div>
  );
}

// Time and location row component
function TimeLocationRow({
  startDateTime,
  duration,
  location,
  locale,
  showCalendarIcon = false,
  stegaDatePath,
  stegaLocationPath,
}: {
  startDateTime: string;
  duration?: number;
  location?: { venue?: string; city?: string; country?: string };
  locale: string;
  showCalendarIcon?: boolean;
  stegaDatePath?: string;
  stegaLocationPath?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {showCalendarIcon && (
        <span className="inline-flex items-center gap-1" data-sanity={stegaDatePath}>
          <CalendarIcon className="size-3.5" />
          {formatEventDate(startDateTime, locale)}
        </span>
      )}
      <span className="inline-flex items-center gap-1">
        <Clock className="size-3.5" />
        {formatTimeRange(startDateTime, duration, locale)}
      </span>
      {location?.city && (
        <span className="inline-flex items-center gap-1" data-sanity={stegaLocationPath}>
          <MapPin className="size-3.5" />
          {location.city}
        </span>
      )}
    </div>
  );
}

// Event CTA button - handles registration modal or view details
function _EventCTA({
  event,
  collectionSlug,
  size = 'default',
  variant = 'default',
  className,
}: {
  event: CollectionEvent;
  collectionSlug: string;
  size?: 'default' | 'sm';
  variant?: 'default' | 'secondary';
  className?: string;
}) {
  const t = useTranslations('modules.events');
  const registration = useRegistration();
  const eventUrl = `/${collectionSlug}/${event.metadata?.slug?.current}`;
  const isUpcoming = event.status === 'upcoming' || event.status === 'live';

  // For upcoming events with registration form, show register modal
  if (event.registrationForm && isUpcoming && registration) {
    return (
      <Button
        size={size}
        variant={variant}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          registration.openRegistration(event, eventUrl);
        }}
      >
        <Users className="mr-1.5 size-3.5" />
        {t('registerNow')}
      </Button>
    );
  }

  // For all events (no registration, completed, etc.), show view details
  return (
    <Link href={eventUrl} className={buttonVariants({ variant: 'ghost', size, className })}>
      {t('viewDetails')}
    </Link>
  );
}

// Layout selector - dropdown on mobile, button group on larger screens
function LayoutSelector({
  current,
  onChange,
}: {
  current: LayoutType;
  onChange: (layout: LayoutType) => void;
}) {
  const t = useTranslations('modules.events');

  const layouts: { value: LayoutType; icon: React.ReactNode; labelKey: string }[] = [
    { value: 'calendar', icon: <CalendarIcon className="size-4" />, labelKey: 'calendar' },
    { value: 'cards', icon: <Grid className="size-4" />, labelKey: 'grid' },
    { value: 'list', icon: <List className="size-4" />, labelKey: 'list' },
    { value: 'timeline', icon: <Radio className="size-4" />, labelKey: 'timeline' },
  ];

  const currentLayout = layouts.find((l) => l.value === current);

  return (
    <>
      {/* Mobile: Dropdown select */}
      <div className="sm:hidden">
        <Select value={current} onValueChange={(value) => onChange(value as LayoutType)}>
          <SelectTrigger size="sm" className="w-[140px]">
            <SelectValue>
              {currentLayout?.icon}
              <span>{t(`layouts.${currentLayout?.labelKey}`)}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            {layouts.map(({ value, icon, labelKey }) => (
              <SelectItem key={value} value={value}>
                {icon}
                <span>{t(`layouts.${labelKey}`)}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Button group */}
      <ButtonGroup className="hidden sm:inline-flex rounded-lg border bg-card p-1">
        {layouts.map(({ value, icon, labelKey }) => {
          const label = t(`layouts.${labelKey}`);
          return (
            <Button
              key={value}
              variant={current === value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onChange(value)}
              className={cn(
                'gap-1.5',
                current !== value && 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={label}
            >
              {icon}
              <span>{label}</span>
            </Button>
          );
        })}
      </ButtonGroup>
    </>
  );
}

// Event slot item for calendar view (calendar-31 style) - with image support
function _EventSlotItem({
  event,
  collectionSlug,
}: {
  event: CollectionEvent;
  collectionSlug: string;
}) {
  const t = useTranslations('modules.events');
  const locale = useLocale();
  const href = `/${collectionSlug}/${event.metadata?.slug?.current}`;
  const type = eventTypeConfig[event.eventType] || eventTypeConfig.webinar;
  const isPast = event.status === 'completed';
  const registration = useRegistration();
  const canRegister =
    event.registrationForm && (event.status === 'upcoming' || event.status === 'live');

  // Visual editing support
  const stega = createStegaAttribute({
    id: event._id,
    type: event._type,
  });

  // Get accent color based on status - use brand primary for upcoming
  const accentColor =
    event.status === 'live'
      ? 'after:bg-red-500'
      : event.status === 'upcoming'
        ? 'after:bg-primary'
        : 'after:bg-muted-foreground/50';

  return (
    <div
      className={cn(
        'group relative flex gap-3 rounded-lg border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-sm after:absolute after:inset-y-3 after:left-0 after:w-1 after:rounded-full',
        accentColor,
        isPast && 'opacity-70 hover:opacity-100'
      )}
    >
      {/* Image thumbnail */}
      {event.metadata?.image && (
        <Link
          href={href}
          className="relative shrink-0 w-16 h-16 rounded-md overflow-hidden"
          data-sanity={stega.scope('metadata.image').toString()}
        >
          <Img
            image={event.metadata.image}
            className={cn(
              'size-full object-cover transition-transform duration-300 group-hover:scale-105',
              isPast && 'grayscale-[30%]'
            )}
            sizes="64px"
            alt={event.metadata?.title || ''}
          />
        </Link>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium',
                type.color
              )}
            >
              {type.icon}
              {type.label}
            </span>
          </div>
          {/* Relative date - prominent */}
          <span
            className={cn(
              'text-xs font-medium',
              event.status === 'live' ? 'text-red-600 dark:text-red-400' : 'text-primary'
            )}
            data-sanity={stega.scope('startDateTime').toString()}
          >
            {formatRelativeDateTime(event.startDateTime, locale)}
          </span>
        </div>
        <Link href={href}>
          <div
            className={cn(
              'font-medium line-clamp-1 group-hover:text-primary',
              isPast && 'text-muted-foreground'
            )}
            data-sanity={stega.scope('metadata.title').toString()}
          >
            {event.metadata?.title}
          </div>
        </Link>
        <div className="text-muted-foreground text-xs mt-0.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {formatEventDate(event.startDateTime, locale)} ·{' '}
            {formatTime(event.startDateTime, locale)}
          </span>
          {event.location?.city && (
            <span
              className="inline-flex items-center gap-1"
              data-sanity={stega.scope('location').toString()}
            >
              <MapPin className="size-3" />
              {event.location.city}
            </span>
          )}
        </div>

        {/* Registration button for upcoming events */}
        {canRegister && registration && (
          <div className="mt-2">
            <Button
              size="sm"
              variant="default"
              className="h-7 text-xs"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                registration.openRegistration(event, href);
              }}
            >
              <Users className="mr-1 size-3" />
              {t('registerNow')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Rich event card for calendar view - image as date background
function CalendarEventCard({
  event,
  collectionSlug,
}: {
  event: CollectionEvent;
  collectionSlug: string;
}) {
  const locale = useLocale();
  const href = `/${collectionSlug}/${event.metadata?.slug?.current}`;
  const isPast = event.status === 'completed';
  const eventDate = new Date(event.startDateTime);

  const stega = createStegaAttribute({ id: event._id, type: event._type });

  return (
    <div
      className={cn(
        'group rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm',
        isPast && 'opacity-75 hover:opacity-100'
      )}
    >
      <div className="flex gap-4">
        <Link href={href}>
          <DateBox
            date={eventDate}
            locale={locale}
            image={event.metadata?.image}
            isPast={isPast}
            stegaPath={stega.scope('metadata.image').toString()}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
            <EventTypeBadge eventType={event.eventType} size="small" />
            <RelativeDate
              startDateTime={event.startDateTime}
              status={event.status}
              locale={locale}
              className="text-xs"
              stegaPath={stega.scope('startDateTime').toString()}
            />
          </div>
          <Link href={href}>
            <h4
              className={cn(
                'font-semibold transition-colors group-hover:text-primary line-clamp-1',
                isPast ? 'text-muted-foreground' : 'text-foreground'
              )}
              data-sanity={stega.scope('metadata.title').toString()}
            >
              {event.metadata?.title}
            </h4>
          </Link>
          <div className="mt-1">
            <TimeLocationRow
              startDateTime={event.startDateTime}
              duration={event.duration}
              location={event.location}
              locale={locale}
              stegaLocationPath={stega.scope('location').toString()}
            />
          </div>
        </div>
      </div>
      {event.metadata?.description && (
        <p
          className="mt-3 text-sm text-muted-foreground line-clamp-2"
          data-sanity={stega.scope('metadata.description').toString()}
        >
          {event.metadata.description}
        </p>
      )}
      <div className="mt-3 pt-3 border-t flex items-center justify-between gap-4">
        {event.speakers && event.speakers.length > 0 ? (
          <SpeakerAvatars speakers={event.speakers} />
        ) : (
          <div />
        )}
        <EventActions event={event} collectionSlug={collectionSlug} />
      </div>
    </div>
  );
}

// Calendar view with shadcn calendar (calendar-31 style)
function CalendarView({
  events,
  collectionSlug,
}: {
  events: CollectionEvent[];
  collectionSlug: string;
}) {
  const t = useTranslations('modules.events');
  const locale = useLocale();
  const today = new Date();

  // Mobile calendar visibility toggle (hidden by default on mobile)
  const [showCalendar, setShowCalendar] = useState(false);

  // Find the next upcoming event to use as initial state
  const nextUpcomingEvent = useMemo(() => {
    const now = new Date();
    const upcoming = events
      .filter((e) => new Date(e.startDateTime) >= now)
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
    return upcoming[0];
  }, [events]);

  // Initialize to next event's date, or today if no upcoming events
  const initialDate = nextUpcomingEvent ? new Date(nextUpcomingEvent.startDateTime) : today;

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [calendarMonth, setCalendarMonth] = useState<Date>(initialDate);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // All events sorted by date
  const sortedEvents = useMemo(() => {
    return [...events].sort(
      (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
    );
  }, [events]);

  // Upcoming events only
  const upcomingEventsList = useMemo(() => {
    const now = new Date();
    return sortedEvents.filter((e) => new Date(e.startDateTime) >= now);
  }, [sortedEvents]);

  // Create modifiers for days with events
  const eventDays = useMemo(() => {
    return events.map((e) => new Date(e.startDateTime));
  }, [events]);

  // Get the next event from the selected date (including events on that date)
  const nextEventFromDate = useMemo(() => {
    const selectedDateStart = new Date(selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);

    return sortedEvents.find((event) => {
      const eventDate = new Date(event.startDateTime);
      return eventDate >= selectedDateStart;
    });
  }, [selectedDate, sortedEvents]);

  // Events for selected date (for showing on the same day)
  const selectedDateEvents = useMemo(() => {
    return events.filter((event) => isSameDay(new Date(event.startDateTime), selectedDate));
  }, [selectedDate, events]);

  const jumpToToday = () => {
    const now = new Date();
    setSelectedDate(now);
    setCalendarMonth(now);
    setCurrentEventIndex(0);
  };

  const cycleToNextEvent = () => {
    if (upcomingEventsList.length === 0) {
      return;
    }

    // Calculate next index (wrap around to 0 after reaching end)
    const nextIndex = (currentEventIndex + 1) % upcomingEventsList.length;
    const nextEvent = upcomingEventsList[nextIndex];
    const eventDate = new Date(nextEvent.startDateTime);

    setSelectedDate(eventDate);
    setCalendarMonth(eventDate);
    setCurrentEventIndex(nextIndex);
  };

  // Simple month navigation
  const goToPreviousMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthLabel = calendarMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  return (
    <div className="grid gap-4 md:gap-6 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
      {/* Left side: Calendar - collapsible on mobile */}
      <div className="space-y-4">
        {/* Mobile toggle button - only visible below md breakpoint */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-full md:hidden"
        >
          <CalendarIcon className="size-4 mr-2" />
          {showCalendar ? t('hideCalendar') : t('showCalendar')}
          <ChevronRight
            className={cn('size-4 ml-auto transition-transform', showCalendar && 'rotate-90')}
          />
        </Button>

        {/* Calendar card - hidden on mobile unless toggled, always visible md+ */}
        <Card className={cn('md:block', showCalendar ? 'block' : 'hidden')}>
          <CardContent className="p-3 md:p-4">
            {/* Month navigation header */}
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                aria-label={t('previousMonth')}
              >
                <ChevronLeft className="size-4 md:size-5" />
              </button>
              <span className="text-sm font-semibold">{monthLabel}</span>
              <button
                type="button"
                onClick={goToNextMonth}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                aria-label={t('nextMonth')}
              >
                <ChevronRight className="size-4 md:size-5" />
              </button>
            </div>

            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              className="bg-transparent p-0 w-full"
              hideNavigation
              classNames={{
                month_caption: 'hidden', // Hide default caption, using custom header
              }}
              disabled={(date) => !eventDays.some((eventDay) => isSameDay(eventDay, date))}
              modifiers={{
                hasEvent: eventDays,
              }}
              modifiersClassNames={{
                hasEvent:
                  'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:size-1 after:rounded-full after:bg-primary',
              }}
            />
          </CardContent>

          {/* Quick navigation */}
          <CardFooter className="flex flex-col gap-2 md:gap-3 border-t px-3 md:px-4 py-3 md:py-4">
            {/* Event count */}
            <div className="flex w-full items-center justify-between">
              <span className="text-xs md:text-sm font-medium text-muted-foreground">
                {t('upcomingEventCount', { count: upcomingEventsList.length })}
              </span>
            </div>

            {/* Today + Next Event buttons */}
            <ButtonGroup className="w-full pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={jumpToToday}
                className={cn('flex-1 text-xs', isSameDay(selectedDate, today) && 'bg-accent')}
              >
                <CalendarIcon className="size-3 mr-1" />
                {t('today')}
              </Button>
              {upcomingEventsList.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cycleToNextEvent}
                  className="flex-1 text-xs"
                >
                  <Clock className="size-3 mr-1" />
                  {t('nextEvent')}
                </Button>
              )}
            </ButtonGroup>
          </CardFooter>
        </Card>
      </div>

      {/* Right side: Events from selected date */}
      <div className="space-y-6">
        {/* Header shows selected date or next event date */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            {selectedDateEvents.length > 0 ? (
              <>
                {formatEventDateFull(selectedDate.toISOString(), locale)}
                {isSameDay(selectedDate, today) && (
                  <span className="ml-2 text-sm text-primary font-medium">({t('today')})</span>
                )}
              </>
            ) : nextEventFromDate ? (
              <>
                {t('nextEvent')}: {formatEventDateFull(nextEventFromDate.startDateTime, locale)}
              </>
            ) : (
              formatEventDateFull(selectedDate.toISOString(), locale)
            )}
          </h3>
          {selectedDateEvents.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {t('eventCount', { count: selectedDateEvents.length })}
            </span>
          )}
        </div>

        {/* Events for selected date OR next event from that date */}
        {selectedDateEvents.length > 0 ? (
          <div className="space-y-4">
            {selectedDateEvents.map((event) => (
              <CalendarEventCard key={event._id} event={event} collectionSlug={collectionSlug} />
            ))}
          </div>
        ) : nextEventFromDate ? (
          <div className="space-y-4">
            <CalendarEventCard event={nextEventFromDate} collectionSlug={collectionSlug} />
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarIcon className="mb-3 size-10 text-muted-foreground/30" />
              <p className="font-medium text-muted-foreground">{t('noEventsOnDate')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Event slot component for list views - with image support
function EventSlot({ event, collectionSlug }: { event: CollectionEvent; collectionSlug: string }) {
  const locale = useLocale();
  const href = `/${collectionSlug}/${event.metadata?.slug?.current}`;
  const isPast = event.status === 'completed';
  const stega = createStegaAttribute({ id: event._id, type: event._type });

  return (
    <div
      className={cn(
        'group flex flex-col sm:flex-row items-stretch gap-4 rounded-lg border bg-card overflow-hidden transition-all hover:border-primary/50 hover:shadow-sm',
        isPast && 'opacity-75 hover:opacity-100'
      )}
    >
      {event.metadata?.image && (
        <Link
          href={href}
          className="relative shrink-0 sm:w-48 aspect-video sm:aspect-[4/3]"
          data-sanity={stega.scope('metadata.image').toString()}
        >
          <Img
            image={event.metadata.image}
            className={cn(
              'size-full object-cover transition-transform duration-300 group-hover:scale-105',
              isPast && 'grayscale-[30%]'
            )}
            sizes="(min-width: 640px) 192px, 100vw"
            alt={event.metadata?.title || ''}
          />
          <div className="absolute left-2 top-2">
            <StatusBadge status={event.status} size="small" />
          </div>
        </Link>
      )}
      <div className="flex flex-1 flex-col justify-between p-4 sm:py-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {!event.metadata?.image && <StatusBadge status={event.status} />}
            <EventTypeBadge eventType={event.eventType} />
          </div>
          <Link href={href}>
            <h4
              className={cn(
                'line-clamp-2 font-semibold transition-colors group-hover:text-primary',
                isPast ? 'text-muted-foreground' : 'text-foreground'
              )}
              data-sanity={stega.scope('metadata.title').toString()}
            >
              {event.metadata?.title}
            </h4>
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <TimeLocationRow
              startDateTime={event.startDateTime}
              duration={event.duration}
              location={event.location}
              locale={locale}
              showCalendarIcon
              stegaDatePath={stega.scope('startDateTime').toString()}
              stegaLocationPath={stega.scope('location').toString()}
            />
            <RelativeDate
              startDateTime={event.startDateTime}
              status={event.status}
              locale={locale}
              className="ml-auto text-sm"
            />
          </div>
          {event.metadata?.description && (
            <p
              className="mt-2 line-clamp-2 text-sm text-muted-foreground"
              data-sanity={stega.scope('metadata.description').toString()}
            >
              {event.metadata.description}
            </p>
          )}
          {event.speakers && event.speakers.length > 0 && (
            <div className="mt-3">
              <SpeakerAvatars speakers={event.speakers} />
            </div>
          )}
        </div>
        <div className="mt-3">
          <EventActions event={event} collectionSlug={collectionSlug} />
        </div>
      </div>
    </div>
  );
}

// Event card for grid view - compact design
function EventCard({ event, collectionSlug }: { event: CollectionEvent; collectionSlug: string }) {
  const locale = useLocale();
  const href = `/${collectionSlug}/${event.metadata?.slug?.current}`;
  const isPast = event.status === 'completed';
  const eventDate = new Date(event.startDateTime);
  const stega = createStegaAttribute({ id: event._id, type: event._type });

  return (
    <Link
      href={href}
      className={cn(
        'group block rounded-lg border bg-card overflow-hidden transition-all hover:border-primary/50 hover:shadow-sm',
        isPast && 'opacity-70 hover:opacity-100'
      )}
    >
      <div
        className="relative aspect-[16/10] bg-muted"
        data-sanity={stega.scope('metadata.image').toString()}
      >
        {event.metadata?.image ? (
          <Img
            image={event.metadata.image}
            className={cn(
              'size-full object-cover transition-transform duration-300 group-hover:scale-105',
              isPast && 'grayscale-[30%]'
            )}
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            alt={event.metadata?.title || ''}
          />
        ) : (
          <div className="size-full flex items-center justify-center">
            <CalendarIcon className="size-8 text-muted-foreground/30" />
          </div>
        )}
        <DateBadgeOverlay date={eventDate} locale={locale} />
        {event.status !== 'completed' && (
          <div className="absolute right-2 top-2">
            <StatusBadge status={event.status} size="small" />
          </div>
        )}
        <div className="absolute bottom-2 left-2">
          <EventTypeBadge eventType={event.eventType} size="small" />
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <RelativeDate
            startDateTime={event.startDateTime}
            status={event.status}
            locale={locale}
            className="text-xs"
            stegaPath={stega.scope('startDateTime').toString()}
          />
        </div>
        <h4
          className={cn(
            'font-medium line-clamp-2 text-sm group-hover:text-primary transition-colors',
            isPast && 'text-muted-foreground'
          )}
          data-sanity={stega.scope('metadata.title').toString()}
        >
          {event.metadata?.title}
        </h4>
        {event.metadata?.description && (
          <p
            className="mt-1.5 text-xs text-muted-foreground line-clamp-2"
            data-sanity={stega.scope('metadata.description').toString()}
          >
            {event.metadata.description}
          </p>
        )}
        <div className="mt-2">
          <TimeLocationRow
            startDateTime={event.startDateTime}
            location={event.location}
            locale={locale}
            stegaLocationPath={stega.scope('location').toString()}
          />
        </div>
        {event.speakers && event.speakers.length > 0 && (
          <div className="mt-2">
            <SpeakerAvatars speakers={event.speakers} />
          </div>
        )}
        <CompactRegisterButton event={event} collectionSlug={collectionSlug} />
      </div>
    </Link>
  );
}

// Cards grid with month grouping
function CardsGrid({
  events,
  collectionSlug,
}: {
  events: CollectionEvent[];
  collectionSlug: string;
}) {
  const locale = useLocale();

  // Group events by month
  const eventsByMonth = useMemo(() => {
    const grouped = new Map<string, CollectionEvent[]>();
    for (const event of events) {
      const date = new Date(event.startDateTime);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      grouped.get(monthKey)?.push(event);
    }
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, evts]) => ({
        key,
        label: new Date(evts[0].startDateTime).toLocaleDateString(locale, {
          month: 'long',
          year: 'numeric',
        }),
        events: evts,
      }));
  }, [events, locale]);

  return (
    <div className="space-y-6 md:space-y-8">
      {eventsByMonth.map(({ key, label, events: monthEvents }) => (
        <div key={key}>
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4 sticky top-20 bg-background/95 backdrop-blur py-2 z-10 border-b border-border">
            {label}
          </h3>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {monthEvents.map((event) => (
              <EventCard key={event._id} event={event} collectionSlug={collectionSlug} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// List view with month grouping
function ListView({
  events,
  collectionSlug,
}: {
  events: CollectionEvent[];
  collectionSlug: string;
}) {
  const locale = useLocale();

  // Group events by month
  const eventsByMonth = useMemo(() => {
    const grouped = new Map<string, CollectionEvent[]>();
    for (const event of events) {
      const date = new Date(event.startDateTime);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      grouped.get(monthKey)?.push(event);
    }
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, evts]) => ({
        key,
        label: new Date(evts[0].startDateTime).toLocaleDateString(locale, {
          month: 'long',
          year: 'numeric',
        }),
        events: evts,
      }));
  }, [events, locale]);

  return (
    <div className="space-y-6 md:space-y-8">
      {eventsByMonth.map(({ key, label, events: monthEvents }) => (
        <div key={key}>
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4 sticky top-20 bg-background/95 backdrop-blur py-2 z-10 border-b border-border">
            {label}
          </h3>
          <div className="space-y-3">
            {monthEvents.map((event) => (
              <EventSlot key={event._id} event={event} collectionSlug={collectionSlug} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Timeline dot component
function TimelineDot({ status, isPast }: { status: string; isPast: boolean }) {
  return (
    <div
      className={cn(
        'absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-background',
        status === 'live' && 'animate-pulse bg-red-500',
        status === 'upcoming' && 'bg-primary',
        isPast && 'bg-muted-foreground/50'
      )}
    />
  );
}

// Timeline event card component
function TimelineEventCard({
  event,
  collectionSlug,
}: {
  event: CollectionEvent;
  collectionSlug: string;
}) {
  const locale = useLocale();
  const href = `/${collectionSlug}/${event.metadata?.slug?.current}`;
  const isPast = event.status === 'completed';
  const stega = createStegaAttribute({ id: event._id, type: event._type });

  return (
    <article className="relative pb-8 last:pb-0">
      <TimelineDot status={event.status} isPast={isPast} />
      <div
        className={cn(
          'group rounded-xl border bg-card overflow-hidden transition-all hover:border-primary/50 hover:shadow-md',
          isPast && 'opacity-75 hover:opacity-100'
        )}
      >
        {event.metadata?.image && (
          <Link
            href={href}
            className="block aspect-video overflow-hidden"
            data-sanity={stega.scope('metadata.image').toString()}
          >
            <Img
              image={event.metadata.image}
              className={cn(
                'size-full object-cover transition-transform duration-300 group-hover:scale-105',
                isPast && 'grayscale-[30%]'
              )}
              sizes="(min-width: 768px) 600px, 100vw"
              alt={event.metadata?.title || ''}
            />
          </Link>
        )}
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <StatusBadge status={event.status} />
            <EventTypeBadge eventType={event.eventType} />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mb-3">
            <TimeLocationRow
              startDateTime={event.startDateTime}
              duration={event.duration}
              location={event.location}
              locale={locale}
              showCalendarIcon
              stegaDatePath={stega.scope('startDateTime').toString()}
              stegaLocationPath={stega.scope('location').toString()}
            />
            <RelativeDate
              startDateTime={event.startDateTime}
              status={event.status}
              locale={locale}
              className="ml-auto"
            />
          </div>
          <Link href={href}>
            <h4
              className={cn(
                'font-semibold text-lg transition-colors group-hover:text-primary',
                isPast ? 'text-muted-foreground' : 'text-foreground'
              )}
              data-sanity={stega.scope('metadata.title').toString()}
            >
              {event.metadata?.title}
            </h4>
          </Link>
          {event.metadata?.description && (
            <p
              className="mt-2 line-clamp-2 text-sm text-muted-foreground"
              data-sanity={stega.scope('metadata.description').toString()}
            >
              {event.metadata.description}
            </p>
          )}
          {event.speakers && event.speakers.length > 0 && (
            <div className="mt-4">
              <SpeakerAvatars speakers={event.speakers} />
            </div>
          )}
          <div className="mt-4 pt-4 border-t">
            <EventActions event={event} collectionSlug={collectionSlug} />
          </div>
        </div>
      </div>
    </article>
  );
}

// Timeline view with month segmentation
function TimelineView({
  events,
  collectionSlug,
}: {
  events: CollectionEvent[];
  collectionSlug: string;
}) {
  const locale = useLocale();

  // Group events by month
  const eventsByMonth = useMemo(() => {
    const grouped = new Map<string, CollectionEvent[]>();
    for (const event of events) {
      const date = new Date(event.startDateTime);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      grouped.get(monthKey)?.push(event);
    }
    // Sort by month key descending (newest first)
    return Array.from(grouped.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, evts]) => ({
        key,
        label: new Date(evts[0].startDateTime).toLocaleDateString(locale, {
          month: 'long',
          year: 'numeric',
        }),
        events: evts,
      }));
  }, [events, locale]);

  return (
    <div className="space-y-8 md:space-y-10">
      {eventsByMonth.map(({ key, label, events: monthEvents }) => (
        <div key={key}>
          {/* Sticky month header */}
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6 sticky top-20 bg-background/95 backdrop-blur py-2 z-10 border-b border-border">
            {label}
          </h3>

          {/* Timeline with left border - responsive padding */}
          <div className="relative border-l-2 border-border pl-4 sm:pl-6 md:pl-8">
            {monthEvents.map((event) => (
              <TimelineEventCard key={event._id} event={event} collectionSlug={collectionSlug} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty state
function EmptyState() {
  const t = useTranslations('modules.events');
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <CalendarIcon className="mb-4 size-12 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold">{t('noEvents')}</h3>
        <p className="mt-1 text-muted-foreground">{t('noEventsInCollection')}</p>
      </CardContent>
    </Card>
  );
}

// Main component
export default function EventsFrontpageClient({
  events,
  defaultLayout,
  collectionSlug,
  intro,
  showRssLink,
}: EventsFrontpageClientProps) {
  const t = useTranslations('modules.events');
  const [layout, setLayout] = useState<LayoutType>(defaultLayout);

  // Compute status for all events based on current time
  const eventsWithStatus = useMemo(() => events.map(withComputedStatus), [events]);

  // Registration modal state
  const [registrationModal, setRegistrationModal] = useState<{
    open: boolean;
    event: CollectionEvent | null;
    eventUrl: string;
  }>({ open: false, event: null, eventUrl: '' });

  const openRegistration = useCallback((event: CollectionEvent, eventUrl: string) => {
    setRegistrationModal({ open: true, event, eventUrl });
  }, []);

  const closeRegistration = useCallback(() => {
    setRegistrationModal({ open: false, event: null, eventUrl: '' });
  }, []);

  return (
    <RegistrationContext.Provider value={{ openRegistration }}>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-4">
          {/* Intro section */}
          {intro && <div>{intro}</div>}

          {/* Controls - centered on mobile, right-aligned on desktop */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <LayoutSelector current={layout} onChange={setLayout} />
            {showRssLink && (
              <Link
                href={`/${collectionSlug}/rss.xml`}
                target="_blank"
                rel="noopener noreferrer"
                title={t('rss')}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                <Rss className="size-4" />
                <span className="sr-only">{t('rss')}</span>
              </Link>
            )}
          </div>
        </header>

        {/* Content */}
        {!eventsWithStatus || eventsWithStatus.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {layout === 'calendar' && (
              <CalendarView events={eventsWithStatus} collectionSlug={collectionSlug} />
            )}
            {layout === 'cards' && (
              <CardsGrid events={eventsWithStatus} collectionSlug={collectionSlug} />
            )}
            {layout === 'list' && (
              <ListView events={eventsWithStatus} collectionSlug={collectionSlug} />
            )}
            {layout === 'timeline' && (
              <TimelineView events={eventsWithStatus} collectionSlug={collectionSlug} />
            )}
          </>
        )}
      </div>

      {/* Registration Modal */}
      {registrationModal.event && (
        <EventRegistrationModal
          open={registrationModal.open}
          onOpenChange={(open) => !open && closeRegistration()}
          event={registrationModal.event}
          eventUrl={registrationModal.eventUrl}
        />
      )}
    </RegistrationContext.Provider>
  );
}
