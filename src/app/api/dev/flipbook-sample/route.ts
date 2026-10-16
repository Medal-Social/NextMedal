import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Serves the flipbook fixture PDF for the dev harness. Never available in production. */
export async function GET() {
  if (process.env.NODE_ENV === 'production') return new Response('Not found', { status: 404 });
  const pdf = await readFile(join(process.cwd(), 'tests/fixtures/flipbook/sample.pdf'));
  return new Response(pdf, { headers: { 'Content-Type': 'application/pdf' } });
}
