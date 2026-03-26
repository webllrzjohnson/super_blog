import type { Metadata } from 'next'
import { BookmarksPageClient } from '@/components/bookmarks-page-client'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  title: 'Bookmarks',
  description: 'Posts you saved to read later. Optional server merge when Supabase is configured.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${BASE_URL}/bookmarks`,
  },
}

export default function BookmarksPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 md:py-16">
      <header className="mb-10">
        <h1 className="text-2xl font-medium text-foreground mb-2">Bookmarks</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Bookmarks are saved in your browser. When Supabase is configured, the list is also
          stored on the server and merged for your anonymous visitor id (the same id used for
          post reactions), so you keep one list across sessions on this profile. Other devices
          or browsers normally have a different id unless your browser syncs localStorage.
        </p>
      </header>
      <BookmarksPageClient />
    </div>
  )
}
