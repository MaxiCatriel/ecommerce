import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding hero slides...');

  const slides = [
    {
      title: '¡Nueva Colección Invierno!',
      subtitle: 'Descubre las últimas tendencias en moda urbana',
      cta: 'Ver Colección',
      ctaLink: '/search?collection=invierno',
      background: 'bg-gradient-to-br from-blue-600 to-purple-700',
      image: '/hero-winter.jpg',
      order: 1,
      isActive: true,
    },
    {
      title: 'Envío Gratis en +$50',
      subtitle: 'Compra hoy y recibe mañana',
      cta: 'Comprar Ahora',
      ctaLink: '/search',
      background: 'bg-gradient-to-br from-green-600 to-teal-700',
      image: '/hero-shipping.jpg',
      order: 2,
      isActive: true,
    },
    {
      title: 'Hasta 3 Cuotas Sin Interés',
      subtitle: 'Financia tu compra fácilmente',
      cta: 'Ver Ofertas',
      ctaLink: '/search?tag=oferta',
      background: 'bg-gradient-to-br from-orange-600 to-red-700',
      image: '/hero-payment.jpg',
      order: 3,
      isActive: true,
    },
  ];

  for (const slide of slides) {
    try {
      await prisma.heroSlide.create({ data: slide });
      console.log(`Created slide: ${slide.title}`);
    } catch (error) {
      console.log(`Slide already exists: ${slide.title}`);
    }
  }

  console.log('Hero slides seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });