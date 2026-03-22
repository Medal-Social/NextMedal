import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { BASE_URL } from '@/lib/core/env';
import { getSiteOptional } from '@/sanity/lib/fetch';

export const runtime = 'edge';

// Brand Constants
const BRAND_COLORS = {
  navy: '#1A1035', // brand-900
  purple: '#3B1D6C', // brand-700
  vibrant: '#7E3FAC', // brand-500
  lavender: '#D4CCE0', // brand-200
  muted: '#B9A8CC', // brand-300
  white: '#FFFFFF',
};

const FALLBACK_SITE_TITLE = 'NextMedal';
const MAX_TITLE_LENGTH = 140; // Tighter limit for large typography

/**
 * Extract resolved site title from GROQ query result.
 * GROQ coalesces internationalized arrays to strings at query time,
 * but TypeScript types still expect the array structure.
 */
function getSiteName(site: Sanity.Site | null): string {
  if (!site?.title) return FALLBACK_SITE_TITLE;
  return (site.title as unknown as string) || FALLBACK_SITE_TITLE;
}

async function loadFonts(): Promise<
  {
    name: string;
    data: ArrayBuffer;
    style?: 'normal' | 'italic';
    weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  }[]
> {
  try {
    const interData = await fetch(
      new URL('../../../assets/Inter-SemiBold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    return [{ name: 'Inter', data: interData, style: 'normal', weight: 600 }];
  } catch (_error) {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const site = await getSiteOptional().catch(() => null);

    const siteTitle = getSiteName(site);
    const domain = new URL(BASE_URL).hostname;

    // Remove site branding from the end of the title if present
    let title = (searchParams.get('title') as string) || siteTitle;
    const suffixes = [` - ${siteTitle}`, ` — ${siteTitle}`, ` | ${siteTitle}`];
    for (const suffix of suffixes) {
      if (title.endsWith(suffix)) {
        title = title.slice(0, -suffix.length);
        break;
      }
    }
    title = title.slice(0, MAX_TITLE_LENGTH);

    const fonts = await loadFonts();

    // Determine font size based on title length for better visual balance
    const getFontSize = (text: string) => {
      const length = text.length;
      if (length > 100) return '48px';
      if (length > 60) return '64px';
      return '84px';
    };

    const category = searchParams.get('category');

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundImage: `radial-gradient(circle at 50% 50%, ${BRAND_COLORS.purple} 0%, ${BRAND_COLORS.navy} 100%)`,
          color: BRAND_COLORS.white,
          fontFamily: '"Inter"',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Content Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '80px',
            width: '100%',
            height: '100%',
            zIndex: 10,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span
                style={{
                  fontSize: '32px',
                  color: BRAND_COLORS.lavender,
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                }}
              >
                {siteTitle}
              </span>
            </div>

            {/* Optional Tag/pill */}
            {category && (
              <div
                style={{
                  padding: '8px 20px',
                  borderRadius: '50px',
                  border: `1px solid ${BRAND_COLORS.muted}`,
                  color: BRAND_COLORS.lavender,
                  fontSize: '20px',
                  fontWeight: 500,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                }}
              >
                {category}
              </div>
            )}
          </div>

          {/* Main Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '100%' }}>
            <div
              style={{
                fontSize: getFontSize(title),
                fontWeight: 700,
                color: BRAND_COLORS.white,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {title}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: `2px solid rgba(255,255,255,0.08)`,
              paddingTop: '40px',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                color: BRAND_COLORS.muted,
                fontWeight: 500,
                letterSpacing: '-0.01em',
              }}
            >
              {domain}
            </div>

            {/* Call to action visual */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: BRAND_COLORS.lavender,
              }}
            >
              <span style={{ fontSize: '24px', fontWeight: 600 }}>Read more</span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                role="img"
                aria-label="Arrow"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts,
      }
    );
  } catch (_error) {
    return new Response('Error generating image', { status: 500 });
  }
}
