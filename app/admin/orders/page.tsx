import { prisma } from 'lib/db';
import { getDictionary, getLocale } from 'lib/i18n/server';
import Link from 'next/link';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
  const dict = await getDictionary(await getLocale());

  return (
    <div className="bg-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{(dict as any)?.adminOrders?.title || 'Orders'}</h1>
      </div>

      <div className="overflow-x-auto rounded-lg border shadow">
        <table className="min-w-full table-auto border-collapse bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-700">Currency</th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-700">Items</th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="border-b px-4 py-3 font-mono text-xs">{o.id}</td>
                <td className="border-b px-4 py-3 font-medium">{o.status}</td>
                <td className="border-b px-4 py-3">{o.amount}</td>
                <td className="border-b px-4 py-3">{o.currency}</td>
                <td className="border-b px-4 py-3 text-sm text-gray-600">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="border-b px-4 py-3 text-sm">
                  {(() => {
                    try {
                      const items = JSON.parse(o.items || '[]');
                      return (
                        <div className="flex flex-col gap-1">
                          {items.slice(0, 3).map((it: any, i: number) => (
                            <span key={i} className="text-xs text-gray-700">
                              {it.title} × {it.quantity}
                            </span>
                          ))}
                          {items.length > 3 ? <span className="text-xs text-gray-500">+{items.length - 3} more</span> : null}
                        </div>
                      );
                    } catch {
                      return <span className="text-xs text-gray-500">–</span>;
                    }
                  })()}
                </td>
                <td className="border-b px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-blue-600 hover:underline text-sm">Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
