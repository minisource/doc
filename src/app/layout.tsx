import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { RootProvider } from 'fumadocs-ui/provider'
import './(fumadocs)/global.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fumadocs + Payload CMS',
  description: 'Documentation platform powered by Fumadocs and Payload CMS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // RTL languages
  const rtlLocales = ['fa', 'ar', 'he'];

  // Default locale (can be made configurable via env)
  const defaultLocale = process.env.FUMADOCS_DEFAULT_LOCALE || 'en';

  // Check if current locale is RTL
  const isRTL = rtlLocales.includes(defaultLocale);

  return (
    <RootProvider
      dir={isRTL ? 'rtl' : 'ltr'}
      i18n={{
        locale: defaultLocale,
        translations: {
          search: 'Search',
          searchNoResult: 'No results found',
          toc: 'Table of Contents',
          tocNoHeadings: 'No headings found',
          lastUpdate: 'Last updated',
          chooseLanguage: 'Choose language',
          nextPage: 'Next page',
          previousPage: 'Previous page',
          chooseTheme: 'Choose theme',
          editOnGithub: 'Edit on GitHub',
        },
        // Persian translations will be loaded dynamically based on locale
        locales: [
          { locale: 'en', name: 'English' },
          { locale: 'es', name: 'Español' },
          { locale: 'fr', name: 'Français' },
          { locale: 'de', name: 'Deutsch' },
          { locale: 'fa', name: 'فارسی' },
        ],
      }}
    >
      <html lang={defaultLocale} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning>
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </RootProvider>
  )
}