import { getCollectionProducts } from 'lib/shopify';
import Link from 'next/link';
import { GridTileImage } from './grid/tile';

export async function Carousel({ showPrices }: { showPrices: boolean }) {
  // Collections that start with `hidden-*` are hidden from the search page.
  const products = await getCollectionProducts({ collection: 'hidden-homepage-carousel' });

  if (!products?.length) return null;

  // Purposefully duplicating products to make the carousel loop and not run out of products on wide screens.
  const carouselProducts = [...products, ...products, ...products];

  return (
    <div className="w-full overflow-x-auto pb-6 pt-1">
      <ul className="flex animate-carousel gap-4">
        {carouselProducts.map((product, i) => (
          <li
            key={`${product.handle}${i}`}
            className="relative aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none md:w-1/3"
          >
            <Link href={`/product/${product.handle}`} className="relative h-full w-full">
              {(() => {
                const title = product.title || 'Producto';
                const hasImg = Boolean(product.featuredImage?.url);
                const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(
                  `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'>\n  <rect width='100%' height='100%' fill='#f3f4f6'/>\n  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='#9ca3af'>${title}</text>\n</svg>`
                )}`;
                const src = hasImg ? (product.featuredImage?.url as string) : placeholder;
                return (
                  <GridTileImage
                    alt={title}
                    label={{
                      title,
                      amount: showPrices ? product.priceRange.maxVariantPrice.amount : '',
                      currencyCode: showPrices ? product.priceRange.maxVariantPrice.currencyCode : ''
                    }}
                    src={src}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  />
                );
              })()}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
