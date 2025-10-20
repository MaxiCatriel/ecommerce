'use client';

import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/solid';
import { useI18n } from 'components/i18n/provider';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar?: string;
  verified: boolean;
  date: string;
  product?: string;
}

interface SocialProofSectionProps {
  testimonials?: Testimonial[];
  stats?: {
    label: string;
    value: string;
    icon?: string;
  }[];
  className?: string;
}

export function SocialProofSection({
  testimonials: initialTestimonials,
  stats,
  className = ''
}: SocialProofSectionProps) {
  const { t } = useI18n();

  // Mock testimonials - In production, fetch from your database
  const mockTestimonials: Testimonial[] = [
    {
      id: '1',
      name: 'María González',
      location: 'Buenos Aires, Argentina',
      rating: 5,
      text: '¡Excelente calidad! Las prendas superaron mis expectativas. El envío fue rapidísimo y el packaging impecable. Definitivamente volveré a comprar.',
      avatar: '/avatars/maria.jpg',
      verified: true,
      date: '2025-01-15',
      product: 'Camiseta Premium'
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      location: 'Córdoba, Argentina',
      rating: 5,
      text: 'Increíble atención al cliente. Tuve un problema con el talle y me ayudaron inmediatamente con el cambio. 5 estrellas sin duda.',
      avatar: '/avatars/carlos.jpg',
      verified: true,
      date: '2025-01-12',
      product: 'Pantalón Jeans'
    },
    {
      id: '3',
      name: 'Ana Silva',
      location: 'São Paulo, Brasil',
      rating: 4,
      text: 'Muy buena tienda online. Los productos son tal cual se ven en las fotos y los precios son competitivos. Recomiendo ampliamente.',
      avatar: '/avatars/ana.jpg',
      verified: true,
      date: '2025-01-10',
      product: 'Vestido Elegante'
    }
  ];

  const testimonials = initialTestimonials || mockTestimonials;

  const mockStats = [
    { label: 'Clientes felices', value: '15,000+', icon: '😊' },
    { label: 'Calificación promedio', value: '4.8/5', icon: '⭐' },
    { label: 'Envío promedio', value: '24hs', icon: '🚚' },
    { label: 'Tasa de retorno', value: '35%', icon: '🔄' }
  ];

  const displayStats = stats || mockStats;

  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Miles de personas ya confían en nosotros. Únete a nuestra comunidad satisfecha.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {displayStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Carousel */}
        <TestimonialsCarousel testimonials={testimonials} />
      </div>
    </section>
  );
}

function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  if (!currentTestimonial) return null;

  return (
    <div className="relative">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12"
          >
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {currentTestimonial.avatar ? (
                    <Image
                      src={currentTestimonial.avatar}
                      alt={currentTestimonial.name}
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                  ) : (
                    currentTestimonial.name.charAt(0)
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                {/* Rating */}
                <div className="flex justify-center md:justify-start mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < currentTestimonial.rating
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-200 mb-4 mx-auto md:mx-0" />
                <blockquote className="text-lg text-gray-700 mb-6 italic">
                  "{currentTestimonial.text}"
                </blockquote>

                {/* Author */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {currentTestimonial.name}
                      {currentTestimonial.verified && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Verificado
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {currentTestimonial.location}
                    </div>
                    {currentTestimonial.product && (
                      <div className="text-sm text-blue-600">
                        Compra: {currentTestimonial.product}
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-400 mt-2 md:mt-0">
                    {new Date(currentTestimonial.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={prevTestimonial}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>

          {/* Dots */}
          <div className="flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextTestimonial}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Trust badges component
export function TrustBadges({ className = '' }: { className?: string }) {
  const badges = [
    { text: 'Compra Segura SSL', icon: '🔒' },
    { text: 'Envío Gratis +$50', icon: '🚚' },
    { text: 'Devolución 30 días', icon: '↩️' },
    { text: 'Atención 24/7', icon: '💬' }
  ];

  return (
    <div className={`flex flex-wrap justify-center gap-4 ${className}`}>
      {badges.map((badge, index) => (
        <motion.div
          key={badge.text}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm"
        >
          <span className="text-lg">{badge.icon}</span>
          <span className="text-sm font-medium text-gray-700">{badge.text}</span>
        </motion.div>
      ))}
    </div>
  );
}