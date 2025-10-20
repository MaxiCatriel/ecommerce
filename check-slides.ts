import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSlides() {
  try {
    const slides = await prisma.heroSlide.findMany();
    console.log('Slides encontrados:', slides.length);
    console.log(JSON.stringify(slides, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSlides();