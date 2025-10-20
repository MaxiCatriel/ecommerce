import clsx from 'clsx';
import LogoIcon from './icons/logo';

const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL;

export default function LogoSquare({ size }: { size?: 'sm' | undefined }) {
  return (
    <div
      className={clsx(
        'flex flex-none items-center justify-center border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-black',
        {
          'h-[40px] w-[40px] rounded-xl': !size,
          'h-[30px] w-[30px] rounded-lg': size === 'sm'
        }
      )}
    >
      {logoUrl ? (
        // Prefer a user-provided logo if NEXT_PUBLIC_LOGO_URL is set (e.g., /logo.svg)
        // Use a plain <img> to avoid Next image domain config for remote URLs
        <img
          src={logoUrl}
          alt={`${process.env.SITE_NAME || 'Store'} logo`}
          className={clsx('object-contain', {
            'h-[22px] w-[22px]': !size,
            'h-[16px] w-[16px]': size === 'sm'
          })}
        />
      ) : (
        <LogoIcon
          className={clsx({
            'h-[16px] w-[16px]': !size,
            'h-[10px] w-[10px]': size === 'sm'
          })}
        />
      )}
    </div>
  );
}
