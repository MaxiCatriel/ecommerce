// Handler para /api/auth/error que responde a GET
import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({ error: 'Authentication error' }, { status: 200 });
}
