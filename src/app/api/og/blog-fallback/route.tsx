import { promises as fs } from 'node:fs';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'NextMedal Blog';
  const description = searchParams.get('description') || '';

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
  const fontData = await fs.readFile(path.join(process.cwd(), 'assets/Inter-SemiBold.ttf'));

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
          maxWidth: '85%',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: description ? '3.5rem' : '4.5rem',
            fontWeight: 700,
            color: colors.text,
            lineHeight: 1.1,
            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              display: 'flex',
              fontSize: '1.75rem',
              fontWeight: 400,
              color: colors.accent,
              lineHeight: 1.4,
              marginTop: '1.5rem',
              maxWidth: '90%',
              opacity: 0.9,
            }}
          >
            {description.slice(0, 120)}
            {description.length > 120 ? '...' : ''}
          </div>
        )}
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
