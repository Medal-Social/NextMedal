'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { submitForm } from '@/lib/actions/submitForm';
import { cn } from '@/lib/utils';
import { validateExternalUrl } from '@/lib/validateExternalUrl';
import resolveSlug from '@/sanity/lib/resolveSlug';
import SharedPortableText from '@/ui/modules/SharedPortableText';

interface FormField {
  _key: string;
  label: string;
  name: { current: string };
  type: 'text' | 'email' | 'tel' | 'textarea' | 'checkbox';
  placeholder?: string;
  required?: boolean;
}

interface FormProps {
  form: {
    intent: string;
    formTitle?: string;
    fields: FormField[];
    submitButtonText: string;
    successMessage?: Sanity.BlockContent;
    acceptance?: {
      required: boolean;
      text: string;
      link?: {
        type: 'internal' | 'external';
        internal?: {
          _type: string;
          metadata?: { slug?: { current: string } };
        };
        external?: string;
        params?: string;
      };
    };
    redirect?: {
      type: 'internal' | 'external';
      internal?: {
        _type: string;
        metadata?: { slug?: { current: string } };
      };
      external?: string;
      params?: string;
    };
  };
  className?: string;
}

// Helper to resolve link from form config
function resolveFormLink(link?: FormProps['form']['redirect']) {
  if (!link) return undefined;
  return resolveSlug({
    _type: link.internal?._type,
    internal: link.internal?.metadata?.slug?.current,
    external: link.external,
    params: link.params,
  });
}

// Get autocomplete value based on field type
function getAutoComplete(type: FormField['type']): string {
  if (type === 'email') return 'email';
  if (type === 'tel') return 'tel';
  return 'on';
}

// TextField component for text/email/tel inputs
function TextField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      id={`field-${field._key}`}
      type={field.type}
      placeholder={field.placeholder}
      required={field.required}
      autoComplete={getAutoComplete(field.type)}
      className="rounded-2xl h-12 bg-background/50 border-input focus:ring-primary/20 transition-all"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// TextareaField component
function TextareaField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <textarea
      id={`field-${field._key}`}
      className="flex min-h-[140px] w-full rounded-2xl border border-input bg-background/50 px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all disabled:cursor-not-allowed disabled:opacity-50"
      placeholder={field.placeholder}
      required={field.required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// CheckboxField component
function CheckboxField({
  field,
  checked,
  onChange,
}: {
  field: FormField;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center space-x-3 py-2 px-1">
      <input
        type="checkbox"
        id={`field-${field._key}`}
        required={field.required}
        className="h-5 w-5 rounded-lg border-input text-primary focus:ring-primary/20 transition-all cursor-pointer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label
        htmlFor={`field-${field._key}`}
        className="text-sm font-medium leading-tight text-foreground/80 cursor-pointer select-none"
      >
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </label>
    </div>
  );
}

// FieldLabel component
function FieldLabel({ field }: { field: FormField }) {
  if (field.type === 'checkbox') return null;
  return (
    <label
      htmlFor={`field-${field._key}`}
      className="text-sm font-semibold text-foreground/80 ml-1"
    >
      {field.label} {field.required && <span className="text-destructive">*</span>}
    </label>
  );
}

// FormFieldRenderer component
function FormFieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string | boolean;
  onChange: (name: string, value: string | boolean) => void;
}) {
  const handleChange = (val: string | boolean) => onChange(field.name.current, val);

  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        field.type === 'textarea' ? 'col-span-1 sm:col-span-2' : 'col-span-1'
      )}
    >
      <FieldLabel field={field} />
      {field.type === 'textarea' && (
        <TextareaField field={field} value={String(value || '')} onChange={handleChange} />
      )}
      {field.type === 'checkbox' && (
        <CheckboxField field={field} checked={!!value} onChange={handleChange} />
      )}
      {field.type !== 'textarea' && field.type !== 'checkbox' && (
        <TextField field={field} value={String(value || '')} onChange={handleChange} />
      )}
    </div>
  );
}

// Success message component
function SuccessMessage({
  form,
  className,
  t,
}: {
  form: FormProps['form'];
  className?: string;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div
      className={cn(
        'py-12 text-center bg-card rounded-3xl border border-border shadow-xl',
        className
      )}
    >
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-8 shadow-inner">
        <span className="text-3xl font-bold">✓</span>
      </div>
      <h3 className="text-3xl font-bold text-foreground mb-4">
        {t('success-title') || 'Thank you!'}
      </h3>
      <div className="text-muted-foreground max-w-md mx-auto px-6">
        {form.successMessage ? (
          <SharedPortableText value={form.successMessage} />
        ) : (
          <p className="text-lg">{t('success-message') || 'We have received your submission.'}</p>
        )}
      </div>
    </div>
  );
}

// Acceptance checkbox component
function AcceptanceCheckbox({
  form,
  accepted,
  onAcceptedChange,
  acceptanceUrl,
  router,
  t,
}: {
  form: FormProps['form'];
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  acceptanceUrl?: string;
  router: ReturnType<typeof useRouter>;
  t: ReturnType<typeof useTranslations>;
}) {
  if (!form.acceptance?.text) return null;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (form.acceptance?.link?.type === 'internal' && acceptanceUrl) {
      e.preventDefault();
      router.push(acceptanceUrl);
    }
  };

  return (
    <div className="flex items-start space-x-3 py-2 px-1">
      <input
        type="checkbox"
        id="form-acceptance"
        required={form.acceptance?.required}
        className="h-5 w-5 rounded-lg border-input text-primary focus:ring-primary/20 transition-all mt-0.5 cursor-pointer"
        checked={accepted}
        onChange={(e) => onAcceptedChange(e.target.checked)}
      />
      <label
        htmlFor="form-acceptance"
        className="text-sm font-medium leading-tight text-foreground/70 cursor-pointer select-none"
      >
        {form.acceptance?.text}{' '}
        {form.acceptance?.required && <span className="text-destructive">*</span>}
        {acceptanceUrl && (
          <a
            href={acceptanceUrl}
            target={form.acceptance.link?.type === 'external' ? '_blank' : undefined}
            rel={form.acceptance.link?.type === 'external' ? 'noopener noreferrer' : undefined}
            className="text-primary hover:underline ml-1 font-semibold"
            onClick={handleLinkClick}
          >
            {t('privacy-link') || 'Read more'}
          </a>
        )}
      </label>
    </div>
  );
}

export default function Form({ form, className }: FormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mountTime, setMountTime] = useState<string | null>(null);
  const t = useTranslations('contact-form');

  // Set mount time for security check
  useEffect(() => {
    setMountTime(new Date().toISOString());
  }, []);

  // Pre-fill from URL parameters
  useEffect(() => {
    if (!form || !searchParams) return;
    const initialData: Record<string, string> = {};
    for (const field of form.fields) {
      const value = searchParams.get(field.name.current);
      if (value) {
        initialData[field.name.current] = value;
      }
    }
    if (Object.keys(initialData).length > 0) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [form, searchParams]);

  if (!form) return null;

  const handleChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRedirect = (redirect: FormProps['form']['redirect']) => {
    const url = resolveFormLink(redirect);
    if (!url) return;

    if (redirect?.type === 'external') {
      const validatedUrl = validateExternalUrl(url);
      if (validatedUrl) window.location.href = validatedUrl;
    } else {
      router.push(url);
    }
  };

  const getErrorMessage = (result: Awaited<ReturnType<typeof submitForm>>) => {
    const serverError = result?.serverError;
    const validationErrors = result?.validationErrors;

    if (typeof serverError === 'string' && serverError.includes('Action not found')) {
      return serverError;
    }
    const fallback =
      serverError || (validationErrors ? 'Validation failed' : 'Something went wrong');
    return result?.data?.error || fallback;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.acceptance?.required && !accepted) {
      setError('Please accept the terms to continue.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await submitForm({
      intent: form.intent,
      data: { ...formData, _submissionTimestamp: mountTime },
    });

    if (result?.data?.success) {
      setSubmitted(true);
      if (form.redirect) handleRedirect(form.redirect);
    } else {
      setError(getErrorMessage(result));
    }
    setLoading(false);
  };

  if (submitted) {
    return <SuccessMessage form={form} className={className} t={t} />;
  }

  const acceptanceUrl = resolveFormLink(form.acceptance?.link);

  return (
    <div
      className={cn('p-8 sm:p-10 rounded-3xl bg-card border border-border shadow-xl', className)}
    >
      {form.formTitle && (
        <h3 className="text-2xl font-bold mb-8 text-foreground">{form.formTitle}</h3>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Security: Invisible Honeypot */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <input
            type="text"
            name="_honeypot"
            tabIndex={-1}
            autoComplete="off"
            value={String(formData._honeypot || '')}
            onChange={(e) => handleChange('_honeypot', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {form.fields.map((field) => (
            <FormFieldRenderer
              key={field._key}
              field={field}
              value={formData[field.name.current] ?? ''}
              onChange={handleChange}
            />
          ))}
        </div>

        <AcceptanceCheckbox
          form={form}
          accepted={accepted}
          onAcceptedChange={setAccepted}
          acceptanceUrl={acceptanceUrl}
          router={router}
          t={t}
        />

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-7 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <span className="h-5 w-5 animate-spin rounded-full border-3 border-background border-t-transparent" />
              <span>{t('submitting') || 'Processing...'}</span>
            </div>
          ) : (
            form.submitButtonText
          )}
        </Button>
      </form>
    </div>
  );
}
