import { NextResponse } from 'next/server';

// biome-ignore lint/suspicious/useAwait: required by Next.js route handler signature
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
