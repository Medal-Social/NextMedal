'use client';

import { useRouter, useSearchParams } from 'next/navigation';
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

// FormFieldRenderer component
function FormFieldRenderer({
  field,
  value,
  onChange,
  error,
}: {
  field: FormField;
  value: string | boolean;
  onChange: (name: string, value: string | boolean) => void;
  error?: string;
}) {
  const fieldId = `field-${field._key}`;
  const hasError = !!error;

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
          {field.label} {field.required && <span className="text-destructive">*</span>}
        </FieldLabel>
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  }

  if (field.type === 'textarea') {
    return (
      <Field className="col-span-1 sm:col-span-2">
        <FieldLabel htmlFor={fieldId}>
          {field.label} {field.required && <span className="text-destructive">*</span>}
        </FieldLabel>
        <Textarea
          id={fieldId}
          placeholder={field.placeholder}
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
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Input
        id={fieldId}
        type={field.type}
        placeholder={field.placeholder}
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
  form,
  className,
  t,
}: {
  form: FormProps['form'];
  className?: string;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className={cn('py-12 text-center bg-card rounded-lg border shadow-sm', className)}>
      <div className="inline-flex items-center justify-center size-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-8 shadow-inner">
        <span className="text-3xl font-bold">&#10003;</span>
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
    <Field orientation="horizontal">
      <Checkbox
        id="form-acceptance"
        required={form.acceptance?.required}
        checked={accepted}
        onCheckedChange={(checked) => onAcceptedChange(checked)}
      />
      <FieldLabel htmlFor="form-acceptance" className="cursor-pointer font-normal">
        {form.acceptance?.text}{' '}
        {form.acceptance?.required && <span className="text-destructive">*</span>}
        {acceptanceUrl && (
          <a
            href={acceptanceUrl}
            target={form.acceptance.link?.type === 'external' ? '_blank' : undefined}
            rel={form.acceptance.link?.type === 'external' ? 'noopener noreferrer' : undefined}
            className="text-primary hover:underline ml-1 font-semibold"
            onClick={handleLinkClick}
            aria-label={t('privacy-policy-aria-label') || 'Read our privacy policy'}
          >
            {t('privacy-link') || 'Read more'}
          </a>
        )}
      </FieldLabel>
    </Field>
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

    if (form.acceptance?.required && !accepted) {
      setError('Please accept the terms to continue.');
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
            />
          ))}
        </FieldGroup>

        <AcceptanceCheckbox
          form={form}
          accepted={accepted}
          onAcceptedChange={setAccepted}
          acceptanceUrl={acceptanceUrl}
          router={router}
          t={t}
        />

        {error && <FieldError>{error}</FieldError>}

        <Button type="submit" disabled={loading} className="w-full mt-4">
          {loading ? (
            <div className="flex items-center gap-3">
              <span className="size-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
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
