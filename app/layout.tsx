import type { Metadata } from 'next'
import {
  Source_Serif_4,
  Inter,
  Merriweather,
  Lato,
  Playfair_Display,
  Roboto,
  Lora,
  Nunito,
  Libre_Baskerville,
} from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { ConsentProvider } from '@/lib/consent-context'
import { CookieConsent } from '@/components/cookie-consent'
import { SiteWrapper } from '@/components/site-wrapper'
import { Toaster } from '@/components/ui/sonner'
import { getSettings } from '@/lib/settings'
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

const merriweather = Merriweather({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '700'],
  display: 'swap',
  preload: false,
})

const lato = Lato({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '700'],
  display: 'swap',
  preload: false,
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  preload: false,
})

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: false,
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  preload: false,
})

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: false,
})

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '700'],
  display: 'swap',
  preload: false,
})

const fontPairClasses = {
  'inter-source-serif': `${inter.variable} ${sourceSerif.variable}`,
  'inter-merriweather': `${inter.variable} ${merriweather.variable}`,
  'lato-playfair': `${lato.variable} ${playfairDisplay.variable}`,
  'roboto-lora': `${roboto.variable} ${lora.variable}`,
  'nunito-libre-baskerville': `${nunito.variable} ${libreBaskerville.variable}`,
} as const

const colorPresets = {
  'warm-terracotta': {
    lightPrimary: 'oklch(0.622 0.138 44)',
    darkPrimary: 'oklch(0.720 0.120 46)',
  },
  'ocean-blue': {
    lightPrimary: 'oklch(0.60 0.14 240)',
    darkPrimary: 'oklch(0.72 0.12 240)',
  },
  'forest-green': {
    lightPrimary: 'oklch(0.62 0.13 150)',
    darkPrimary: 'oklch(0.74 0.11 150)',
  },
  'midnight-purple': {
    lightPrimary: 'oklch(0.56 0.16 310)',
    darkPrimary: 'oklch(0.70 0.13 310)',
  },
  monochrome: {
    lightPrimary: 'oklch(0.40 0 0)',
    darkPrimary: 'oklch(0.82 0 0)',
  },
} as const

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const siteName = settings.branding.siteName || 'Lester J.'
  const description =
    'Writing about work, life, hobbies, and experiences. A personal blog about the things that make me curious.'

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

  return {
    title: {
      default: `${siteName} - Personal Blog`,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: ['blog', 'personal', 'work', 'life', 'hobbies', 'experiences'],
    authors: [{ name: siteName }],
    creator: siteName,
    openGraph: {
      type: 'website',
      locale: 'en_CA',
      url: siteUrl,
      siteName,
      title: `${siteName} - Personal Blog`,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteName} - Personal Blog`,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: settings.branding.faviconUrl
      ? {
          icon: settings.branding.faviconUrl,
          shortcut: settings.branding.faviconUrl,
          apple: settings.branding.faviconUrl,
        }
      : undefined,
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSettings()
  const fontPairClass =
    fontPairClasses[
      settings.appearance.fontPair as keyof typeof fontPairClasses
    ] ?? fontPairClasses['inter-source-serif']
  const preset =
    colorPresets[
      settings.appearance.colorPreset as keyof typeof colorPresets
    ] ?? colorPresets['warm-terracotta']
  const primaryLight = settings.appearance.customPrimaryOklch || preset.lightPrimary
  const primaryDark = settings.appearance.customPrimaryOklch || preset.darkPrimary

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <style>{`
          :root {
            --primary: ${primaryLight};
            --ring: ${primaryLight};
          }
          .dark {
            --primary: ${primaryDark};
            --ring: ${primaryDark};
          }
        `}</style>
      </head>
      <body className={`${fontPairClass} font-sans antialiased min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ConsentProvider adsenseClientId={settings.ads.clientId}>
            <SiteWrapper branding={settings.branding} links={settings.links}>
              {children}
            </SiteWrapper>
            <CookieConsent />
          </ConsentProvider>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
