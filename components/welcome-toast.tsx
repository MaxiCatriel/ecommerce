'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function WelcomeToast() {
  useEffect(() => {
    // ignore if screen height is too small
    if (window.innerHeight < 650) return;
    if (!document.cookie.includes('welcome-toast=2')) {
      toast('🛍️ ¡Bienvenido a Next.js Commerce!', {
        id: 'welcome-toast',
        duration: Infinity,
        onDismiss: () => {
          document.cookie = 'welcome-toast=2; max-age=31536000; path=/';
        },
        description: (
          <>
            Tienda SSR de alto rendimiento con Next.js y checkout con Mercado Pago.{' '}
            <a
              href="https://vercel.com/templates/next.js/nextjs-commerce"
              className="text-blue-600 hover:underline"
              target="_blank"
            >
              Desplegá la tuya
            </a>
            .
          </>
        )
      });
    }
  }, []);

  return null;
}
