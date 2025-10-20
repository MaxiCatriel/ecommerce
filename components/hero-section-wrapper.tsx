'use client';

import dynamic from 'next/dynamic';

const HeroSection = dynamic(() => import('components/hero-section').then(mod => ({ default: mod.HeroSection })), {
  ssr: false,
  loading: () => (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-2xl font-bold">Cargando hero section...</div>
      </div>
    </section>
  )
});

export default function HeroSectionWrapper() {
  return <HeroSection />;
}