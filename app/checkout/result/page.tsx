import Link from 'next/link';
import { cookies } from 'next/headers';
import { findProductByVariantId } from 'lib/data/products';

type CartCookieItem = { merchandiseId: string; quantity: number };

export default async function CheckoutResultPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) || {};
  const status = (searchParams.status as string) || 'unknown';
  const reason = (searchParams.reason as string) || '';

  // Read cart snapshot before clearing
  const raw = (await cookies()).get('cart')?.value || '[]';
  let cartItems: CartCookieItem[] = [];
  try {
    cartItems = JSON.parse(raw);
  } catch {}

  // Build summary from local catalog
  const lines = cartItems
    .map((line) => {
      const found = findProductByVariantId(line.merchandiseId);
      if (!found) return null;
      const { product, variant } = found;
      const unit = Number(variant.price.amount);
      const amount = unit * line.quantity;
      return {
        id: line.merchandiseId,
        title: `${product.title} - ${variant.title}`,
        quantity: line.quantity,
        unit,
        amount,
        currency: variant.price.currencyCode
      };
    })
    .filter(Boolean) as {
    id: string;
    title: string;
    quantity: number;
    unit: number;
    amount: number;
    currency: string;
  }[];

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  const currency = lines[0]?.currency || 'ARS';

  // Clear cart on approved success
  if (status === 'success') {
    (await cookies()).set('cart', '[]', { path: '/' });
  }

  const title =
    status === 'success'
      ? 'Pago aprobado'
      : status === 'pending'
        ? 'Pago pendiente'
        : status === 'failure'
          ? 'Pago rechazado'
          : 'Estado de pago';

  return (
    <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">{title}</h1>
      {reason ? (
        <div className="mb-6 rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900 dark:border-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-200">
          Motivo: {reason === 'missing_token' ? 'Falta configurar MERCADOPAGO_ACCESS_TOKEN' : reason}
        </div>
      ) : null}

      {lines.length ? (
        <div className="mb-6 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900">
              <tr>
                <th className="p-3 text-left">Producto</th>
                <th className="p-3 text-right">Cantidad</th>
                <th className="p-3 text-right">Precio</th>
                <th className="p-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.id} className="border-t border-neutral-200 dark:border-neutral-800">
                  <td className="p-3">{l.title}</td>
                  <td className="p-3 text-right">{l.quantity}</td>
                  <td className="p-3 text-right">
                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(l.unit)}
                  </td>
                  <td className="p-3 text-right">
                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(l.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-neutral-200 dark:border-neutral-800">
              <tr>
                <td className="p-3 font-medium" colSpan={3}>
                  Total
                </td>
                <td className="p-3 text-right font-semibold">
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p className="mb-6 text-sm text-neutral-500">No hay productos para mostrar.</p>
      )}

      <div className="flex gap-3">
        <Link
          href="/"
          prefetch={true}
          className="rounded-full bg-blue-600 px-5 py-3 text-white hover:opacity-90"
        >
          Seguir comprando
        </Link>
        <Link
          href="/search"
          prefetch={true}
          className="rounded-full border px-5 py-3 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
        >
          Ver productos
        </Link>
      </div>
    </div>
  );
}
