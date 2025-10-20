'use client';

import { ClockIcon, ExclamationTriangleIcon, FireIcon } from '@heroicons/react/24/outline';
import { useI18n } from 'components/i18n/provider';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface UrgencyBannerProps {
  endTime?: string; // ISO string
  stockRemaining?: number;
  totalStock?: number;
  message?: string;
  variant?: 'timer' | 'stock' | 'flash-sale';
  className?: string;
}

export function UrgencyBanner({
  endTime,
  stockRemaining = 5,
  totalStock = 20,
  message,
  variant = 'timer',
  className = ''
}: UrgencyBannerProps) {
  const { t } = useI18n();
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft(null);
        setIsVisible(false);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (!isVisible) return null;

  const getVariantConfig = () => {
    switch (variant) {
      case 'stock':
        return {
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-red-600',
          textColor: 'text-white',
          message: message || `¡Solo quedan ${stockRemaining} unidades!`,
          showProgress: true
        };
      case 'flash-sale':
        return {
          icon: FireIcon,
          bgColor: 'bg-orange-600',
          textColor: 'text-white',
          message: message || '¡Oferta flash por tiempo limitado!',
          showProgress: false
        };
      default:
        return {
          icon: ClockIcon,
          bgColor: 'bg-blue-600',
          textColor: 'text-white',
          message: message || '¡La oferta termina pronto!',
          showProgress: false
        };
    }
  };

  const config = getVariantConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`overflow-hidden ${className}`}
      >
        <div className={`${config.bgColor} ${config.textColor} py-3 px-4 relative`}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>

          <div className="relative max-w-7xl mx-auto flex items-center justify-center space-x-4">
            {/* Icon with animation */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Icon className="w-6 h-6 flex-shrink-0" />
            </motion.div>

            {/* Message */}
            <div className="flex-1 text-center">
              <motion.p
                className="font-semibold text-sm md:text-base"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {config.message}
              </motion.p>
            </div>

            {/* Timer or Stock Info */}
            <div className="flex items-center space-x-2">
              {variant === 'timer' && timeLeft && (
                <div className="flex items-center space-x-1 bg-black/20 rounded-lg px-3 py-1">
                  <ClockIcon className="w-4 h-4" />
                  <span className="font-mono text-sm font-bold">
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
              )}

              {variant === 'stock' && config.showProgress && (
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-black/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: `${(stockRemaining / totalStock) * 100}%` }}
                      animate={{ width: `${Math.max((stockRemaining / totalStock) * 100, 5)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs font-bold">
                    {stockRemaining}/{totalStock}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center hover:bg-black/20 rounded-full transition-colors"
          >
            <span className="text-white text-sm font-bold">×</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Specialized urgency components
export function FlashSaleBanner({ endTime, discount }: { endTime: string; discount: number }) {
  return (
    <UrgencyBanner
      variant="flash-sale"
      endTime={endTime}
      message={`¡${discount}% OFF! Oferta termina en:`}
    />
  );
}

export function StockUrgencyBanner({ remaining, total }: { remaining: number; total: number }) {
  return (
    <UrgencyBanner
      variant="stock"
      stockRemaining={remaining}
      totalStock={total}
      message={`¡Solo quedan ${remaining} unidades!`}
    />
  );
}

export function CountdownBanner({ endTime, message }: { endTime: string; message?: string }) {
  return (
    <UrgencyBanner
      variant="timer"
      endTime={endTime}
      message={message}
    />
  );
}