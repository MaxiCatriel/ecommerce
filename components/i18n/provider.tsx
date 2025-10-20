'use client';

import { createContext, useContext } from 'react';
import type { Dict } from 'lib/i18n/server';
import type { Locale } from 'lib/i18n/config';

type Ctx = { t: Dict; locale: Locale };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children, dict, locale }: { children: React.ReactNode; dict: Dict; locale: Locale }) {
  return <I18nContext.Provider value={{ t: dict, locale }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

