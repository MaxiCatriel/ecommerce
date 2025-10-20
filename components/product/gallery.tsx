'use client';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { GridTileImage } from 'components/grid/tile';
import { useProduct, useUpdateURL } from 'components/product/product-context';
import Image from 'next/image';

export function Gallery({ images }: { images: { src: string; altText: string }[] }) {
  const { state, updateImage } = useProduct();
  const updateURL = useUpdateURL();
  const imageIndex = state.image ? parseInt(state.image) : 0;

  const displayImages = images.length ? images : [{ src: '', altText: 'Producto' }];

  const nextImageIndex = imageIndex + 1 < displayImages.length ? imageIndex + 1 : 0;
  const previousImageIndex = imageIndex === 0 ? displayImages.length - 1 : imageIndex - 1;

  const buttonClassName =
    'h-full px-6 transition-all ease-in-out hover:scale-110 hover:text-black dark:hover:text-white flex items-center justify-center';

  return (
    <form>
      <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden">
        {displayImages[imageIndex] && (
          (() => {
            const img = displayImages[imageIndex]!;
            const hasSrc = Boolean(img.src);
            const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(
              `<svg xmlns='http://www.w3.org/2000/svg' width='1400' height='1400'>\n  <rect width='100%' height='100%' fill='#f3f4f6'/>\n  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='#9ca3af'>${img.altText || 'Producto'}</text>\n</svg>`
            )}`;
            const src = hasSrc ? (img.src as string) : placeholder;
            return (
              <Image
                className="h-full w-full object-contain"
                fill
                sizes="(min-width: 1024px) 66vw, 100vw"
                alt={img.altText as string}
                src={src}
                priority={true}
              />
            );
          })()
        )}

        {displayImages.length > 1 ? (
          <div className="absolute bottom-[15%] flex w-full justify-center">
            <div className="mx-auto flex h-11 items-center rounded-full border border-white bg-neutral-50/80 text-neutral-500 backdrop-blur-sm dark:border-black dark:bg-neutral-900/80">
              <button
                formAction={() => {
                  const newState = updateImage(previousImageIndex.toString());
                  updateURL(newState);
                }}
                aria-label="Previous product image"
                className={buttonClassName}
              >
                <ArrowLeftIcon className="h-5" />
              </button>
              <div className="mx-1 h-6 w-px bg-neutral-500"></div>
              <button
                formAction={() => {
                  const newState = updateImage(nextImageIndex.toString());
                  updateURL(newState);
                }}
                aria-label="Next product image"
                className={buttonClassName}
              >
                <ArrowRightIcon className="h-5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {displayImages.length > 1 ? (
        <ul className="my-12 flex items-center flex-wrap justify-center gap-2 overflow-auto py-1 lg:mb-0">
          {displayImages.map((image, index) => {
            const isActive = index === imageIndex;

            return (
              <li key={image.src} className="h-20 w-20">
                <button
                  formAction={() => {
                    const newState = updateImage(index.toString());
                    updateURL(newState);
                  }}
                  aria-label="Select product image"
                  className="h-full w-full"
                >
                  {(() => {
                    const hasSrc = Boolean(image.src);
                    const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(
                      `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>\n  <rect width='100%' height='100%' fill='#f3f4f6'/>\n  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='#9ca3af'>${image.altText || 'Producto'}</text>\n</svg>`
                    )}`;
                    const src = hasSrc ? image.src : placeholder;
                    return (
                      <GridTileImage
                        alt={image.altText}
                        src={src}
                        width={80}
                        height={80}
                        active={isActive}
                      />
                    );
                  })()}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </form>
  );
}
