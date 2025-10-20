import { AddToCart } from 'components/cart/add-to-cart';
import Price from 'components/price';
import Prose from 'components/prose';
import { Product } from 'lib/shopify/types';
import { VariantSelector } from './variant-selector';
import Link from 'next/link';
import { getDictionary, getLocale } from 'lib/i18n/server';

export async function ProductDescription({ product, showPrices = true }: { product: Product; showPrices?: boolean }) {
  const dict = await getDictionary(await getLocale());
  return (
    <>
      <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700">
        <h1 className="mb-2 text-5xl font-medium">{product.title}</h1>
        {showPrices ? (
          <div className="mr-auto w-auto rounded-full bg-blue-600 p-2 text-sm text-white">
            <Price
              amount={product.priceRange.maxVariantPrice.amount}
              currencyCode={product.priceRange.maxVariantPrice.currencyCode}
            />
          </div>
        ) : (
          <div className="mr-auto w-auto rounded-full bg-neutral-200 p-2 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            {dict.common.loginToSeePrices}
          </div>
        )}
      </div>
      <VariantSelector options={product.options} variants={product.variants} />
      {product.descriptionHtml ? (
        <Prose
          className="mb-6 text-sm leading-tight dark:text-white/[60%]"
          html={product.descriptionHtml}
        />
      ) : null}
      {showPrices ? (
        <AddToCart product={product} />
      ) : (
        <Link href="/login" className="inline-block rounded-full bg-blue-600 px-4 py-3 text-sm text-white">
          {dict.common.loginToBuy}
        </Link>
      )}
    </>
  );
}
