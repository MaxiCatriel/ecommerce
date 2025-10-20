import { GridTileImage } from 'components/grid/tile';
import { getCollectionProducts } from 'lib/shopify';
import type { Product } from 'lib/shopify/types';
import Link from 'next/link';

function ThreeItemGridItem({
  item,
  size,
  priority,
  showPrices
}: {
  item: Product;
  size: 'full' | 'half';
  priority?: boolean;
  showPrices: boolean;
}) {
  const title = item.title || 'Producto';
  const hasImg = Boolean(item.featuredImage?.url);
  const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'>\n  <rect width='100%' height='100%' fill='#f3f4f6'/>\n  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='#9ca3af'>${title}</text>\n</svg>`
  )}`;
  const src = hasImg ? (item.featuredImage?.url as string) : placeholder;

  return (
    <div
      className={size === 'full' ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-1'}
    >
      <Link
        className="relative block aspect-square h-full w-full"
        href={`/product/${item.handle}`}
        prefetch={true}
      >
        <GridTileImage
          src={src}
          fill
          sizes={
            size === 'full' ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw'
          }
          priority={priority}
          alt={title}
          label={{
            position: size === 'full' ? 'center' : 'bottom',
            title: title as string,
            amount: showPrices ? item.priceRange.maxVariantPrice.amount : '',
            currencyCode: showPrices ? item.priceRange.maxVariantPrice.currencyCode : ''
          }}
        />
      </Link>
    </div>
  );
}

export async function ThreeItemGrid({ showPrices }: { showPrices: boolean }) {
  // Collections that start with `hidden-*` are hidden from the search page.
  const homepageItems = await getCollectionProducts({
    collection: 'hidden-homepage-featured-items'
  });

  const items = homepageItems.slice(0, 3);
  if (!items.length) return null;

  return (
    <section className="mx-auto grid max-w-(--breakpoint-2xl) gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2 lg:max-h-[calc(100vh-200px)]">
      {items[0] ? <ThreeItemGridItem size="full" item={items[0]} priority={true} showPrices={showPrices} /> : null}
      {items[1] ? <ThreeItemGridItem size="half" item={items[1]} priority={true} showPrices={showPrices} /> : null}
      {items[2] ? <ThreeItemGridItem size="half" item={items[2]} showPrices={showPrices} /> : null}
    </section>
  );
}
