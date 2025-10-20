import { TAGS } from 'lib/constants';
import type { Cart, Collection, Menu, Page, Product, CartItem } from './types';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTS, findProductByHandle, findProductByVariantId } from 'lib/data/products';
import { getDbProductByHandle, getDbProducts } from 'lib/providers/catalog';
import { COLLECTIONS, getCollectionByHandle, getProductsForCollection } from 'lib/data/collections';
import { getFooterMenu, getHeaderMenu } from 'lib/data/menu';
import { PAGES, findPage } from 'lib/data/pages';

type LocalCartItem = { merchandiseId: string; quantity: number };

async function readCartCookie(): Promise<LocalCartItem[]> {
  const raw = (await cookies()).get('cart')?.value;
  try {
    return raw ? (JSON.parse(raw) as LocalCartItem[]) : [];
  } catch {
    return [];
  }
}

async function writeCartCookie(items: LocalCartItem[]): Promise<void> {
  (await cookies()).set('cart', JSON.stringify(items), { path: '/' });
}

async function findProductByVariantIdUniversal(variantId: string): Promise<{ product: Product; variant: ProductVariant } | undefined> {
  if (process.env.USE_DB === 'true') {
    const all = await getDbProducts();
    for (const product of all) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (variant) return { product, variant } as any;
    }
    return undefined;
  }
  return findProductByVariantId(variantId) as any;
}

async function toCart(lines: LocalCartItem[]): Promise<Cart> {
  const cartItems: CartItem[] = [];
  for (const line of lines) {
    const found = await findProductByVariantIdUniversal(line.merchandiseId);
    if (!found) continue;
    const { product, variant } = found;
    cartItems.push({
      id: line.merchandiseId,
      quantity: line.quantity,
      cost: { totalAmount: { amount: (Number(variant.price.amount) * line.quantity).toString(), currencyCode: variant.price.currencyCode } },
      merchandise: {
        id: variant.id,
        title: variant.title,
        selectedOptions: variant.selectedOptions,
        product: {
          id: product.id,
          handle: product.handle,
          title: product.title,
          featuredImage: product.featuredImage
        }
      }
    });
  }
  const totalAmount = cartItems.reduce((sum, li) => sum + Number(li.cost.totalAmount.amount), 0);
  const totalQuantity = cartItems.reduce((sum, li) => sum + li.quantity, 0);
  const currency = cartItems[0]?.cost.totalAmount.currencyCode ?? 'ARS';
  return {
    id: 'local-cart',
    checkoutUrl: '/api/mercadopago/checkout',
    lines: cartItems,
    totalQuantity,
    cost: {
      subtotalAmount: { amount: totalAmount.toString(), currencyCode: currency },
      totalAmount: { amount: totalAmount.toString(), currencyCode: currency },
      totalTaxAmount: { amount: '0', currencyCode: currency }
    }
  };
}

export async function createCart(): Promise<Cart> {
  await writeCartCookie([]);
  return await toCart([]);
}

export async function addToCart(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const current = await readCartCookie();
  for (const l of lines) {
    const idx = current.findIndex((i) => i.merchandiseId === l.merchandiseId);
    if (idx >= 0) current[idx].quantity += l.quantity;
    else current.push({ merchandiseId: l.merchandiseId, quantity: l.quantity });
  }
  await writeCartCookie(current);
  return await toCart(current);
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  const current = await readCartCookie();
  const next = current.filter((i) => !lineIds.includes(i.merchandiseId));
  await writeCartCookie(next);
  return await toCart(next);
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const current = await readCartCookie();
  for (const l of lines) {
    const idx = current.findIndex((i) => i.merchandiseId === l.merchandiseId);
    if (idx >= 0) {
      if (l.quantity <= 0) current.splice(idx, 1);
      else current[idx].quantity = l.quantity;
    } else if (l.quantity > 0) {
      current.push({ merchandiseId: l.merchandiseId, quantity: l.quantity });
    }
  }
  await writeCartCookie(current);
  return await toCart(current);
}

export async function getCart(): Promise<Cart | undefined> {
  const current = await readCartCookie();
  if (!current.length) return undefined;
  return await toCart(current);
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  return getCollectionByHandle(handle);
}

export async function getCollectionProducts({
  collection
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  // If using DB, derive homepage collections from product tags
  if (process.env.USE_DB === 'true') {
    const all = await getDbProducts();
    const byUpdated = [...all].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
    const withTag = (tag: string) => byUpdated.filter((p) => (p.tags || []).map((t) => t.toLowerCase()).includes(tag));

    if (collection === 'hidden-homepage-featured-items') {
      const featured = withTag('homepage-featured');
      return featured.length >= 3 ? featured.slice(0, 3) : byUpdated.slice(0, 3);
    }
    if (collection === 'hidden-homepage-carousel') {
      const carousel = withTag('homepage-carousel');
      const base = carousel.length ? carousel : byUpdated;
      return base.slice(0, 8);
    }
    // Fallback: all products
    return byUpdated;
  }

  // Local data fallback (no DB)
  return getProductsForCollection(collection);
}

export async function getCollections(): Promise<Collection[]> {
  return COLLECTIONS;
}

export async function getMenu(handle: string): Promise<Menu[]> {
  if (handle.includes('header')) return getHeaderMenu();
  if (handle.includes('footer')) return getFooterMenu();
  return [];
}

export async function getPage(handle: string): Promise<Page | undefined> {
  return findPage(handle);
}

export async function getPages(): Promise<Page[]> {
  return PAGES;
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  if (process.env.USE_DB === 'true') {
    return getDbProductByHandle(handle);
  }
  return findProductByHandle(handle);
}

export async function getProductRecommendations(productId: string): Promise<Product[]> {
  // Prefer DB-backed recommendations when enabled
  if (process.env.USE_DB === 'true') {
    const all = await getDbProducts();
    const current = all.find((p) => p.id === productId);
    let pool = all.filter((p) => p.id !== productId);

    // If current has tags, prefer products sharing at least one tag
    const tags = (current?.tags || []).map((t) => t.toLowerCase());
    if (tags.length) {
      const tagSet = new Set(tags);
      const withSharedTags = pool.filter((p) => (p.tags || []).some((t) => tagSet.has(t.toLowerCase())));
      if (withSharedTags.length) pool = withSharedTags;
    }
    // Sort by updatedAt desc and limit
    pool.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
    return pool.slice(0, 4);
  }

  // Fallback to demo data when DB is disabled
  const pool = PRODUCTS.filter((p) => p.id !== productId);
  return pool.slice(0, 4);
}

export async function getProducts({
  query,
  reverse,
  sortKey,
  skip,
  take
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
  skip?: number;
  take?: number;
}): Promise<Product[]> {
  if (process.env.USE_DB === 'true') {
    // Fetch with pagination from DB
    return getDbProducts(query, { skip, take });
  }
  let list = PRODUCTS;
  if (query) {
    const q = query.toLowerCase();
    list = list.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  // Simple order by updatedAt desc to match DB behavior
  list = [...list].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  if (typeof skip === 'number' || typeof take === 'number') {
    const s = skip ?? 0;
    const t = take ?? list.length;
    return list.slice(s, s + t);
  }
  return list;
}

// No-op revalidation to keep API shape
export async function revalidate(_req: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ status: 200, revalidated: true, now: Date.now(), provider: 'local' });
}

export { findProductByVariantIdUniversal };
