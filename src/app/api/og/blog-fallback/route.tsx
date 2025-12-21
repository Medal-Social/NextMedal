import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'NextMedal Blog';
  const category = searchParams.get('category') || '';

  // Use CSS variables-like values for brand colors to make them easy to replace later
  // In a real implementation, you might fetch these from Sanity "site" settings
  const colors = {
    background: '#1A1035', // Brand Navy
    text: '#FFFFFF',
    accent: '#D4CCE0', // Brand Lavender
    gradient1: '#7E3FAC', // Brand Purple
    gradient2: '#3B1D6C', // Brand Purple 700
  };

  // Load font
  const fontData = await loadGoogleFont('Inter');

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        position: 'relative',
      }}
    >
      {/* Background Gradient Blob */}
      <div
        style={{
          position: 'absolute',
          top: '-25%',
          right: '-25%',
          width: '1000px',
          height: '1000px',
          background: `radial-gradient(circle, ${colors.gradient1} 0%, transparent 60%)`,
          opacity: 0.3,
          filter: 'blur(80px)',
        }}
      />

      {/* Bottom Left Gradient Blob */}
      <div
        style={{
          position: 'absolute',
          bottom: '-25%',
          left: '-25%',
          width: '800px',
          height: '800px',
          background: `radial-gradient(circle, ${colors.gradient2} 0%, transparent 60%)`,
          opacity: 0.4,
          filter: 'blur(60px)',
        }}
      />

      {/* Content Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '4rem',
          zIndex: 10,
          maxWidth: '80%',
        }}
      >
        {category && (
          <div
            style={{
              display: 'flex',
              fontSize: '2rem',
              color: colors.accent,
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}
          >
            {category}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            fontSize: '4.5rem',
            fontWeight: 700,
            color: colors.text,
            lineHeight: 1.1,
            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {title}
        </div>
      </div>

      {/* Brand Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '3rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          opacity: 0.8,
        }}
      >
        <div
          style={{
            fontSize: '1.5rem',
            color: colors.accent,
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          NextMedal
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          style: 'normal',
          weight: 600,
        },
      ],
    }
  );
}

// Helper to load Google Font
async function loadGoogleFont(fontFamily: string) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@600`;
    const css = await (await fetch(url)).text();
    const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

    if (resource) {
      const response = await fetch(resource[1]);
      if (response.status === 200) {
        return await response.arrayBuffer();
      }
    }
  } catch (e) {
    console.error('Failed to load font', e);
  }

  // Return empty buffer as fallback to prevent crash, though text will look wrong
  return new ArrayBuffer(0);
}
