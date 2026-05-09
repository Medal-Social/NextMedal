'use client';

import type { LucideIcon } from 'lucide-react';
import { Clock, Mail, MapPin, Phone, Smartphone } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Form } from '@/components/blocks/forms';
import { Img } from '@/components/blocks/objects/core';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/sanity/module-props';
import { cn } from '@/lib/utils/index';
import SharedPortableText from '../SharedPortableText';

// Icon wrapper component
function InfoIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="mt-0.5 mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </div>
  );
}

// Single info row component
function InfoRow({
  icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start">
      <InfoIcon icon={icon} />
      <div>
        <p className="mb-1 font-bold text-foreground">{label}</p>
        <div className="text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

// Office information card
function OfficeInfoCard({ officeInfo }: { officeInfo: NonNullable<Sanity.Contact['officeInfo']> }) {
  const t = useTranslations('contact-form');

  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
      <h3 className="mb-8 font-bold text-2xl text-foreground">{officeInfo.title}</h3>
      <div className="space-y-6">
        <InfoRow icon={MapPin} label={t('address')}>
          <p className="leading-relaxed">
            {officeInfo.address?.street}
            <br />
            {officeInfo.address?.city}, {officeInfo.address?.country}
          </p>
        </InfoRow>

        {officeInfo.email && (
          <InfoRow icon={Mail} label={t('email')}>
            <p>{officeInfo.email}</p>
          </InfoRow>
        )}

        {officeInfo.phone && (
          <InfoRow icon={Phone} label={t('phone')}>
            <p>{officeInfo.phone}</p>
          </InfoRow>
        )}

        {officeInfo.openingHours && (
          <InfoRow icon={Clock} label={t('opening-hours')}>
            <p>{officeInfo.openingHours}</p>
          </InfoRow>
        )}
      </div>
    </div>
  );
}

// Contact person card
function ContactPersonCard({
  contactPerson,
}: {
  contactPerson: NonNullable<Sanity.Contact['contactPerson']>;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
      <h3 className="mb-8 font-bold text-2xl text-foreground">{contactPerson.title}</h3>
      <div className="flex flex-col items-start gap-6 sm:flex-row">
        {contactPerson.image && (
          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-primary/5">
            <Img
              image={contactPerson.image}
              alt={contactPerson.name}
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <h4 className="mb-1 font-bold text-foreground text-xl">{contactPerson.name}</h4>
          <p className="mb-3 font-semibold text-primary text-sm uppercase tracking-wide">
            {contactPerson.position}
          </p>
          {contactPerson.description && (
            <p className="mb-4 text-muted-foreground leading-relaxed">
              {contactPerson.description}
            </p>
          )}
          <ContactLinks email={contactPerson.email} phone={contactPerson.phone} />
        </div>
      </div>
    </div>
  );
}

// Contact links (email/phone)
function ContactLinks({ email, phone }: { email?: string; phone?: string }) {
  if (!email && !phone) return null;

  return (
    <div className="space-y-2">
      {email && (
        <a
          href={`mailto:${email}`}
          className="flex items-center font-medium text-muted-foreground text-sm transition-colors hover:text-primary"
        >
          <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
          {email}
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex items-center font-medium text-muted-foreground text-sm transition-colors hover:text-primary"
        >
          <Smartphone className="mr-2 h-4 w-4" aria-hidden="true" />
          {phone}
        </a>
      )}
    </div>
  );
}

export default function Contact({
  intro,
  form,
  officeInfo,
  contactPerson,
  ...props
}: Sanity.Contact) {
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const isSidebar = props.spacing === 'none';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Section {...moduleProps(props)} className={cn(!isSidebar && 'py-24')}>
      <div className={cn('mx-auto', !isSidebar && 'container')}>
        {intro && (
          <div className={cn('mx-auto max-w-3xl text-center', isSidebar ? 'mb-8' : 'mb-16')}>
            <SharedPortableText value={intro} variant="intro" />
          </div>
        )}

        <div
          className={cn(
            'mx-auto grid max-w-6xl items-start',
            isSidebar ? 'grid-cols-1 gap-8' : 'gap-16 lg:grid-cols-2'
          )}
        >
          <div className="w-full">
            <Form form={form} locale={locale} className="border-primary/10 shadow-lg" />
          </div>

          {!isSidebar && (
            <div className="space-y-10">
              {officeInfo && <OfficeInfoCard officeInfo={officeInfo} />}
              {contactPerson && <ContactPersonCard contactPerson={contactPerson} />}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
