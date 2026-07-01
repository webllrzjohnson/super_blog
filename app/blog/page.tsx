import type { Metadata } from 'next'
import { getSettings } from '@/lib/settings'
import Link from 'next/link'
import { Suspense } from 'react'
import { BlogList } from '@/components/blog-list'
import { GoogleAd } from '@/components/google-ad'
import { Sidebar } from '@/components/sidebar'
import { getPostSummariesFromDb } from '@/lib/db-posts'
import { getPublishedPosts } from '@/lib/posts'

/** Must be a literal for Next.js segment config (see POSTS_CACHE_REVALIDATE_SECONDS). */
export const revalidate = 120

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Thoughts on work, life, hobbies, and experiences. Read all my blog posts here.',
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
}


export default async function BlogPage() {
  const allPosts = await getPostSummariesFromDb()
  const settings = await getSettings()
  const posts = getPublishedPosts(allPosts)
  const recentPosts = posts.slice(0, 5)
  const allTags = [...new Set(posts.flatMap((p) => p.tags))]

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
      <header className="mb-10">
        <h1 className="text-2xl font-medium text-foreground mb-2">Blog</h1>
        <p className="text-muted-foreground">
          Here&apos;s my most recent posts or{' '}
          <Link href="/blog/random" className="underline decoration-2 underline-offset-2 hover:text-foreground transition-colors">
            read a random one
          </Link>!
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
        <div>
          <Suspense fallback={<p className="text-muted-foreground py-12 text-sm">Loading posts…</p>}>
            <BlogList
              initialPosts={posts}
              betweenPostsAd={<GoogleAd position="between-posts" />}
            />
          </Suspense>

          <div className="mt-12 pt-8 border-t border-border/60">
            <Link href="/blog/tags" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              View posts by tag →
            </Link>
          </div>
        </div>

        <Sidebar
          recentPosts={recentPosts}
          tags={allTags}
          avatarUrl={settings.branding.avatarUrl}
          shortBio={settings.branding.shortBio}
          displayName={settings.branding.displayName}
        />

      </div>
    </div>
  )
}