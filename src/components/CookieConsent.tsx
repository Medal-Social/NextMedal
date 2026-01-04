'use client';

import { useEffect } from 'react';
import * as CookieConsent from 'vanilla-cookieconsent';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import '@/styles/cookieconsent.css';
import { useTheme } from 'next-themes';
import { resolveUrlSync } from '@/lib/sanity/resolve-url';

interface CookieConsentProps {
  config: Sanity.Site['cookieConsent'];
  locale?: string;
}

export default function CookieConsentComponent({ config, locale = 'en' }: CookieConsentProps) {
  const { resolvedTheme } = useTheme();

  const privacyPolicy =
    config?.privacyPolicy &&
    typeof config.privacyPolicy === 'object' &&
    '_type' in config.privacyPolicy &&
    config.privacyPolicy._type === 'page'
      ? (config.privacyPolicy as Sanity.Page)
      : null;

  const privacyPolicyUrl = privacyPolicy
    ? resolveUrlSync(privacyPolicy, { base: false })
    : undefined;

  useEffect(() => {
    if (!config?.enabled) return;

    // Map Sanity config to Vanilla CookieConsent config
    CookieConsent.run({
      root: 'body',
      guiOptions: {
        consentModal: {
          layout: 'box',
          position: 'bottom right',
          equalWeightButtons: true,
          flipButtons: false,
        },
        preferencesModal: {
          layout: 'box',
          position: 'right',
          equalWeightButtons: true,
          flipButtons: false,
        },
      },
      categories: {
        necessary: {
          readOnly: true,
          enabled: true,
        },
        analytics: {
          readOnly: false, // Changed to false to allow toggling
          enabled: true, // Enabled by default (opt-out), set to false for opt-in
          autoClear: {
            cookies: [
              {
                name: /^(_ga|_gid|umami)/, // Regex for GA and Umami cookies
              },
              {
                name: /^ph_/, // PostHog cookies
              },
            ],
          },
        },
      },
      language: {
        default: locale,
        autoDetect: 'document',
        translations: {
          en: {
            consentModal: {
              title: 'We use cookies',
              description:
                'We use cookies to enhance your browsing experience and analyze our traffic.',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              showPreferencesBtn: 'Manage preferences',
              footer: privacyPolicyUrl
                ? `
                  <a href="${privacyPolicyUrl}">Privacy Policy</a>
                `
                : undefined,
            },
            preferencesModal: {
              title: 'Manage preferences',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              savePreferencesBtn: 'Save preferences',
              closeIconLabel: 'Close',
              sections: [
                {
                  title: 'Cookie usage',
                  description:
                    'I use cookies to ensure the basic functionalities of the website and to enhance your online experience.',
                },
                {
                  title: 'Strictly Necessary Cookies',
                  description:
                    'These cookies are essential for the proper functioning of my website. Without these cookies, the website would not work properly.',
                  linkedCategory: 'necessary',
                  cookieTable: {
                    headers: {
                      name: 'Name',
                      domain: 'Domain',
                      desc: 'Description',
                      duration: 'Duration',
                    },
                    body: [
                      {
                        name: 'theme',
                        domain: 'Local Storage',
                        desc: 'Stores your preferred theme (light/dark/system).',
                        duration: 'Persistent',
                      },
                      {
                        name: 'NEXT_LOCALE',
                        domain: '.nextmedal.com',
                        desc: 'Stores your preferred language locale.',
                        duration: 'Session',
                      },
                    ],
                  },
                },
                {
                  title: 'Analytics Cookies',
                  description:
                    'These cookies collect information about how you use the website, which pages you visited and which links you clicked on. All of the data is anonymized and cannot be used to identify you.',
                  linkedCategory: 'analytics',
                  cookieTable: {
                    headers: {
                      name: 'Name',
                      domain: 'Domain',
                      desc: 'Description',
                      duration: 'Duration',
                    },
                    body: [
                      {
                        name: 'ph_*_posthog',
                        domain: '.nextmedal.com',
                        desc: 'PostHog analytics session cookies.',
                        duration: '1 year',
                      },
                    ],
                  },
                },
              ],
            },
          },
          nb: {
            consentModal: {
              title: 'Vi bruker informasjonskapsler',
              description:
                'Vi bruker informasjonskapsler for å forbedre brukeropplevelsen og analysere trafikken vår.',
              acceptAllBtn: 'Godta alle',
              acceptNecessaryBtn: 'Avvis alle',
              showPreferencesBtn: 'Administrer innstillinger',
              footer: privacyPolicyUrl
                ? `
                  <a href="${privacyPolicyUrl}">Personvernerklæring</a>
                `
                : undefined,
            },
            preferencesModal: {
              title: 'Administrer innstillinger',
              acceptAllBtn: 'Godta alle',
              acceptNecessaryBtn: 'Avvis alle',
              savePreferencesBtn: 'Lagre innstillinger',
              closeIconLabel: 'Lukk',
              sections: [
                {
                  title: 'Bruk av informasjonskapsler',
                  description:
                    'Vi bruker informasjonskapsler for å sikre grunnleggende funksjonalitet på nettstedet og forbedre din opplevelse.',
                },
                {
                  title: 'Nødvendige informasjonskapsler',
                  description:
                    'Disse informasjonskapslene er avgjørende for at nettstedet skal fungere. Uten disse informasjonskapslene vil ikke nettstedet fungere som det skal.',
                  linkedCategory: 'necessary',
                  cookieTable: {
                    headers: {
                      name: 'Navn',
                      domain: 'Domene',
                      desc: 'Beskrivelse',
                      duration: 'Varighet',
                    },
                    body: [
                      {
                        name: 'theme',
                        domain: 'Local Storage',
                        desc: 'Lagrer ditt foretrukne tema (lys/mørk/system).',
                        duration: 'Vedvarende',
                      },
                      {
                        name: 'NEXT_LOCALE',
                        domain: '.nextmedal.com',
                        desc: 'Lagrer ditt foretrukne språk.',
                        duration: 'Sesjon',
                      },
                    ],
                  },
                },
                {
                  title: 'Analyse informasjonskapsler',
                  description:
                    'Disse informasjonskapslene samler informasjon om hvordan du bruker nettstedet, hvilke sider du besøkte og hvilke lenker du klikket på. All data er anonymisert.',
                  linkedCategory: 'analytics',
                  cookieTable: {
                    headers: {
                      name: 'Navn',
                      domain: 'Domene',
                      desc: 'Beskrivelse',
                      duration: 'Varighet',
                    },
                    body: [
                      {
                        name: 'ph_*_posthog',
                        domain: '.nextmedal.com',
                        desc: 'PostHog analyse sesjonskapsler.',
                        duration: '1 år',
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
      // Dark mode handling
      // The library adds 'cc--darkmode' class to body or container based on detection or manual setting.
      // We can sync it with next-themes.
    });
  }, [config, locale, privacyPolicyUrl]);

  // Sync theme
  useEffect(() => {
    if (resolvedTheme === 'dark') {
      document.body.classList.add('cc--darkmode');
    } else {
      document.body.classList.remove('cc--darkmode');
    }
  }, [resolvedTheme]);

  return null;
}
