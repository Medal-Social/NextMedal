'use client';

import { Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { ConsentLink } from '@/lib/forms/consent-link';
import EventRegistrationModal from './EventRegistrationModal';

// Form field type from Sanity
interface FormField {
  _key: string;
  label: Sanity.InternationalizedArrayString | string;
  name: { current: string };
  type: 'text' | 'email' | 'tel' | 'textarea' | 'checkbox';
  placeholder?: Sanity.InternationalizedArrayString | string;
  required?: boolean;
}

// Registration form type
interface RegistrationForm {
  _id: string;
  formTitle: Sanity.InternationalizedArrayString | string;
  intent: 'contact' | 'lead' | 'newsletter' | 'event' | 'download';
  fields?: FormField[]; // Optional - may not be populated in Sanity
  requireConsent?: boolean;
  acceptance?: {
    required?: boolean;
    text?: Sanity.InternationalizedArrayString | string;
    link?: ConsentLink;
  };
  submitButtonText?: Sanity.InternationalizedArrayString | string;
  successMessage?: Sanity.InternationalizedArrayText | string;
}

interface EventDetailActionsProps {
  event: {
    _id: string;
    metadata: {
      title: string;
    };
    registrationForm?: RegistrationForm;
  };
  status: 'upcoming' | 'live' | 'completed';
  collectionSlug: string;
  eventSlug: string;
}

export default function EventDetailActions({
  event,
  status,
  collectionSlug,
  eventSlug,
}: EventDetailActionsProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Only show registration for upcoming/live events with a registration form
  const canRegister = event.registrationForm && (status === 'upcoming' || status === 'live');

  if (!canRegister) return null;

  const eventUrl = `/${collectionSlug}/${eventSlug}`;

  return (
    <div className="mb-8 flex flex-wrap gap-3">
      <Button size="lg" onClick={() => setModalOpen(true)}>
        <Users className="mr-2 h-4 w-4" />
        {status === 'live' ? 'Join Now' : 'Register Now'}
      </Button>

      <EventRegistrationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        event={event}
        eventUrl={eventUrl}
      />
    </div>
  );
}
