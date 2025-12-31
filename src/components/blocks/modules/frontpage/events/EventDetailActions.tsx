'use client';

import { Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import EventRegistrationModal from './EventRegistrationModal';

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
  fields?: FormField[]; // Optional - may not be populated in Sanity
  acceptance?: {
    required?: boolean;
    text?: string;
  };
  submitButtonText: string;
  successMessage?: Sanity.BlockContent;
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
    <div className="flex flex-wrap gap-3 mb-8">
      <Button size="lg" onClick={() => setModalOpen(true)}>
        <Users className="w-4 h-4 mr-2" />
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
