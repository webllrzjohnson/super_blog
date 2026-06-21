import type { Metadata } from 'next'
import { getSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Manage your blog posts',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()

  return (
    <>
      {settings._settingsLoadFailed && (
        <div className="bg-destructive text-destructive-foreground px-4 py-2 text-sm text-center font-medium">
          Settings failed to load from the database. The site is showing default values. Check server logs and database connectivity.
        </div>
      )}
      {children}
    </>
  )
}