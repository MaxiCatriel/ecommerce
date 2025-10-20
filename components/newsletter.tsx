'use client';

import { CheckCircleIcon, EnvelopeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useI18n } from 'components/i18n/provider';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface NewsletterSignupProps {
  variant?: 'hero' | 'footer' | 'popup' | 'inline';
  className?: string;
  placeholder?: string;
  buttonText?: string;
  showDescription?: boolean;
}

export function NewsletterSignup({
  variant = 'inline',
  className = '',
  placeholder,
  buttonText,
  showDescription = true
}: NewsletterSignupProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setStatus('success');
        setMessage('¡Gracias por suscribirte! Revisa tu email.');
        setEmail('');
      } else {
        throw new Error('Error al suscribirse');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error al suscribirse. Inténtalo de nuevo.');
    }
  };

  const variants = {
    hero: 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-md mx-auto',
    footer: 'bg-gray-50 rounded-lg p-6',
    popup: 'bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto border',
    inline: 'bg-gray-50 rounded-lg p-6'
  };

  const placeholders = {
    es: placeholder || 'Tu email para ofertas exclusivas',
    en: placeholder || 'Your email for exclusive offers',
    pt: placeholder || 'Seu email para ofertas exclusivas'
  };

  const buttonTexts = {
    es: buttonText || 'Suscribirme',
    en: buttonText || 'Subscribe',
    pt: buttonText || 'Inscrever-se'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${variants[variant]} ${className}`}
    >
      {showDescription && (
        <div className="text-center mb-6">
          <EnvelopeIcon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Recibe Ofertas Exclusivas
          </h3>
          <p className="text-gray-600 text-sm">
            Sé el primero en conocer nuestras promociones y nuevos productos.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholders.es}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            disabled={status === 'loading'}
            required
          />
          {status === 'success' && (
            <CheckCircleIcon className="absolute right-3 top-3 w-5 h-5 text-green-500" />
          )}
          {status === 'error' && (
            <XMarkIcon className="absolute right-3 top-3 w-5 h-5 text-red-500" />
          )}
        </div>

        <button
          type="submit"
          disabled={status === 'loading' || !email}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'loading' ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Suscribiendo...
            </div>
          ) : (
            buttonTexts.es
          )}
        </button>

        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center text-sm ${
              status === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </motion.div>
        )}
      </form>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Al suscribirte, aceptas recibir emails promocionales.
          <button className="text-blue-600 hover:underline ml-1">
            Política de privacidad
          </button>
        </p>
      </div>
    </motion.div>
  );
}

// Email popup component
export function EmailPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Show popup after 30 seconds or on exit intent
    // Do not show if user dismissed during this session
    const sessionDismissed = sessionStorage.getItem('newsletter-popup-dismissed');
    if (sessionDismissed) return;

    const timer = setTimeout(() => {
      if (!hasShown && !localStorage.getItem('newsletter-popup-shown') && !sessionStorage.getItem('newsletter-popup-dismissed')) {
        setIsVisible(true);
        setHasShown(true);
        localStorage.setItem('newsletter-popup-shown', 'true');
      }
    }, 30000);

    const handleExitIntent = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown && !sessionStorage.getItem('newsletter-popup-dismissed')) {
        setIsVisible(true);
        setHasShown(true);
        localStorage.setItem('newsletter-popup-shown', 'true');
      }
    };

    document.addEventListener('mouseleave', handleExitIntent);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleExitIntent);
    };
  });

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors z-10"
        >
          <XMarkIcon className="w-4 h-4 text-gray-600" />
        </button>

        <NewsletterSignup
          variant="popup"
          showDescription={true}
          buttonText="¡Quiero mis descuentos!"
        />
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              sessionStorage.setItem('newsletter-popup-dismissed', 'true');
              setIsVisible(false);
              setHasShown(true);
            }}
            className="text-sm text-gray-500 hover:underline"
          >
            No quiero
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Exit intent popup for cart abandonment
export function CartAbandonmentPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const sessionDismissed = sessionStorage.getItem('newsletter-popup-dismissed');
    if (sessionDismissed) return;

    const handleExitIntent = (e: MouseEvent) => {
      if (e.clientY <= 0 && window.location.pathname.includes('/cart')) {
        setIsVisible(true);
      }
    };

    document.addEventListener('mouseleave', handleExitIntent);
    return () => document.removeEventListener('mouseleave', handleExitIntent);
  });

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto"
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
        >
          <XMarkIcon className="w-4 h-4 text-gray-600" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😢</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ¡No te vayas sin tu descuento!
          </h3>
          <p className="text-gray-600">
            Completa tu compra y recibe <strong>10% OFF</strong> en tu primer pedido.
          </p>
        </div>

        <NewsletterSignup
          variant="inline"
          showDescription={false}
          placeholder="Tu email para el descuento"
          buttonText="Obtener 10% OFF"
        />
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              sessionStorage.setItem('newsletter-popup-dismissed', 'true');
              setIsVisible(false);
            }}
            className="text-sm text-gray-500 hover:underline"
          >
            No quiero
          </button>
        </div>
      </motion.div>
    </div>
  );
}