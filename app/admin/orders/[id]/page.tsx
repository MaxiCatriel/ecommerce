import { prisma } from 'lib/db';
import Link from 'next/link';

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return <div className="p-6">Order not found</div>;

  let items: any[] = [];
  try {
    items = JSON.parse(order.items || '[]');
  } catch {}

  return (
    <div className="bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Order {order.id}</h2>
        <Link href="/admin/orders" className="text-sm text-blue-600">Back to orders</Link>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div>
          <div className="text-xs text-gray-500">Status</div>
          <div className="font-medium">{order.status}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Amount</div>
          <div className="font-medium">{order.amount} {order.currency}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Payment ID</div>
          <div className="font-mono text-sm">{order.paymentId || '–'}</div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Items</h3>
        <div className="space-y-2">
          {items.length ? items.map((it, i) => (
            <div key={i} className="rounded border p-2">
              <div className="text-sm font-medium">{it.title}</div>
              <div className="text-xs text-gray-600">Qty: {it.quantity} • Unit: {it.unit_price} {it.currency}</div>
            </div>
          )) : <div className="text-sm text-gray-500">No items</div>}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Raw</h3>
        <pre className="overflow-auto rounded border p-3 text-xs">{JSON.stringify(order, null, 2)}</pre>
      </div>
    </div>
  );
}
