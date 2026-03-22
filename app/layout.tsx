import type { Metadata } from 'next'
import { Source_Serif_4, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { ConsentProvider } from '@/lib/consent-context'
import { CookieConsent } from '@/components/cookie-consent'
import { SiteWrapper } from '@/components/site-wrapper'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const sourceSerif = Source_Serif_4({ 
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Alex Chen - Personal Blog',
    template: '%s | Alex Chen',
  },
  description: 'Writing about work, life, hobbies, and experiences. A personal blog about the things that make me curious.',
  keywords: ['blog', 'personal', 'work', 'life', 'hobbies', 'experiences'],
  authors: [{ name: 'Alex Chen' }],
  creator: 'Alex Chen',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://example.com',
    siteName: 'Alex Chen',
    title: 'Alex Chen - Personal Blog',
    description: 'Writing about work, life, hobbies, and experiences.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alex Chen - Personal Blog',
    description: 'Writing about work, life, hobbies, and experiences.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${sourceSerif.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ConsentProvider>
            <SiteWrapper>
              {children}
            </SiteWrapper>
            <CookieConsent />
          </ConsentProvider>
        </ThemeProvider>
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
