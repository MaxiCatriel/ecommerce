'use client';

import { useI18n } from 'components/i18n/provider';

const languages = [
  { code: 'es', label: 'ES', flag: '🇪🇸', name: 'Español' },
  { code: 'en', label: 'EN', flag: '🇺🇸', name: 'English' },
  { code: 'pt', label: 'PT', flag: '🇵🇹', name: 'Português' }
];

export default function LangSwitcher() {
  const { locale } = useI18n();

  const setLang = (l: string) => {
    document.cookie = `lang=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.location.reload();
  };

  const currentLang = languages.find(lang => lang.code === locale);
  if (!currentLang) return null; // Fallback in case locale is not found

  return (
    <div className="relative">
      <div className="flex items-center">
        <span className="text-sm mr-1">{currentLang.flag}</span>
        <select
          value={locale}
          onChange={(e) => setLang(e.target.value)}
          className="appearance-none bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 pr-6 text-sm cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <span className="text-neutral-500 text-xs">▼</span>
        </div>
      </div>
    </div>
  );
}

