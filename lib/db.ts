// Dynamically require Prisma to avoid build-time hard dependency when USE_DB=false
// or when @prisma/client hasn't been generated yet.
// Do NOT import types from '@prisma/client' here to keep it optional.

type AnyPrismaClient = any;

function getPrismaCtor(): any | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@prisma/client');
    return mod.PrismaClient;
  } catch (e) {
    if (process.env.USE_DB === 'true') {
      // Helpful error only if DB is enabled
      console.warn(
        '[DB] @prisma/client is missing. Run `npm install` and `npx prisma generate` (and migrations).'
      );
    }
    return null;
  }
}

const PrismaCtor = getPrismaCtor();
const globalForPrisma = global as unknown as { prisma?: AnyPrismaClient };

export const prisma: AnyPrismaClient =
  globalForPrisma.prisma ||
  (PrismaCtor
    ? new PrismaCtor({
        log: ['error']
      })
    : undefined);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
