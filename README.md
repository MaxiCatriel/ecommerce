# MCCommerce

A high-performance, server-rendered Next.js App Router ecommerce application.

This fork uses a local in-repo catalog and Mercado Pago (Argentina) for checkout instead of Shopify.

Quick notes:
- Product/catalog lives in `lib/data/*`.
- Cart is cookie-based; checkout runs at `app/api/mercadopago/checkout`.
- Set `MERCADOPAGO_ACCESS_TOKEN` in your env to enable checkout.

This template uses React Server Components, Server Actions, `Suspense`, `useOptimistic`, and more.



## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run MCCommerce.

> Note: You should not commit your `.env` file or it will expose secrets.

```bash
pnpm install
pnpm dev
```

Your app should now be running on [localhost:3000](http://localhost:3000/).

### Optional: enable DB-backed admin

This fork includes an optional SQLite (Prisma) catalog and an admin area protected by NextAuth session + `ADMIN` role.

- Set `USE_DB=true` and `DATABASE_URL="file:./prisma/dev.db"` in `.env`.
- Install Prisma client and generate: `pnpm install` then `npx prisma generate` and `npx prisma migrate dev --name init`.
- Register in `/register` and log in at `/login`.
- The first created user is promoted to `ADMIN` automatically.
- Visit `/admin/products` with an `ADMIN` session to manage products.

### Optional: user accounts (NextAuth credentials)

- Add `NEXTAUTH_SECRET` to `.env` (usa un valor seguro aleatorio).
- Realiza migraciones de Prisma si aún no lo hiciste.
- Regístrate en `/register` y luego inicia sesión en `/login`.
- El primer usuario creado se promociona a `ADMIN` automáticamente.
- Acceso al panel: `/admin/products` (requiere sesión con rol ADMIN).



## Mercado Pago Checkout

Set these variables in `.env` or via your platform:

- `MERCADOPAGO_ACCESS_TOKEN` (required)
- `NEXT_PUBLIC_SITE_URL` (optional; used for back_urls)
- `MP_SUCCESS_URL`, `MP_FAILURE_URL`, `MP_PENDING_URL` (optional overrides)

The checkout API will create a Mercado Pago preference from the current cart and redirect to the MP payment page.
