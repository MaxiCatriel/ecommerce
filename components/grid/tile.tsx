import clsx from 'clsx';
import Image from 'next/image';
import Label from '../label';

export function GridTileImage({
  isInteractive = true,
  active,
  label,
  ...props
}: {
  isInteractive?: boolean;
  active?: boolean;
  label?: {
    title: string;
    amount: string;
    currencyCode: string;
    position?: 'bottom' | 'center';
  };
} & React.ComponentProps<typeof Image>) {
  return (
    <div
      className={clsx(
        'group flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-white hover:border-blue-600 dark:bg-black',
        {
          relative: label,
          'border-2 border-blue-600': active,
          'border-neutral-200 dark:border-neutral-800': !active
        }
      )}
    >
      {(() => {
        const hasSrc = Boolean(props.src);
        const title = label?.title || 'Producto';
        const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'>\n  <rect width='100%' height='100%' fill='#f3f4f6'/>\n  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='#9ca3af'>${title}</text>\n</svg>`
        )}`;
        const imgProps = { ...props, src: hasSrc ? (props.src as string) : (placeholder as string) } as any;
        return (
          <Image
            className={clsx('relative h-full w-full object-contain', {
              'transition duration-300 ease-in-out group-hover:scale-105': isInteractive
            })}
            {...imgProps}
          />
        );
      })()}
      {label ? (
        <Label
          title={label.title}
          amount={label.amount}
          currencyCode={label.currencyCode}
          position={label.position}
        />
      ) : null}
    </div>
  );
}
