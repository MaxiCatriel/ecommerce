import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/db';
import { logger } from 'lib/logger';

type SendResetEmailParams = {
  to: string;
  resetLink: string;
};

async function sendResetEmail({ to, resetLink }: SendResetEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PASSWORD_RESET_FROM_EMAIL;

  if (!apiKey || !from) {
    logger.warn('Password reset email provider not configured. Logging reset link only.', {
      to,
      resetLink
    });
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to,
      subject: 'Recuperar contraseña',
      html: `
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>
          <a href="${resetLink}">Haz clic aquí para crear una nueva contraseña</a>
        </p>
        <p>Este enlace expira en 30 minutos.</p>
      `
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend error (${response.status}): ${details}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!prisma?.user || !prisma?.passwordResetToken) {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }

    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const genericMessage = {
      success: true,
      message: 'Si el email existe, enviaremos instrucciones para restablecer tu contraseña.'
    };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(genericMessage);
    }

    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null
      },
      data: {
        usedAt: new Date()
      }
    });

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const resetLink = `${origin.replace(/\/$/, '')}/reset-password?token=${token}`;

    await sendResetEmail({ to: user.email, resetLink });

    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ ...genericMessage, devResetLink: resetLink });
    }

    return NextResponse.json(genericMessage);
  } catch (error) {
    logger.error('Forgot password error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}