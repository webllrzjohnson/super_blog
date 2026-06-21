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
  Newsreader,
  IBM_Plex_Sans,
} from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { ConsentProvider } from '@/lib/consent-context'
import { CookieConsent } from '@/components/cookie-consent'
import { SiteWrapper } from '@/components/site-wrapper'
import { Toaster } from '@/components/ui/sonner'
import { getSettings } from '@/lib/settings'
import './globals.css'
import { colorPresets } from '@/lib/theme-presets'

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

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  preload: false,
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600'],
  display: 'swap',
  preload: false,
})

const fontPairClasses = {
  'inter-source-serif': `${inter.variable} ${sourceSerif.variable}`,
  'inter-merriweather': `${inter.variable} ${merriweather.variable}`,
  'lato-playfair': `${lato.variable} ${playfairDisplay.variable}`,
  'roboto-lora': `${roboto.variable} ${lora.variable}`,
  'nunito-libre-baskerville': `${nunito.variable} ${libreBaskerville.variable}`,
  'plex-newsreader': `${ibmPlexSans.variable} ${newsreader.variable}`,
} as const

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || settings.branding.siteName || 'Lester J.'
  const description =
    'A building superintendent in Toronto writing about property management, AI experiments, running, food, and everyday life.'

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
  const { light, dark } = preset

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
      <style>{`
          :root {
            --background: ${light.background};
            --foreground: ${light.foreground};
            --card: ${light.card};
            --card-foreground: ${light.cardForeground};
            --primary: ${settings.appearance.customPrimaryOklch || light.primary};
            --primary-foreground: ${light.primaryForeground};
            --secondary: ${light.secondary};
            --secondary-foreground: ${light.secondaryForeground};
            --muted: ${light.muted};
            --muted-foreground: ${light.mutedForeground};
            --accent: ${light.accent};
            --accent-foreground: ${light.accentForeground};
            --border: ${light.border};
            --input: ${light.input};
            --ring: ${settings.appearance.customPrimaryOklch || light.ring};
            --sidebar: ${light.sidebar};
            --sidebar-foreground: ${light.sidebarForeground};
            --sidebar-primary: ${light.sidebarPrimary};
            --sidebar-primary-foreground: ${light.sidebarPrimaryForeground};
            --sidebar-accent: ${light.sidebarAccent};
            --sidebar-accent-foreground: ${light.sidebarAccentForeground};
            --sidebar-border: ${light.sidebarBorder};
            --sidebar-ring: ${light.sidebarRing};
          }
          .dark {
            --background: ${dark.background};
            --foreground: ${dark.foreground};
            --card: ${dark.card};
            --card-foreground: ${dark.cardForeground};
            --primary: ${settings.appearance.customPrimaryOklch || dark.primary};
            --primary-foreground: ${dark.primaryForeground};
            --secondary: ${dark.secondary};
            --secondary-foreground: ${dark.secondaryForeground};
            --muted: ${dark.muted};
            --muted-foreground: ${dark.mutedForeground};
            --accent: ${dark.accent};
            --accent-foreground: ${dark.accentForeground};
            --border: ${dark.border};
            --input: ${dark.input};
            --ring: ${settings.appearance.customPrimaryOklch || dark.ring};
            --sidebar: ${dark.sidebar};
            --sidebar-foreground: ${dark.sidebarForeground};
            --sidebar-primary: ${dark.sidebarPrimary};
            --sidebar-primary-foreground: ${dark.sidebarPrimaryForeground};
            --sidebar-accent: ${dark.sidebarAccent};
            --sidebar-accent-foreground: ${dark.sidebarAccentForeground};
            --sidebar-border: ${dark.sidebarBorder};
            --sidebar-ring: ${dark.sidebarRing};
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
