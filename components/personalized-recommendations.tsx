'use client';

import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, EyeIcon, FireIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useI18n } from 'components/i18n/provider';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface Product {
  id: string;
  title: string;
  handle: string;
  price: string;
  originalPrice?: string;
  image: string;
  badge?: string;
  rating?: number;
  reviews?: number;
}

interface PersonalizedRecommendationsProps {
  recentlyViewed?: Product[];
  recommendations?: Product[];
  bestsellers?: Product[];
  flashSale?: Product[];
  className?: string;
}

export function PersonalizedRecommendations({
  recentlyViewed = [],
  recommendations = [],
  bestsellers = [],
  flashSale = [],
  className = ''
}: PersonalizedRecommendationsProps) {
  const { t } = useI18n();

  const sections = [
    {
      id: 'recently-viewed',
      title: '👀 Visto recientemente',
      icon: EyeIcon,
      products: recentlyViewed,
      showEmpty: false
    },
    {
      id: 'recommendations',
      title: '💝 Te podría gustar',
      icon: HeartIcon,
      products: recommendations,
      showEmpty: false
    },
    {
      id: 'bestsellers',
      title: '🔥 Los más vendidos',
      icon: FireIcon,
      products: bestsellers,
      showEmpty: true
    },
    {
      id: 'flash-sale',
      title: '⚡ Oferta limitada',
      icon: ClockIcon,
      products: flashSale,
      showEmpty: true
    }
  ].filter(section => section.showEmpty || section.products.length > 0);

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {sections.map((section, sectionIndex) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <section.icon className="w-6 h-6 text-gray-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                </div>

                {section.products.length > 4 && (
                  <Link
                    href={`/search?section=${section.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  >
                    Ver todo
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </Link>
                )}
              </div>

              {section.products.length > 0 ? (
                <ProductCarousel products={section.products} />
              ) : (
                <EmptyState sectionId={section.id} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCarousel({ products }: { products: Product[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(products.length / 4));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(products.length / 4)) % Math.ceil(products.length / 4));
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const visibleProducts = products.slice(currentIndex * 4, (currentIndex + 1) * 4);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden">
              <Link href={`/product/${product.handle}`}>
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(product.id)}
                className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
              >
                {favorites.has(product.id) ? (
                  <HeartSolidIcon className="w-4 h-4 text-red-500" />
                ) : (
                  <HeartIcon className="w-4 h-4 text-gray-600" />
                )}
              </button>

              {/* Badge */}
              {product.badge && (
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                    {product.badge}
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <Link href={`/product/${product.handle}`}>
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {product.title}
                </h3>
              </Link>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating!)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    ({product.reviews})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">
                  {product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {product.originalPrice}
                  </span>
                )}
              </div>

              {/* Discount percentage */}
              {product.originalPrice && (
                <div className="mt-1">
                  <span className="text-sm text-green-600 font-medium">
                    {Math.round(((parseFloat(product.originalPrice.replace('$', '')) - parseFloat(product.price.replace('$', ''))) / parseFloat(product.originalPrice.replace('$', ''))) * 100)}% OFF
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation */}
      {products.length > 4 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </>
      )}
    </div>
  );
}

function EmptyState({ sectionId }: { sectionId: string }) {
  const messages = {
    'bestsellers': 'Los más vendidos aparecerán aquí pronto',
    'flash-sale': 'No hay ofertas activas en este momento',
    'recommendations': 'Completa tu perfil para recibir recomendaciones personalizadas',
    'recently-viewed': 'Los productos que veas aparecerán aquí'
  };

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">📦</span>
      </div>
      <p className="text-gray-500">
        {messages[sectionId as keyof typeof messages] || 'No hay productos disponibles'}
      </p>
    </div>
  );
}