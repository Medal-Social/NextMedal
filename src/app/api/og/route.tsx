import { getSite } from '@/sanity/lib/fetch';
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

const domain = process.env.NEXT_PUBLIC_BASE_URL?.replace(/https?:\/\//, '');

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const site = await getSite();

  // remove divider and site.title in metadata.title
  const regex = new RegExp(` [-—|] ${site.title}$`);
  const title = searchParams.get('title')?.replace(regex, '');

  // Create a noise pattern SVG for texture
  const noiseSvg = `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
        <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.15 0"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)"/>
    </svg>
  `;

  // Convert SVG to data URL for use in CSS
  const noiseDataUrl = `data:image/svg+xml,${encodeURIComponent(noiseSvg)}`;

  // Create a grid pattern SVG
  const gridSvg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="black" strokeWidth="0.2" strokeOpacity="1"/>
      </pattern>
      <rect width="100%" height="100%" fill="url(#grid)" filter="blur(0.5px)"/>
    </svg>
  `;

  // Convert SVG to data URL for use in CSS
  const gridDataUrl = `data:image/svg+xml,${encodeURIComponent(gridSvg)}`;

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: '4rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gradient background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to right top, #f5a9f2, #a5a9f9)',
          zIndex: -3,
        }}
      />

      {/* Grid overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("${gridDataUrl}")`,
          backgroundSize: '40px 40px',
          opacity: 0.2,
          zIndex: -2,
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)',
        }}
      />

      {/* Noise texture */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("${noiseDataUrl}")`,
          backgroundSize: '200px 200px',
          opacity: 0.15,
          zIndex: -1,
        }}
      />

      {/* Title */}
      <div
        style={{
          display: 'block',
          fontSize: '5rem',
          lineHeight: 1.15,
          lineClamp: 4,
          color: 'white',
          textShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          position: 'absolute',
          alignSelf: 'center',
          justifyContent: 'center',
          width: '100%',
          textAlign: 'center',
          textWrap: 'pretty',
          zIndex: 1,
        }}
      >
        {title || site.title}
      </div>
      <div
        style={{
          display: 'block',
          fontSize: '2rem',
          lineHeight: 1.15,
          lineClamp: 4,
          color: 'white',
          textShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          zIndex: 1,
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-25%)',
        }}
      >
        {domain || site.title}
      </div>
    </div>,
    {
      fonts: [
        {
          name: 'serif',
          data: await loadGoogleFont('Inter'),
        },
      ],
    }
  );
}

async function loadGoogleFont(fontFamily: string) {
  const url = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@600`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error('failed to load font data');
}
