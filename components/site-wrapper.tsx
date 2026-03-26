'use client'

import { usePathname } from 'next/navigation'
import { BookmarksProvider } from '@/components/bookmarks-provider'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import type { BrandingSettings, LinksSettings } from '@/lib/settings'

interface SiteWrapperProps {
  children: React.ReactNode
  branding?: BrandingSettings
  links?: LinksSettings
}

export function SiteWrapper({ children, branding, links }: SiteWrapperProps) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <BookmarksProvider>
      <div className="min-h-screen flex flex-col">
        <Header branding={branding} />
        <main className="flex-1">
          {children}
        </main>
        <Footer links={links} siteName={branding?.siteName} />
      </div>
    </BookmarksProvider>
  )
}
