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
  return (
    <RootProvider
      i18n={{
        locale: 'en',
        translations: {
          search: 'Search documentation...',
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
        locales: [
          { locale: 'en', name: 'English' },
          { locale: 'es', name: 'Español' },
          { locale: 'fr', name: 'Français' },
          { locale: 'de', name: 'Deutsch' },
        ],
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </RootProvider>
  )
}