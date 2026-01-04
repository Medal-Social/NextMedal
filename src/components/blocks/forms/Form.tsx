'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type React from 'react';
import { useEffect, useState } from 'react';
import { submitForm } from '@/actions/forms/submit-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/index';

interface FormField {
  _key: string;
  label: Array<{ _key: string; value: string }> | string;
  name: { current: string };
  type: 'text' | 'email' | 'tel' | 'textarea' | 'checkbox';
  placeholder?: Array<{ _key: string; value: string }> | string;
  required?: boolean;
}

interface FormProps {
  form: {
    intent: string;
    formTitle?: string;
    fields: FormField[];
    requireConsent?: boolean;
    // Legacy fields for backward compatibility
    submitButtonText?: string;
    successMessage?: Sanity.BlockContent;
    acceptance?: {
      required: boolean;
      text: string;
      link?: unknown;
    };
    redirect?: unknown;
  };
  className?: string;
  locale: string;
}

// Helper to extract localized value from internationalized array
function getLocalizedValue(
  arr: Array<{ _key: string; value: string }> | string | undefined,
  locale: string,
  fallback = ''
): string {
  if (!arr) return fallback;
  if (typeof arr === 'string') return arr; // Backward compatibility
  if (!Array.isArray(arr)) return fallback;

  const item = arr.find((i) => i._key === locale) || arr.find((i) => i._key === 'en') || arr[0];

  return item?.value || fallback;
}

// Backward compatibility adapter
function adaptLegacyForm(form: FormProps['form'], locale: string): FormProps['form'] {
  return {
    ...form,
    fields: form.fields.map((field) => ({
      ...field,
      label: typeof field.label === 'string' ? [{ _key: locale, value: field.label }] : field.label,
      placeholder:
        field.placeholder && typeof field.placeholder === 'string'
          ? [{ _key: locale, value: field.placeholder }]
          : field.placeholder,
    })),
    requireConsent: form.acceptance?.required || form.requireConsent || false,
  };
}

// Get autocomplete value based on field type
function getAutoComplete(type: FormField['type']): string {
  if (type === 'email') return 'email';
  if (type === 'tel') return 'tel';
  return 'on';
}

// FormFieldRenderer component
function FormFieldRenderer({
  field,
  value,
  onChange,
  error,
  locale,
}: {
  field: FormField;
  value: string | boolean;
  onChange: (name: string, value: string | boolean) => void;
  error?: string;
  locale: string;
}) {
  const fieldId = `field-${field._key}`;
  const hasError = !!error;
  const label = getLocalizedValue(field.label, locale);
  const placeholder = getLocalizedValue(field.placeholder, locale);

  if (field.type === 'checkbox') {
    return (
      <Field orientation="horizontal" className="col-span-1">
        <Checkbox
          id={fieldId}
          required={field.required}
          checked={!!value}
          onCheckedChange={(checked) => onChange(field.name.current, checked)}
          aria-invalid={hasError}
        />
        <FieldLabel htmlFor={fieldId} className="cursor-pointer">
          {label} {field.required && <span className="text-destructive">*</span>}
        </FieldLabel>
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  }

  if (field.type === 'textarea') {
    return (
      <Field className="col-span-1 sm:col-span-2">
        <FieldLabel htmlFor={fieldId}>
          {label} {field.required && <span className="text-destructive">*</span>}
        </FieldLabel>
        <Textarea
          id={fieldId}
          placeholder={placeholder}
          required={field.required}
          value={String(value || '')}
          onChange={(e) => onChange(field.name.current, e.target.value)}
          className={cn('min-h-[140px]', hasError && 'border-destructive')}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${fieldId}-error` : undefined}
        />
        {error && <FieldError id={`${fieldId}-error`}>{error}</FieldError>}
      </Field>
    );
  }

  // text, email, tel
  return (
    <Field className="col-span-1">
      <FieldLabel htmlFor={fieldId}>
        {label} {field.required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Input
        id={fieldId}
        type={field.type}
        placeholder={placeholder}
        required={field.required}
        autoComplete={getAutoComplete(field.type)}
        value={String(value || '')}
        onChange={(e) => onChange(field.name.current, e.target.value)}
        className={cn(hasError && 'border-destructive')}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${fieldId}-error` : undefined}
      />
      {error && <FieldError id={`${fieldId}-error`}>{error}</FieldError>}
    </Field>
  );
}

// Success message component
function SuccessMessage({
  className,
  t,
}: {
  className?: string;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className={cn('py-12 text-center bg-card rounded-lg border shadow-sm', className)}>
      <div className="inline-flex items-center justify-center size-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-8 shadow-inner">
        <span className="text-3xl font-bold">&#10003;</span>
      </div>
      <h3 className="text-3xl font-bold text-foreground mb-4">{t('success-title')}</h3>
      <p className="text-muted-foreground text-lg max-w-md mx-auto px-6">{t('success-message')}</p>
    </div>
  );
}

// Acceptance checkbox component
function AcceptanceCheckbox({
  accepted,
  onAcceptedChange,
  t,
}: {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const consentLabel = t.rich('privacy-consent-label', {
    privacyLink: (_chunks) => (
      <a
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline font-semibold"
        aria-label={t('privacy-aria-label')}
      >
        {t('privacy-link')}
      </a>
    ),
  });

  return (
    <Field orientation="horizontal">
      <Checkbox
        id="form-acceptance"
        required
        checked={accepted}
        onCheckedChange={(checked) => onAcceptedChange(checked)}
      />
      <FieldLabel htmlFor="form-acceptance" className="cursor-pointer font-normal">
        {consentLabel} <span className="text-destructive">*</span>
      </FieldLabel>
    </Field>
  );
}

export default function Form({ form: rawForm, className, locale }: FormProps) {
  const form = adaptLegacyForm(rawForm, locale);
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Extract first error message from a validation error object
  const getFirstError = (value: unknown): string | undefined => {
    if (!value || typeof value !== 'object') return undefined;
    const err = value as { _errors?: string[] };
    return err._errors?.[0];
  };

  // Extract field-level validation errors from server response
  const extractFieldErrors = (
    validationErrors: Record<string, unknown> | undefined
  ): Record<string, string> => {
    if (!validationErrors) return {};
    const errors: Record<string, string> = {};

    // Handle nested data object (from withSecurity schema wrapper)
    const dataObj = validationErrors.data as Record<string, unknown> | undefined;
    const source = dataObj || validationErrors;

    for (const [key, value] of Object.entries(source)) {
      if (key === '_errors') continue;
      const errorMsg = getFirstError(value);
      if (errorMsg) errors[key] = errorMsg;
    }

    return errors;
  };

  const getErrorMessage = (result: Awaited<ReturnType<typeof submitForm>>) => {
    const serverError = result?.serverError;
    const validationErrors = result?.validationErrors;

    // Extract and set field-level errors
    if (validationErrors) {
      const fieldErrs = extractFieldErrors(validationErrors as Record<string, unknown>);
      if (Object.keys(fieldErrs).length > 0) {
        setFieldErrors(fieldErrs);
        return 'Please fix the errors above.';
      }
    }

    if (typeof serverError === 'string' && serverError.includes('Action not found')) {
      return serverError;
    }
    const fallback =
      serverError || (validationErrors ? 'Validation failed' : 'Something went wrong');
    return result?.data?.error || fallback;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.requireConsent && !accepted) {
      setError(t('acceptTerms'));
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});

    const result = await submitForm({
      intent: form.intent,
      data: { ...formData, _submissionTimestamp: mountTime },
    });

    if (result?.data?.success) {
      setSubmitted(true);
    } else {
      setError(getErrorMessage(result));
    }
    setLoading(false);
  };

  if (submitted) {
    return <SuccessMessage className={className} t={t} />;
  }

  return (
    <div className={cn('p-8 sm:p-10 rounded-lg bg-card border shadow-sm', className)}>
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

        <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {form.fields.map((field) => (
            <FormFieldRenderer
              key={field._key}
              field={field}
              value={formData[field.name.current] ?? ''}
              onChange={handleChange}
              error={fieldErrors[field.name.current]}
              locale={locale}
            />
          ))}
        </FieldGroup>

        {form.requireConsent && (
          <AcceptanceCheckbox accepted={accepted} onAcceptedChange={setAccepted} t={t} />
        )}

        {error && <FieldError>{error}</FieldError>}

        <Button type="submit" disabled={loading} className="w-full mt-4">
          {loading ? (
            <div className="flex items-center gap-3">
              <span className="size-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
              <span>{t('submitting')}</span>
            </div>
          ) : (
            t('submit-button')
          )}
        </Button>
      </form>
    </div>
  );
}
