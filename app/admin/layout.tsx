import { prisma } from 'lib/db';
import { getDictionary, getLocale } from 'lib/i18n/server';
import { auth } from '../../auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const dict = await getDictionary(await getLocale());
  const role = (session?.user as any)?.role;
  if (!session || role !== 'ADMIN') {
    return (
      <html>
        <body className="bg-gray-200 text-gray-900">
          <div className="mx-auto max-w-xl p-8">
            <h1 className="mb-4 text-2xl font-bold">{dict.admin.panel}</h1>
            <p className="mb-4 text-sm text-neutral-600">{dict.admin.restricted}</p>
            <a href="/login" className="rounded bg-blue-600 px-4 py-2 text-white">{dict.admin.goToLogin}</a>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html>
      <body className="bg-gray-200 text-gray-900">
        <div className="mx-auto max-w-7xl p-6">
          <h1 className="mb-4 text-2xl font-bold">{dict.admin.panel}</h1>
          <nav className="mb-6 flex gap-3">
            <a href="/admin/products" className="rounded border px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900">{dict.admin.products}</a>
            <a href="/admin/users" className="rounded border px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900">{dict.admin.users}</a>
            <a href="/admin/orders" className="rounded border px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900 flex items-center gap-2">
              Orders
              {/** show badge for pending orders */}
              <PendingOrdersBadge />
            </a>
            <a href="/admin/hero" className="rounded border px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900">Hero</a>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}

async function PendingOrdersBadge() {
  const count = await prisma.order.count({ where: { status: 'PENDING' } });
  if (!count) return null;
  return <span className="ml-1 inline-flex items-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">{count}</span>;
}
