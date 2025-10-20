import { logger } from 'lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const newsletterSchema = z.object({
  email: z.string().email('Email inválido'),
  source: z.string().optional(),
  preferences: z.object({
    promotions: z.boolean().default(true),
    newProducts: z.boolean().default(true),
    blog: z.boolean().default(false),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source = 'website', preferences } = newsletterSchema.parse(body);

    // Here you would typically:
    // 1. Check if email already exists
    // 2. Save to database
    // 3. Send welcome email
    // 4. Add to email marketing service (Mailchimp, Sendinblue, etc.)

    // For now, we'll just log and return success
    logger.info('Newsletter subscription', {
      email,
      source,
      preferences,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    });

    // Simulate API call to email service
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: 'Suscripción exitosa',
      data: {
        email,
        subscribedAt: new Date().toISOString(),
        preferences: preferences || {
          promotions: true,
          newProducts: true,
          blog: false,
        },
      },
    });

  } catch (error) {
    logger.error('Newsletter subscription error', error instanceof Error ? error : new Error(String(error)));

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos inválidos',
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}

// Get subscriber count (for admin dashboard)
export async function GET() {
  try {
    // In production, this would query your database
    const subscriberCount = 15420; // Mock data

    return NextResponse.json({
      success: true,
      data: {
        totalSubscribers: subscriberCount,
        activeSubscribers: Math.floor(subscriberCount * 0.85),
        newThisMonth: 1247,
      },
    });

  } catch (error) {
    logger.error('Newsletter stats error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener estadísticas',
      },
      { status: 500 }
    );
  }
}