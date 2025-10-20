import { prisma } from 'lib/db';
import type { Product as CommerceProduct, Image as CommerceImage, ProductVariant, ProductOption } from 'lib/shopify/types';

const useDb = () => process.env.USE_DB === 'true';

function mapImages(images: { url: string; altText: string | null; width: number | null; height: number | null }[]): CommerceImage[] {
  return images.map((i) => ({
    url: i.url,
    altText: i.altText || '',
    width: i.width || 1200,
    height: i.height || 1200
  }));
}

function parseSelectedOptions(raw: any): { name: string; value: string }[] {
  if (Array.isArray(raw)) return raw as any[];
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapVariants(variants: any[], currencyFallback: string): ProductVariant[] {
  return variants.map((v) => ({
    id: v.id,
    title: v.title,
    availableForSale: Boolean(v.availableForSale) && Number(v.stock ?? 0) > 0,
    selectedOptions: parseSelectedOptions((v as any).selectedOptions),
    price: { amount: v.priceAmount, currencyCode: v.currencyCode || currencyFallback }
  }));
}

function buildOptionsFromVariants(variants: ProductVariant[]): ProductOption[] {
  const map = new Map<string, Set<string>>();
  for (const v of variants) {
    for (const opt of v.selectedOptions) {
      const key = opt.name;
      if (!map.has(key)) map.set(key, new Set<string>());
      map.get(key)!.add(opt.value);
    }
  }
  const options: ProductOption[] = [];
  for (const [name, valuesSet] of map.entries()) {
    options.push({ id: name.toLowerCase(), name, values: Array.from(valuesSet) });
  }
  return options.length
    ? options
    : [{ id: 'default', name: 'Default', values: ['Default'] }];
}

export async function getDbProducts(
  query?: string,
  opts?: { skip?: number; take?: number }
): Promise<CommerceProduct[]> {
  const where = query
    ? { OR: [{ title: { contains: query } }, { description: { contains: query } }] }
    : {};
  const products = await prisma.product.findMany({
    where,
    include: { images: true, variants: true },
    orderBy: { updatedAt: 'desc' },
    skip: opts?.skip,
    take: opts?.take
  });

  return products.map((p) => {
    const mappedVariants = p.variants.length
      ? mapVariants(p.variants as any[], p.currencyCode)
      : [
          {
            id: `${p.id}:default`,
            title: 'Default Title',
            availableForSale: p.availableForSale,
            selectedOptions: [{ name: 'Default', value: 'Default' }],
            price: { amount: p.priceAmount, currencyCode: p.currencyCode }
          }
        ];
    const options = buildOptionsFromVariants(mappedVariants);
    return ({
    id: p.id,
    handle: p.handle,
    availableForSale: p.availableForSale,
    title: p.title,
    description: p.description,
    descriptionHtml: p.descriptionHtml,
    options,
    priceRange: {
      maxVariantPrice: { amount: p.priceAmount, currencyCode: p.currencyCode },
      minVariantPrice: { amount: p.priceAmount, currencyCode: p.currencyCode }
    },
    variants: mappedVariants,
    featuredImage: p.featuredImageUrl
      ? { url: p.featuredImageUrl, altText: p.title, width: 1200, height: 1200 }
      : { url: '', altText: '', width: 0, height: 0 },
    images: mapImages(p.images as any[]),
    seo: { title: p.seoTitle || p.title, description: p.seoDescription || p.description },
    tags: p.tags ? p.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    updatedAt: p.updatedAt.toISOString()
  });
  });
}

export async function getDbProductByHandle(handle: string): Promise<CommerceProduct | undefined> {
  const raw = decodeURIComponent(handle || '');
  const slugify = (s: string) =>
    s
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_]+/g, '-')
      .toLowerCase();

  // Try exact match first
  let p = await prisma.product.findUnique({ where: { handle: raw }, include: { images: true, variants: true } });
  if (!p) {
    // Try flexible fallbacks
    const candidates = Array.from(
      new Set([raw, raw.trim(), raw.toLowerCase().trim(), slugify(raw)])
    );
    p = await prisma.product.findFirst({ where: { OR: candidates.map((h) => ({ handle: h })) }, include: { images: true, variants: true } });
  }
  if (!p) return undefined;
  // Map single product into storefront type (reuse logic from getDbProducts)
  const mappedVariants = p.variants.length
    ? mapVariants(p.variants as any[], p.currencyCode)
    : [
        {
          id: `${p.id}:default`,
          title: 'Default Title',
          availableForSale: p.availableForSale,
          selectedOptions: [{ name: 'Default', value: 'Default' }],
          price: { amount: p.priceAmount, currencyCode: p.currencyCode }
        }
      ];
  const options = buildOptionsFromVariants(mappedVariants);
  return {
    id: p.id,
    handle: p.handle,
    availableForSale: p.availableForSale,
    title: p.title,
    description: p.description,
    descriptionHtml: p.descriptionHtml,
    options,
    priceRange: {
      maxVariantPrice: { amount: p.priceAmount, currencyCode: p.currencyCode },
      minVariantPrice: { amount: p.priceAmount, currencyCode: p.currencyCode }
    },
    variants: mappedVariants,
    featuredImage: p.featuredImageUrl
      ? { url: p.featuredImageUrl, altText: p.title, width: 1200, height: 1200 }
      : { url: '', altText: '', width: 0, height: 0 },
    images: mapImages(p.images as any[]),
    seo: { title: p.seoTitle || p.title, description: p.seoDescription || p.description },
    tags: p.tags ? p.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    updatedAt: p.updatedAt.toISOString()
  };
}
