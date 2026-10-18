// tests/components/blocks/forms/form-texts.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { getLocalizedValue } from '@/lib/i18n/localized-value';
import en from '@/messages/en.json';

vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
const submitForm = vi.hoisted(() => vi.fn());
vi.mock('@/actions/forms/submit-form', () => ({ submitForm }));
const action = vi.hoisted(() => ({ onSuccess: undefined as undefined | (() => void) }));
vi.mock('@/actions/leads/capture-lead', () => ({ captureLead: vi.fn() }));
vi.mock('next-safe-action/hooks', () => ({
  useAction: (_fn: unknown, opts: { onSuccess: () => void }) => {
    action.onSuccess = opts.onSuccess;
    return { execute: () => action.onSuccess?.(), status: 'idle', result: {} };
  },
}));

import Form from '@/components/blocks/forms/Form';
import EventRegistrationModal from '@/components/blocks/modules/frontpage/events/EventRegistrationModal';

const value = [
  { _key: 'en', value: 'Send' },
  { _key: 'nb', value: 'Send inn' },
];

const renderIn = (ui: ReactElement, locale = 'en') =>
  render(
    <NextIntlClientProvider locale={locale} messages={en}>
      {ui}
    </NextIntlClientProvider>
  );

const baseForm = {
  _id: 'form-1',
  intent: 'contact',
  fields: [
    {
      _key: 'email',
      label: [{ _key: 'en', value: 'Email' }],
      name: { current: 'email' },
      type: 'email' as const,
    },
  ],
};

describe('form texts per language', () => {
  it('picks the visitor language, then English', () => {
    expect(getLocalizedValue(value, 'nb')).toBe('Send inn');
    expect(getLocalizedValue(value, 'ar')).toBe('Send');
  });
  it('still reads the old plain string', () => {
    expect(getLocalizedValue('Submit', 'nb')).toBe('Submit');
  });
});

describe('Form uses the texts editors set', () => {
  it('button reads the send button text in the visitor language', () => {
    renderIn(<Form form={{ ...baseForm, submitButtonText: value }} locale="nb" />, 'nb');
    expect(screen.getByRole('button', { name: 'Send inn' })).toBeTruthy();
  });

  it('button falls back to the standard text', () => {
    renderIn(<Form form={baseForm} locale="en" />);
    expect(screen.getByRole('button', { name: en['contact-form']['submit-button'] })).toBeTruthy();
  });

  it('consent label shows the stored text instead of the standard one', () => {
    renderIn(
      <Form
        form={{
          ...baseForm,
          requireConsent: true,
          acceptance: { text: [{ _key: 'en', value: 'I agree to be contacted' }] },
        }}
        locale="en"
      />
    );
    expect(screen.getByText('I agree to be contacted')).toBeTruthy();
    expect(screen.queryByText(en['contact-form']['privacy-link'])).toBeNull();
  });

  it('consent text links to the chosen page', () => {
    renderIn(
      <Form
        form={{
          ...baseForm,
          requireConsent: true,
          acceptance: {
            text: [{ _key: 'en', value: 'I agree to the terms' }],
            link: {
              type: 'internal',
              internal: { _type: 'page', language: 'en', metadata: { slug: { current: 'terms' } } },
            },
          },
        }}
        locale="en"
      />
    );
    expect(screen.getByRole('link', { name: 'I agree to the terms' }).getAttribute('href')).toBe(
      '/terms'
    );
  });

  it('shows the thank-you message after sending', async () => {
    submitForm.mockResolvedValueOnce({ data: { success: true } });
    renderIn(
      <Form
        form={{ ...baseForm, successMessage: [{ _key: 'en', value: 'Thanks, talk soon' }] }}
        locale="en"
      />
    );
    fireEvent.submit(screen.getByRole('button').closest('form') as HTMLFormElement);
    await waitFor(() => expect(screen.getByText('Thanks, talk soon')).toBeTruthy());
  });

  it('shows the standard thank-you message when none is set', async () => {
    submitForm.mockResolvedValueOnce({ data: { success: true } });
    renderIn(<Form form={baseForm} locale="en" />);
    fireEvent.submit(screen.getByRole('button').closest('form') as HTMLFormElement);
    await waitFor(() =>
      expect(screen.getByText(en['contact-form']['success-message'])).toBeTruthy()
    );
  });
});

describe('event registration uses the texts editors set', () => {
  const event = (form: Record<string, unknown>) => ({
    _id: 'event-1',
    metadata: { title: 'Launch' },
    registrationForm: {
      _id: 'form-1',
      formTitle: 'Register',
      intent: 'lead' as const,
      fields: [],
      ...form,
    },
  });

  it('button and consent read the visitor language', () => {
    renderIn(
      <EventRegistrationModal
        open
        onOpenChange={() => {}}
        eventUrl="/events/launch"
        event={event({
          submitButtonText: value,
          acceptance: {
            text: [
              { _key: 'en', value: 'I agree' },
              { _key: 'nb', value: 'Jeg godtar' },
            ],
          },
        })}
      />,
      'nb'
    );
    expect(screen.getByRole('button', { name: 'Send inn' })).toBeTruthy();
    expect(screen.getByText('Jeg godtar')).toBeTruthy();
  });

  it('shows the thank-you message in the visitor language', async () => {
    renderIn(
      <EventRegistrationModal
        open
        onOpenChange={() => {}}
        eventUrl="/events/launch"
        event={event({
          submitButtonText: 'Submit',
          successMessage: [{ _key: 'en', value: 'See you there' }],
        })}
      />
    );
    fireEvent.submit(
      screen.getByRole('button', { name: 'Submit' }).closest('form') as HTMLFormElement
    );
    await waitFor(() => expect(screen.getByText('See you there')).toBeTruthy());
  });
});
