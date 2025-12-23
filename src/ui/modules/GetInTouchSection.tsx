'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/moduleProps';
import { cn } from '@/lib/utils';
import Form from '@/ui/Form';
import { Img } from '@/ui/Img';

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

interface GetInTouchSectionProps extends Sanity.Module {
  title: string;
  subtitle: string;
  formTitle: string;
  form: any;
  officeInfo?: OfficeInfo;
  contactPerson?: ContactPerson;
}

export default function GetInTouchSection({
  title,
  subtitle,
  formTitle,
  form,
  officeInfo,
  contactPerson,
  ...props
}: GetInTouchSectionProps) {
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
    <Section {...moduleProps(props)} className={cn(!isSidebar && 'py-20')}>
      <div className={cn('mx-auto', !isSidebar && 'container')}>
        <div className={cn('text-center mb-12', isSidebar && 'mb-8')}>
          <h2
            className={cn(
              'font-bold mb-4 text-foreground',
              isSidebar ? 'text-2xl' : 'text-3xl md:text-4xl'
            )}
          >
            {title}
          </h2>
          <p className={cn('text-muted-foreground', isSidebar ? 'text-base' : 'text-lg')}>
            {subtitle}
          </p>
        </div>

        <div
          className={cn(
            'grid items-start',
            isSidebar ? 'grid-cols-1 gap-8' : 'grid-gap-12 lg:grid-cols-2'
          )}
        >
          {/* Left: Form */}
          <div>
            <Form
              form={{
                ...form,
                formTitle: formTitle || form?.formTitle,
              }}
            />
          </div>

          {/* Right: Office Info & Contact Person */}
          {!isSidebar && (
            <div className="space-y-8">
              {/* Office Information */}
              {officeInfo && (
                <div className="p-8 rounded-2xl bg-card border border-border shadow-sm">
                  <h3 className="text-2xl font-bold mb-6 text-foreground">{officeInfo.title}</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-6 h-6 text-primary mr-3 mt-1">📍</div>
                      <div>
                        <p className="font-medium text-foreground">{t('address')}</p>
                        <p className="text-sm text-muted-foreground">
                          {officeInfo.address.street}
                          <br />
                          {officeInfo.address.city}, {officeInfo.address.country}
                        </p>
                      </div>
                    </div>

                    {officeInfo.email && (
                      <div className="flex items-start">
                        <div className="w-6 h-6 text-primary mr-3 mt-1">📧</div>
                        <div>
                          <p className="font-medium text-foreground">{t('email')}</p>
                          <p className="text-sm text-muted-foreground">{officeInfo.email}</p>
                        </div>
                      </div>
                    )}

                    {officeInfo.phone && (
                      <div className="flex items-start">
                        <div className="w-6 h-6 text-primary mr-3 mt-1">📞</div>
                        <div>
                          <p className="font-medium text-foreground">{t('phone')}</p>
                          <p className="text-sm text-muted-foreground">{officeInfo.phone}</p>
                        </div>
                      </div>
                    )}

                    {officeInfo.openingHours && (
                      <div className="flex items-start">
                        <div className="w-6 h-6 text-primary mr-3 mt-1">🕐</div>
                        <div>
                          <p className="font-medium text-foreground">{t('opening-hours')}</p>
                          <p className="text-sm text-muted-foreground">{officeInfo.openingHours}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Person */}
              {contactPerson && (
                <div className="p-8 rounded-2xl bg-card border border-border shadow-sm">
                  <h3 className="text-2xl font-bold mb-6 text-foreground">{contactPerson.title}</h3>
                  <div className="flex items-start space-x-4">
                    {contactPerson.image && (
                      <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border border-border">
                        <Img
                          image={contactPerson.image}
                          alt={contactPerson.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="text-lg font-bold mb-1 text-foreground">
                        {contactPerson.name}
                      </h4>
                      <p className="text-sm mb-2 text-primary font-medium">
                        {contactPerson.position}
                      </p>
                      {contactPerson.description && (
                        <p className="text-sm mb-3 text-muted-foreground">
                          {contactPerson.description}
                        </p>
                      )}
                      {contactPerson.email && (
                        <a
                          href={`mailto:${contactPerson.email}`}
                          className="text-sm hover:text-primary transition-colors font-medium block mb-1 text-muted-foreground"
                        >
                          {contactPerson.email}
                        </a>
                      )}
                      {contactPerson.phone && (
                        <a
                          href={`tel:${contactPerson.phone}`}
                          className="text-sm hover:text-primary transition-colors font-medium text-muted-foreground"
                        >
                          {contactPerson.phone}
                        </a>
                      )}
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
