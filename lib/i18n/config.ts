export const locales = ['es', 'en', 'pt'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'es';

export function normalizeLocale(input?: string | null): Locale {
  const v = String(input || '').toLowerCase();
  if ((locales as readonly string[]).includes(v)) return v as Locale;
  if (v.startsWith('es')) return 'es';
  if (v.startsWith('en')) return 'en';
  if (v.startsWith('pt')) return 'pt';
  return defaultLocale;
}

