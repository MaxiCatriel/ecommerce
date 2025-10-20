const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const password = 'password';
  const name = 'Admin';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('User already exists');
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hash,
      role: 'ADMIN'
    }
  });

  console.log('User created:', user);
}

main().catch(console.error).finally(() => prisma.$disconnect());