'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/moduleProps';
import { cn } from '@/lib/utils';
import Form from '@/ui/Form';
import { Img } from '@/ui/Img';
import SharedPortableText from './SharedPortableText';

interface OfficeInfo {
  title: string;
  address: {
    street: string;
    city: string;
    country: string;
  };
  email?: string;
  phone?: string;
  openingHours?: string;
}

interface ContactPerson {
  title: string;
  name: string;
  position: string;
  description?: string;
  image?: any;
  email?: string;
  phone?: string;
}

interface ContactProps extends Sanity.Module {
  intro?: any[];
  form: any;
  officeInfo?: OfficeInfo;
  contactPerson?: ContactPerson;
}

export default function Contact({
  intro,
  form,
  officeInfo,
  contactPerson,
  ...props
}: ContactProps) {
  const t = useTranslations('contact-form');
  const [mounted, setMounted] = useState(false);
  const isSidebar = (props as any).spacing === 'none';

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

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
            isSidebar ? 'grid-cols-1 gap-8' : 'grid-gap-16 lg:grid-cols-2'
          )}
        >
          {/* Left: Form */}
          <div className="w-full">
            <Form form={form} className="shadow-lg border-primary/10" />
          </div>

          {/* Right: Contact Details */}
          {!isSidebar && (
            <div className="space-y-10">
              {/* Office Information */}
              {officeInfo && (
                <div className="p-8 rounded-3xl bg-card border border-border shadow-sm">
                  <h3 className="text-2xl font-bold mb-8 text-foreground">{officeInfo.title}</h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4 mt-0.5">
                        📍
                      </div>
                      <div>
                        <p className="font-bold text-foreground mb-1">{t('address')}</p>
                        <p className="text-muted-foreground leading-relaxed">
                          {officeInfo.address?.street}
                          <br />
                          {officeInfo.address?.city}, {officeInfo.address?.country}
                        </p>
                      </div>
                    </div>

                    {officeInfo.email && (
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4 mt-0.5">
                          📧
                        </div>
                        <div>
                          <p className="font-bold text-foreground mb-1">{t('email')}</p>
                          <p className="text-muted-foreground">{officeInfo.email}</p>
                        </div>
                      </div>
                    )}

                    {officeInfo.phone && (
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4 mt-0.5">
                          📞
                        </div>
                        <div>
                          <p className="font-bold text-foreground mb-1">{t('phone')}</p>
                          <p className="text-muted-foreground">{officeInfo.phone}</p>
                        </div>
                      </div>
                    )}

                    {officeInfo.openingHours && (
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4 mt-0.5">
                          🕐
                        </div>
                        <div>
                          <p className="font-bold text-foreground mb-1">{t('opening-hours')}</p>
                          <p className="text-muted-foreground">{officeInfo.openingHours}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Person */}
              {contactPerson && (
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
                      <h4 className="text-xl font-bold mb-1 text-foreground">
                        {contactPerson.name}
                      </h4>
                      <p className="text-primary font-semibold mb-3 tracking-wide text-sm uppercase">
                        {contactPerson.position}
                      </p>
                      {contactPerson.description && (
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          {contactPerson.description}
                        </p>
                      )}
                      <div className="space-y-2">
                        {contactPerson.email && (
                          <a
                            href={`mailto:${contactPerson.email}`}
                            className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                          >
                            <span className="mr-2">✉️</span> {contactPerson.email}
                          </a>
                        )}
                        {contactPerson.phone && (
                          <a
                            href={`tel:${contactPerson.phone}`}
                            className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                          >
                            <span className="mr-2">📱</span> {contactPerson.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
