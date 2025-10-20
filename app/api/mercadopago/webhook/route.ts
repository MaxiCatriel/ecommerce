import crypto from 'crypto';
import { prisma } from 'lib/db';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

async function fetchPayment(dataId: string, accessToken: string) {
  try {
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!r.ok) return undefined;
    return r.json();
  } catch {
    return undefined;
  }
}

export async function POST(req: NextRequest) {
  const h = await headers();
  const topic = h.get('x-topic') || h.get('x-resource-type') || 'unknown';

  // Read raw body for signature verification and then parse
  const raw = await req.text();
  let body: any = null;
  try {
    body = JSON.parse(raw);
  } catch {}

  // Signature headers that MercadoPago may send
  const sigHeader = h.get('x-signature') || h.get('x-hook-signature') || h.get('x-mercadopago-signature');

  // If a webhook secret is configured, validate signature (HMAC-SHA256)
  if (process.env.MERCADOPAGO_WEBHOOK_SECRET) {
    if (!sigHeader) {
      return NextResponse.json({ ok: false, error: 'Missing signature header' }, { status: 401 });
    }

    try {
      const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
      const hmac = crypto.createHmac('sha256', secret).update(raw).digest();
      const hmacHex = hmac.toString('hex');
      const hmacBase64 = hmac.toString('base64');

      const valid = sigHeader === hmacHex || sigHeader === hmacBase64;
      if (!valid) {
        console.warn('Invalid MercadoPago webhook signature');
        return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 });
      }
    } catch (e) {
      console.error('Error verifying webhook signature', e);
      return NextResponse.json({ ok: false, error: 'Signature verification failed' }, { status: 401 });
    }
  }

  const type = req.nextUrl.searchParams.get('type') || body?.type || topic;
  const dataId =
    req.nextUrl.searchParams.get('data.id') || body?.data?.id || body?.resource?.id || '';

  // Optionally retrieve payment details
  let payment: any = undefined;
  if (type?.includes('payment') && dataId && process.env.MERCADOPAGO_ACCESS_TOKEN) {
    payment = await fetchPayment(dataId, process.env.MERCADOPAGO_ACCESS_TOKEN);
  }

  // Try to find an order by external_reference (pref external_reference) or by payment.id
  try {
    let orderId = body?.data?.external_reference || body?.external_reference || '';
    // If not present, try to fetch payment and look for external_reference there
    if (!orderId && payment?.external_reference) orderId = payment.external_reference;

    if (orderId) {
      // Update order based on payment status
      const status = payment?.status ? String(payment.status).toUpperCase() : 'PENDING';
      await prisma.order.updateMany({ where: { externalReference: orderId }, data: { status, paymentId: dataId || payment?.id || undefined } });
    }
  } catch (e) {
    // ignore DB errors but log server-side if possible
    console.error(e);
  }

  return NextResponse.json({ ok: true, type, dataId, signature: !!sigHeader, paymentStatus: payment?.status });
}

export async function GET(req: NextRequest) {
  // Mercado Pago may send verification pings as GET
  const type = req.nextUrl.searchParams.get('type') || 'unknown';
  const dataId = req.nextUrl.searchParams.get('data.id') || '';
  return NextResponse.json({ ok: true, type, dataId });
}

