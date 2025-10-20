import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/db';
function getBcrypt(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('bcryptjs');
  } catch {
    throw new Error("Missing dependency 'bcryptjs'. Run `npm install` (or `npm install bcryptjs`).");
  }
}

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return NextResponse.json({ error: 'User exists' }, { status: 400 });
  const bcrypt = getBcrypt();
  const hash = await bcrypt.hash(password, 10);

  // First user becomes ADMIN for convenience
  const count = await prisma.user.count();
  const role = count === 0 ? 'ADMIN' : 'USER';

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name: name || null,
      passwordHash: hash,
      role: role as any
    }
  });
  return NextResponse.json({ id: user.id, email: user.email, role: user.role });
}
