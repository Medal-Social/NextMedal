'use client';

import { Check, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { captureLead } from '@/actions/leads/capture-lead';
import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

interface EventRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    _id: string;
    metadata: {
      title: string;
    };
    registrationForm?: RegistrationForm;
  };
  eventUrl: string;
  onSuccess?: () => void;
}

export default function EventRegistrationModal({
  open,
  onOpenChange,
  event,
  eventUrl,
  onSuccess,
}: EventRegistrationModalProps) {
  const form = event.registrationForm;
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});
  const [success, setSuccess] = useState(false);
  const t = useTranslations('modules.events.registration');
  const tCommon = useTranslations('common');

  const { execute, status, result } = useAction(captureLead, {
    onSuccess: () => {
      setSuccess(true);
      onSuccess?.();
    },
  });

  const isLoading = status === 'executing';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Extract known fields for the lead schema
    const email = formData.email as string;
    const name = formData.name as string | undefined;
    const company = formData.company as string | undefined;
    const phone = formData.phone as string | undefined;
    const consent = formData.consent as boolean | undefined;

    execute({
      email,
      name,
      company,
      phone,
      consent,
      source: {
        type: 'event',
        referenceId: event._id,
        url: eventUrl,
      },
      _honeypot: (formData._honeypot as string) || '',
      _submissionTimestamp: new Date().toISOString(),
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after animation
    setTimeout(() => {
      setSuccess(false);
      setFormData({});
    }, 200);
  };

  const updateField = (fieldName: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {success ? (
          // Success state
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Check className="size-6 text-primary" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl">{t('title')}</DialogTitle>
              {form.successMessage ? (
                <div className="mt-2 text-sm text-muted-foreground">
                  <SharedPortableText value={form.successMessage} />
                </div>
              ) : (
                <DialogDescription className="mt-2">{t('successMessage')}</DialogDescription>
              )}
            </DialogHeader>
            <div className="mt-6">
              <Button variant="outline" onClick={handleClose}>
                {t('close')}
              </Button>
            </div>
          </div>
        ) : (
          // Form state
          <>
            <DialogHeader>
              <DialogTitle>{t('registerFor', { title: event.metadata.title })}</DialogTitle>
              <DialogDescription>{t('formDescription')}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Honeypot field - hidden from users */}
              <input
                type="text"
                name="_honeypot"
                value={(formData._honeypot as string) || ''}
                onChange={(e) => updateField('_honeypot', e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Dynamic fields from form config */}
              {form.fields?.map((field) => {
                const fieldName = field.name.current;
                const value = formData[fieldName] || '';

                if (field.type === 'checkbox') {
                  return (
                    <label key={field._key} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!formData[fieldName]}
                        onChange={(e) => updateField(fieldName, e.target.checked)}
                        disabled={isLoading}
                        className="mt-1 size-4 rounded border-border accent-primary"
                      />
                      <span className="text-sm text-muted-foreground leading-tight">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </span>
                    </label>
                  );
                }

                if (field.type === 'textarea') {
                  return (
                    <div key={field._key} className="space-y-2">
                      <Label htmlFor={fieldName}>
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      <Textarea
                        id={fieldName}
                        placeholder={field.placeholder}
                        value={value as string}
                        onChange={(e) => updateField(fieldName, e.target.value)}
                        required={field.required}
                        disabled={isLoading}
                        rows={3}
                      />
                    </div>
                  );
                }

                return (
                  <div key={field._key} className="space-y-2">
                    <Label htmlFor={fieldName}>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Input
                      id={fieldName}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={value as string}
                      onChange={(e) => updateField(fieldName, e.target.value)}
                      required={field.required}
                      disabled={isLoading}
                    />
                  </div>
                );
              })}

              {/* Acceptance/Consent checkbox */}
              {form.acceptance?.text && (
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.consent}
                    onChange={(e) => updateField('consent', e.target.checked)}
                    required={form.acceptance.required}
                    disabled={isLoading}
                    className="mt-1 size-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm text-muted-foreground leading-tight">
                    {form.acceptance.text}
                    {form.acceptance.required && <span className="text-destructive ml-1">*</span>}
                  </span>
                </label>
              )}

              {/* Error message */}
              {result.serverError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {result.serverError}
                </div>
              )}

              {/* Submit button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {t('registering')}
                  </>
                ) : (
                  form.submitButtonText || tCommon('processing')
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
