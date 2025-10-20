import { Analytics } from '@vercel/analytics/react';
import AuthSessionProvider from 'components/auth/session-provider';
import { CartProvider } from 'components/cart/cart-context';
import { I18nProvider } from 'components/i18n/provider';
import { Navbar } from 'components/layout/navbar';
import { EmailPopup } from 'components/newsletter';
import { QueryProvider } from 'components/providers/query-provider';
import { WelcomeToast } from 'components/welcome-toast';
import { GeistSans } from 'geist/font/sans';
import { getDictionary, getLocale } from 'lib/i18n/server';
import { getCart } from 'lib/shopify';
import { baseUrl } from 'lib/utils';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { authOptions } from '../auth';
import { ChatWidget } from '../components/chat/widget';
import './globals.css';

const { SITE_NAME } = process.env;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME || 'Next.js Commerce',
    template: `%s | ${SITE_NAME || 'Next.js Commerce'}`
  },
  robots: {
    follow: true,
    index: true
  }
};

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  // Don't await the fetch, pass the Promise to the context provider
  const cart = getCart();
  const session = await getServerSession(authOptions);
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <html lang={locale} className={GeistSans.variable}>
      <body className="bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white">
        <I18nProvider dict={dict} locale={locale}>
          <QueryProvider>
            <AuthSessionProvider session={session}>
              <CartProvider cartPromise={cart}>
                <Navbar />
                <main>
                  {children}
                  <Toaster closeButton />
                  <WelcomeToast />
                  <EmailPopup />
                  {process.env.NEXT_PUBLIC_ENABLE_CHAT === 'true' && <ChatWidget />}
                </main>
              </CartProvider>
            </AuthSessionProvider>
          </QueryProvider>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
