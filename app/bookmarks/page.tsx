import type { Metadata } from 'next'
import { BookmarksPageClient } from '@/components/bookmarks-page-client'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  title: 'Bookmarks',
  description: 'Posts you saved to read later. Stored on this device only.',
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
          Posts you bookmark are saved in your browser on this device only. They don’t sync to
          an account.
        </p>
      </header>
      <BookmarksPageClient />
    </div>
  )
}
