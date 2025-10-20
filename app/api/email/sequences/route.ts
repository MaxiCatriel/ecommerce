import { logger } from 'lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const emailSequenceSchema = z.object({
  sequence: z.enum(['welcome', 'abandoned-cart', 're-engagement']),
  email: z.string().email(),
  userId: z.string().optional(),
  orderId: z.string().optional(),
  customData: z.any().optional(),
});

const sequences = {
  welcome: [
    {
      id: 'welcome-1',
      delay: 0, // immediate
      subject: '¡Bienvenido a nuestra tienda! 🎉',
      template: 'welcome',
      content: {
        title: '¡Gracias por registrarte!',
        message: 'Descubre las mejores ofertas especialmente para ti.',
        cta: 'Explorar productos',
        ctaLink: '/search'
      }
    },
    {
      id: 'welcome-2',
      delay: 24 * 60 * 60 * 1000, // 24 hours
      subject: 'Tu guía para comprar online 🛍️',
      template: 'guide',
      content: {
        title: '¿No sabes por dónde empezar?',
        message: 'Te ayudamos con tu primera compra.',
        cta: 'Ver tutorial',
        ctaLink: '/guia-compra'
      }
    },
    {
      id: 'welcome-3',
      delay: 72 * 60 * 60 * 1000, // 72 hours
      subject: 'Oferta especial de bienvenida 💝',
      template: 'special-offer',
      content: {
        title: '¡Tu primera compra con descuento!',
        message: '15% OFF en tu primer pedido.',
        cta: 'Comprar ahora',
        ctaLink: '/search?promo=welcome15'
      }
    }
  ],
  'abandoned-cart': [
    {
      id: 'cart-1',
      delay: 60 * 60 * 1000, // 1 hour
      subject: '¿Olvidaste algo en tu carrito? 🛒',
      template: 'cart-reminder',
      content: {
        title: 'Tu carrito te está esperando',
        message: 'Completa tu compra y recibe envío gratis.',
        cta: 'Completar compra',
        ctaLink: '/checkout'
      }
    },
    {
      id: 'cart-2',
      delay: 24 * 60 * 60 * 1000, // 24 hours
      subject: 'Última oportunidad ⏰',
      template: 'last-chance',
      content: {
        title: '¡No pierdas tu descuento!',
        message: 'Tu carrito expira en 24 horas.',
        cta: 'Finalizar compra',
        ctaLink: '/checkout'
      }
    }
  ],
  're-engagement': [
    {
      id: 'reengage-1',
      delay: 30 * 24 * 60 * 60 * 1000, // 30 days
      subject: 'Te extrañamos 😢',
      template: 'comeback',
      content: {
        title: '¡Regresa y recibe 20% OFF!',
        message: 'Tenemos nuevos productos que te encantarán.',
        cta: 'Ver ofertas',
        ctaLink: '/search?promo=comeback20'
      }
    }
  ]
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sequence, email, userId, orderId, customData } = emailSequenceSchema.parse(body);

    const sequenceEmails = sequences[sequence];
    if (!sequenceEmails) {
      return NextResponse.json(
        { success: false, message: 'Secuencia no encontrada' },
        { status: 404 }
      );
    }

    // Schedule emails for the sequence
    const scheduledEmails = sequenceEmails.map(emailConfig => ({
      ...emailConfig,
      email,
      userId,
      orderId,
      customData,
      scheduledFor: new Date(Date.now() + emailConfig.delay).toISOString(),
      sequence,
    }));

    // In production, this would save to database and queue for sending
    logger.info('Email sequence scheduled', {
      sequence,
      email,
      userId,
      emailCount: scheduledEmails.length,
      scheduledEmails: scheduledEmails.map(e => ({
        id: e.id,
        delay: e.delay,
        scheduledFor: e.scheduledFor
      }))
    });

    return NextResponse.json({
      success: true,
      message: `Secuencia ${sequence} programada`,
      data: {
        sequence,
        emailCount: scheduledEmails.length,
        nextEmail: scheduledEmails[0]?.scheduledFor
      }
    });

  } catch (error) {
    logger.error('Email sequence error', error instanceof Error ? error : new Error(String(error)));

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
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Get sequence analytics
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sequence = searchParams.get('sequence');

  try {
    // Mock analytics data - in production, query your database
    const analytics = {
      welcome: {
        sent: 1250,
        opened: 425,
        clicked: 89,
        converted: 23,
        revenue: 15450
      },
      'abandoned-cart': {
        sent: 890,
        opened: 234,
        clicked: 67,
        converted: 18,
        revenue: 12340
      },
      're-engagement': {
        sent: 456,
        opened: 123,
        clicked: 34,
        converted: 12,
        revenue: 8760
      }
    };

    if (sequence && analytics[sequence as keyof typeof analytics]) {
      return NextResponse.json({
        success: true,
        data: analytics[sequence as keyof typeof analytics]
      });
    }

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Email analytics error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { success: false, message: 'Error al obtener analytics' },
      { status: 500 }
    );
  }
}