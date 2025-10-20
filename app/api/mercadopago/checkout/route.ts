import { prisma } from 'lib/db';
import { findProductByVariantIdUniversal } from 'lib/shopify';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    const site = process.env.NEXT_PUBLIC_SITE_URL || '';
    const url = `${site}/checkout/result?status=pending&reason=missing_token`;
    return NextResponse.redirect(url);
  }

  const raw = (await cookies()).get('cart')?.value;
  if (!raw) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });

  let itemsInCart: { merchandiseId: string; quantity: number }[] = [];
  try {
    itemsInCart = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid cart' }, { status: 400 });
  }

  if (!itemsInCart.length) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  // Build Mercado Pago preference items
  const preferenceItems = [] as any[];
  const orderLines: any[] = [];
  for (const line of itemsInCart) {
    const found = await findProductByVariantIdUniversal(line.merchandiseId);
    if (!found) continue;
    const { product, variant } = found as any;
    preferenceItems.push({
      title: `${product.title} - ${variant.title}`,
      quantity: line.quantity,
      currency_id: variant.price.currencyCode || 'ARS',
      unit_price: Number(variant.price.amount)
    });
    orderLines.push({
      id: line.merchandiseId,
      title: `${product.title} - ${variant.title}`,
      quantity: line.quantity,
      unit_price: Number(variant.price.amount),
      currency: variant.price.currencyCode || 'ARS'
    });
  }

  if (!preferenceItems.length) {
    return NextResponse.json({ error: 'No valid items in cart' }, { status: 400 });
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  // Persist order in DB (PENDING) so we can reconcile via webhook
  const totalAmount = orderLines.reduce((s, it) => s + it.unit_price * it.quantity, 0);
  const order = await prisma.order.create({
    data: {
      items: JSON.stringify(orderLines),
      amount: String(totalAmount),
      currency: orderLines[0]?.currency || 'ARS'
    }
  });

  const body = {
    items: preferenceItems,
    external_reference: order.id,
    notification_url: `${site}/api/mercadopago/webhook`,
    back_urls: {
      success: process.env.MP_SUCCESS_URL || `${site}/checkout/result?status=success`,
      failure: process.env.MP_FAILURE_URL || `${site}/checkout/result?status=failure`,
      pending: process.env.MP_PENDING_URL || `${site}/checkout/result?status=pending`
    },
    auto_return: 'approved'
  };

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: 'Mercado Pago error', details: err }, { status: 500 });
  }

  const pref = await res.json();
  const url = pref.init_point || pref.sandbox_init_point;
  if (!url) {
    // mark order as ERROR
    await prisma.order.update({ where: { id: order.id }, data: { status: 'ERROR' } });
    return NextResponse.json({ error: 'Missing init_point' }, { status: 500 });
  }

  // Save preference id / init url in order (optional)
  await prisma.order.update({ where: { id: order.id }, data: { paymentId: pref.id || undefined } });

  return NextResponse.redirect(url);
}
