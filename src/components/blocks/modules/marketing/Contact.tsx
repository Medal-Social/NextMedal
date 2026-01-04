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
    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4 mt-0.5">
      <Icon className="w-5 h-5" aria-hidden="true" />
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
        <p className="font-bold text-foreground mb-1">{label}</p>
        <div className="text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

// Office information card
function OfficeInfoCard({ officeInfo }: { officeInfo: NonNullable<Sanity.Contact['officeInfo']> }) {
  const t = useTranslations('contact-form');

  return (
    <div className="p-8 rounded-3xl bg-card border border-border shadow-sm">
      <h3 className="text-2xl font-bold mb-8 text-foreground">{officeInfo.title}</h3>
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
    <div className="p-8 rounded-3xl bg-card border border-border shadow-sm">
      <h3 className="text-2xl font-bold mb-8 text-foreground">{contactPerson.title}</h3>
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {contactPerson.image && (
          <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-primary/5">
            <Img
              image={contactPerson.image}
              alt={contactPerson.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <h4 className="text-xl font-bold mb-1 text-foreground">{contactPerson.name}</h4>
          <p className="text-primary font-semibold mb-3 tracking-wide text-sm uppercase">
            {contactPerson.position}
          </p>
          {contactPerson.description && (
            <p className="text-muted-foreground leading-relaxed mb-4">
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
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
          {email}
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <Smartphone className="w-4 h-4 mr-2" aria-hidden="true" />
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
          <div className={cn('max-w-3xl mx-auto text-center', isSidebar ? 'mb-8' : 'mb-16')}>
            <SharedPortableText value={intro} variant="intro" />
          </div>
        )}

        <div
          className={cn(
            'grid items-start max-w-6xl mx-auto',
            isSidebar ? 'grid-cols-1 gap-8' : 'gap-16 lg:grid-cols-2'
          )}
        >
          <div className="w-full">
            <Form form={form} locale={locale} className="shadow-lg border-primary/10" />
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
