import { Product, ProductVariant, Image, SEO, ProductOption } from 'lib/shopify/types';

// Simple embedded catalog to replace Shopify for now.
// Prices are in ARS for Mercado Pago (currencyCode: 'ARS').

const placeholderImage = (title: string): Image => ({
  url:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200' style='background:#f5f5f5'>` +
        `<rect width='100%' height='100%' fill='#f5f5f5'/>` +
        `<text x='50%' y='50%' alignment-baseline='middle' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='42' fill='#777'>${title}</text>` +
      `</svg>`
    ),
  altText: `${title} image`,
  width: 1200,
  height: 1200
});

function oneVariant(
  id: string,
  title: string,
  amount: string,
  currencyCode: string
): ProductVariant[] {
  return [
    {
      id: id + ':default',
      title: 'Default',
      availableForSale: true,
      selectedOptions: [{ name: 'Default', value: 'Default' }],
      price: { amount, currencyCode }
    }
  ];
}

function defaultOptions(): ProductOption[] {
  return [
    {
      id: 'default',
      name: 'Default',
      values: ['Default']
    }
  ];
}

export const PRODUCTS: Product[] = [
  {
    id: 'prod_alfajor',
    handle: 'alfajor-artesanal',
    availableForSale: true,
    title: 'Alfajor artesanal',
    description: 'Alfajor artesanal de dulce de leche con cobertura de chocolate.',
    descriptionHtml:
      '<p>Alfajor artesanal de dulce de leche con cobertura de chocolate. Peso neto 60g.</p>',
    options: defaultOptions(),
    priceRange: {
      maxVariantPrice: { amount: '2500', currencyCode: 'ARS' },
      minVariantPrice: { amount: '2500', currencyCode: 'ARS' }
    },
    variants: oneVariant('prod_alfajor', 'Default', '2500', 'ARS'),
    featuredImage: placeholderImage('Alfajor artesanal'),
    images: [placeholderImage('Alfajor artesanal'), placeholderImage('Alfajor artesanal 2')],
    seo: { title: 'Alfajor artesanal', description: 'Delicioso alfajor artesanal argentino.' },
    tags: ['alfajor', 'dulce'],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_mate',
    handle: 'mate-calabaza',
    availableForSale: true,
    title: 'Mate de calabaza',
    description: 'Mate tradicional de calabaza con virola de acero inoxidable.',
    descriptionHtml:
      '<p>Mate tradicional de calabaza con virola de acero inoxidable. Incluye bombilla.</p>',
    options: defaultOptions(),
    priceRange: {
      maxVariantPrice: { amount: '18000', currencyCode: 'ARS' },
      minVariantPrice: { amount: '18000', currencyCode: 'ARS' }
    },
    variants: oneVariant('prod_mate', 'Default', '18000', 'ARS'),
    featuredImage: placeholderImage('Mate de calabaza'),
    images: [placeholderImage('Mate de calabaza')],
    seo: { title: 'Mate de calabaza', description: 'El mate clásico argentino.' },
    tags: ['mate', 'calabaza'],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_camiseta',
    handle: 'camiseta-argentina',
    availableForSale: true,
    title: 'Camiseta Argentina',
    description: 'Camiseta deportiva de la selección argentina, tela respirable.',
    descriptionHtml:
      '<p>Camiseta deportiva de la selección argentina, tela respirable, varios talles.</p>',
    options: [
      { id: 'size', name: 'Talle', values: ['S', 'M', 'L', 'XL'] }
    ],
    priceRange: {
      maxVariantPrice: { amount: '52000', currencyCode: 'ARS' },
      minVariantPrice: { amount: '52000', currencyCode: 'ARS' }
    },
    variants: ['S', 'M', 'L', 'XL'].map((size) => ({
      id: `prod_camiseta:${size}`,
      title: `Talle ${size}`,
      availableForSale: true,
      selectedOptions: [{ name: 'Talle', value: size }],
      price: { amount: '52000', currencyCode: 'ARS' }
    })),
    featuredImage: placeholderImage('Camiseta Argentina'),
    images: [placeholderImage('Camiseta Argentina')],
    seo: { title: 'Camiseta Argentina', description: 'Camiseta oficial (no original).' },
    tags: ['camiseta', 'indumentaria'],
    updatedAt: new Date().toISOString()
  }
];

export function findProductByHandle(handle: string): Product | undefined {
  return PRODUCTS.find((p) => p.handle === handle);
}

export function findProductByVariantId(variantId: string) {
  for (const product of PRODUCTS) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return { product, variant };
  }
  return undefined;
}

