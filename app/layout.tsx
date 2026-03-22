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
  preload: false,
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: {
    default: 'Lester J. - Personal Blog',
    template: '%s | Lester J.',
  },
  description: 'Writing about work, life, hobbies, and experiences. A personal blog about the things that make me curious.',
  keywords: ['blog', 'personal', 'work', 'life', 'hobbies', 'experiences'],
  authors: [{ name: 'Lester J.' }],
  creator: 'Lester J.',
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: 'https://example.com',
    siteName: 'Lester J.',
    title: 'Lester J. - Personal Blog',
    description: 'Writing about work, life, hobbies, and experiences.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lester J. - Personal Blog',
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
      <body className={`${inter.variable} ${sourceSerif.variable} font-sans antialiased min-h-screen`}>
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
