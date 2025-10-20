'use client';

import { useEffect, useState } from 'react';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  background: string;
  image: string;
  order: number;
  isActive: boolean;
}

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className = '' }: HeroSectionProps) {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch('/api/hero')
      .then(response => response.json())
      .then(data => {
        setSlides(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching slides:', error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (isLoading) {
    return (
      <section className={`relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
        <div className="flex items-center justify-center h-96">
          <div className="text-white">Cargando...</div>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className={`relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
        <div className="flex items-center justify-center h-96">
          <div className="text-white">No hay slides activos</div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative overflow-hidden ${className}`}>
      <div className={`absolute inset-0 ${slides[currentSlide]?.background || 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'}`} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            {slides[currentSlide]?.title}
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            {slides[currentSlide]?.subtitle}
          </p>
          <a
            href={slides[currentSlide]?.ctaLink || '/search'}
            className="inline-block px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100"
          >
            {slides[currentSlide]?.cta}
          </a>
        </div>
        <div className="flex justify-center mt-12 space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}