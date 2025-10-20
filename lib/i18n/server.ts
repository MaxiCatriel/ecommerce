import { cookies, headers } from 'next/headers';
import { Locale, normalizeLocale, defaultLocale } from './config';

export type Dict = typeof import('./dictionaries/es').default;

export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const fromCookie = c.get('lang')?.value;
  if (fromCookie) return normalizeLocale(fromCookie);
  const h = await headers();
  const al = h.get('accept-language');
  if (al) return normalizeLocale(al.split(',')[0]);
  return defaultLocale;
}

export async function getDictionary(locale: Locale): Promise<Dict> {
  switch (locale) {
    case 'en':
      return (await import('./dictionaries/en')).default;
    case 'pt':
      return (await import('./dictionaries/pt')).default;
    case 'es':
    default:
      return (await import('./dictionaries/es')).default;
  }
}

