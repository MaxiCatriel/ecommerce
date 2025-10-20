import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  try {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
    console.log(JSON.stringify(orders, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
