import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { BASE_URL } from '@/lib/core/env';
import { getSiteOptional } from '@/sanity/lib/fetch';

export const runtime = 'edge';

// Brand Constants
const BRAND_COLORS = {
  navy: '#1A1035',
  purple: '#3B1D6C',
  vibrant: '#7E3FAC',
  lavender: '#D4CCE0',
  muted: '#B9A8CC',
  white: '#FFFFFF',
};

// Locale-aware translations
const TRANSLATIONS = {
  en: { articles: 'Article', readMore: 'Read more' },
  nb: { articles: 'Artikler', readMore: 'Les mer' },
  ar: { articles: 'مقالة', readMore: 'المقال اقرأ' },
} as const;

type Locale = keyof typeof TRANSLATIONS;

function getLocalizedText(locale: string) {
  const normalizedLocale = locale.toLowerCase().split('-')[0] as Locale;
  return TRANSLATIONS[normalizedLocale] || TRANSLATIONS.en;
}

/**
 * Extract resolved site title from GROQ query result.
 * GROQ coalesces internationalized arrays to strings at query time,
 * but TypeScript types still expect the array structure.
 */
function getSiteName(site: Sanity.Site | null, fallback = 'NextMedal'): string {
  if (!site?.title) return fallback;
  return (site.title as unknown as string) || fallback;
}

function isRTL(locale: string): boolean {
  return locale.toLowerCase().startsWith('ar');
}

async function loadFonts(locale: string): Promise<
  {
    name: string;
    data: ArrayBuffer;
    style?: 'normal' | 'italic';
    weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  }[]
> {
  const fonts: {
    name: string;
    data: ArrayBuffer;
    style?: 'normal' | 'italic';
    weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  }[] = [];

  const interData = await fetch(
    new URL('../../../../assets/Inter-SemiBold.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());

  fonts.push({
    name: 'Inter',
    data: interData,
    style: 'normal',
    weight: 600,
  });

  if (isRTL(locale)) {
    const arabicData = await fetch(
      new URL('../../../../assets/NotoSansArabic-SemiBold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    fonts.push({
      name: 'NotoSansArabic',
      data: arabicData,
      style: 'normal',
      weight: 600,
    });
  }
  return fonts;
}

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const rawTitle = searchParams.get('title') || 'Article';
    const locale = searchParams.get('locale') || 'en';

    const title = truncateText(rawTitle, 100);
    const domain = new URL(BASE_URL).hostname;

    let siteName = 'NextMedal';
    try {
      const site = await getSiteOptional(locale);
      siteName = getSiteName(site, 'NextMedal');
    } catch (_e) {
      // Fallback to default
    }

    const t = getLocalizedText(locale);
    const rtl = isRTL(locale);
    const fonts = await loadFonts(locale);

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: BRAND_COLORS.navy,
          color: BRAND_COLORS.white,
          fontFamily: rtl ? 'NotoSansArabic, Inter, sans-serif' : 'Inter, sans-serif',
          position: 'relative',
          overflow: 'hidden',
          direction: rtl ? 'rtl' : 'ltr',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-25%',
            right: '-25%',
            width: '1000px',
            height: '1000px',
            background: `radial-gradient(circle, ${BRAND_COLORS.vibrant} 0%, transparent 60%)`,
            opacity: 0.3,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-25%',
            left: '-25%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${BRAND_COLORS.purple} 0%, transparent 60%)`,
            opacity: 0.4,
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            padding: '60px 80px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                padding: '8px 20px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '100px',
                border: `1px solid ${BRAND_COLORS.purple}`,
                color: BRAND_COLORS.lavender,
                fontSize: '18px',
                fontWeight: 600,
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {t.articles}
            </div>
            <span style={{ fontSize: '24px', color: BRAND_COLORS.lavender, fontWeight: 600 }}>
              {siteName}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
              textAlign: rtl ? 'right' : 'left',
            }}
          >
            <h1
              style={{
                fontSize: title.length > 50 ? '60px' : '82px',
                fontWeight: 800,
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              {title}
            </h1>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              borderTop: `1px solid rgba(212, 204, 224, 0.2)`,
              paddingTop: '32px',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '22px', color: BRAND_COLORS.muted }}>{domain}</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: BRAND_COLORS.lavender,
              }}
            >
              <span style={{ fontSize: '20px', fontWeight: 600 }}>{t.readMore}</span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                role="img"
                aria-label="Arrow"
              >
                {rtl ? <path d="M19 12H5M12 19l-7-7 7-7" /> : <path d="M5 12h14M12 5l7 7-7 7" />}
              </svg>
            </div>
          </div>
        </div>
      </div>,
      { width: 1200, height: 630, fonts }
    );
  } catch (_error) {
    return new Response('Error generating image', { status: 500 });
  }
}
