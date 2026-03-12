import { Carousel } from 'components/carousel';
import { ThreeItemGrid } from 'components/grid/three-items';
import HeroSectionWrapper from 'components/hero-section-wrapper';
import Footer from 'components/layout/footer';
import { PersonalizedRecommendations } from 'components/personalized-recommendations';
import { UrgencyBanner } from 'components/urgency-banner';
import { getDbProducts } from 'lib/providers/catalog';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';

export const metadata = {
  description:
    'High-performance ecommerce store built with Next.js, Vercel, and Mercado Pago.',
  openGraph: {
    type: 'website'
  }
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const showPrices = Boolean(session);

  // Get all products from database
  const allProducts = await getDbProducts();

  // Format price helper
  const formatPrice = (price: number | string) => `$${Number(price).toLocaleString('es-AR')} ARS`;

  // Filter products by tags for different sections
  const featuredProducts = allProducts.filter(p => p.tags.includes('homepage-featured'));
  const carouselProducts = allProducts.filter(p => p.tags.includes('homepage-carousel'));

  // Recently viewed products (use featured products or fallback to first products)
  const recentlyViewed = (featuredProducts.length > 0 ? featuredProducts : allProducts.slice(0, 2)).map(p => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    price: formatPrice(p.priceRange.minVariantPrice.amount),
    originalPrice: formatPrice(Number(p.priceRange.minVariantPrice.amount) * 1.2), // 20% higher for discount
    image: p.featuredImage?.url || '/placeholder-product.jpg',
    badge: '20% OFF'
  }));

  // Personalized recommendations (use carousel products or fallback)
  const recommendations = (carouselProducts.length > 0 ? carouselProducts : allProducts.slice(2, 4)).map(p => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    price: formatPrice(p.priceRange.minVariantPrice.amount),
    image: p.featuredImage?.url || '/placeholder-product.jpg',
    rating: 4.7,
    reviews: 89
  }));

  // Bestsellers (use some products, simulate bestsellers)
  const bestsellers = allProducts.slice(0, 3).map(p => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    price: formatPrice(p.priceRange.minVariantPrice.amount),
    originalPrice: formatPrice(Number(p.priceRange.minVariantPrice.amount) * 1.3), // 30% higher
    image: p.featuredImage?.url || '/placeholder-product.jpg',
    badge: 'HOT',
    rating: 4.9,
    reviews: 234
  }));

  // Flash sale products (use some products with discount)
  const flashSale = allProducts.slice(1, 4).map(p => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    price: formatPrice(Math.round(Number(p.priceRange.minVariantPrice.amount) * 0.7)), // 30% off
    originalPrice: formatPrice(p.priceRange.minVariantPrice.amount),
    image: p.featuredImage?.url || '/placeholder-product.jpg',
    badge: '30% OFF'
  }));

  return (
    <>
      {/* Urgency Banner - High conversion impact */}
      <UrgencyBanner
        variant="timer"
        endTime="2025-12-31T23:59:59"
        message="¡Oferta especial termina en:"
      />

      {/* Hero Section - Main conversion driver */}
      <HeroSectionWrapper />

      {/* Homepage Carousel */}
      <Carousel showPrices={showPrices} />

      {/* Personalized Recommendations - Increases engagement */}
      <PersonalizedRecommendations
        recentlyViewed={recentlyViewed}
        recommendations={recommendations}
        bestsellers={bestsellers}
        flashSale={flashSale}
      />

      {/* Original content - Still valuable */}
      {false && <ThreeItemGrid showPrices={showPrices} />}
      <Footer />
    </>
  );
}
