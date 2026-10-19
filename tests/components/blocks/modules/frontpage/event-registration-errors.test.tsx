import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ar from '@/messages/ar.json';
import en from '@/messages/en.json';
import nb from '@/messages/nb.json';

const action = vi.hoisted(() => ({ result: {} as Record<string, unknown> }));
vi.mock('@/actions/leads/capture-lead', () => ({ captureLead: vi.fn() }));
vi.mock('next-safe-action/hooks', () => ({
  useAction: () => ({ execute: vi.fn(), status: 'idle', result: action.result }),
}));

import EventRegistrationModal from '@/components/blocks/modules/frontpage/events/EventRegistrationModal';

const MESSAGES = { en, nb, ar } as const;
const event = {
  _id: 'event-1',
  metadata: { title: 'Launch' },
  registrationForm: { _id: 'form-1', formTitle: 'Register', intent: 'event' as const, fields: [] },
};

const renderIn = (locale: keyof typeof MESSAGES) =>
  render(
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
      <EventRegistrationModal open onOpenChange={() => {}} event={event} eventUrl="/events/x" />
    </NextIntlClientProvider>
  );

afterEach(() => {
  action.result = {};
});

describe('event registration: what the visitor sees when sending fails', () => {
  it('a bad email address shows a plain, translated message', () => {
    action.result = { validationErrors: { email: { _errors: ['Invalid email address'] } } };
    renderIn('nb');
    expect(screen.getByRole('alert')).toHaveTextContent(
      nb.modules.events.registration.invalidEmail
    );
  });

  it('sending within three seconds asks the visitor to check and send again', () => {
    action.result = {
      validationErrors: { _submissionTimestamp: { _errors: ['Please take a moment'] } },
    };
    renderIn('ar');
    expect(screen.getByRole('alert')).toHaveTextContent(ar.modules.events.registration.tooFast);
  });

  it('any other validation error shows the general message', () => {
    action.result = { validationErrors: { _honeypot: { _errors: ['x'] } } };
    renderIn('en');
    expect(screen.getByRole('alert')).toHaveTextContent(en.modules.events.registration.checkFields);
  });

  it('a server error still shows the server message', () => {
    action.result = { serverError: "We couldn't send your message right now." };
    renderIn('en');
    expect(screen.getByRole('alert')).toHaveTextContent("We couldn't send your message right now.");
  });

  it('nothing is shown before sending', () => {
    renderIn('en');
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('event registration: the send button', () => {
  it.each(['en', 'nb', 'ar'] as const)('reads "Register" in %s when the form sets no text', (l) => {
    renderIn(l);
    const label = MESSAGES[l].modules.events.registration.submit;
    expect(label).toBeTruthy();
    expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    expect(screen.queryByText(MESSAGES[l].common.processing)).toBeNull();
  });
});
