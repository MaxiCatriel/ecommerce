import crypto from 'crypto';
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

export async function POST(request: NextRequest) {
  try {
    if (!prisma?.user || !prisma?.passwordResetToken) {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }

    const body = await request.json();
    const token = String(body?.token || '');
    const password = String(body?.password || '');

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const now = new Date();

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: now
        }
      },
      select: {
        id: true,
        userId: true
      }
    });

    if (!resetToken) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const bcrypt = getBcrypt();
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: now }
      }),
      prisma.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          usedAt: null
        },
        data: {
          usedAt: now
        }
      })
    ]);

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}