import type { Metadata } from 'next'
import Link from 'next/link'
import { BlogList } from '@/components/blog-list'
import { GoogleAd } from '@/components/google-ad'
import { getPostsFromDb } from '@/lib/db/posts'
import { getPublishedPosts } from '@/lib/posts'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Thoughts on work, life, hobbies, and experiences. Read all my blog posts here.',
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
}

export default async function BlogPage() {
  const allPosts = await getPostsFromDb()
  const posts = getPublishedPosts(allPosts)

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 md:py-16">
      <header className="mb-10">
        <h1 className="text-2xl font-medium text-foreground mb-2">
          Blog
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s my most recent posts or <Link href="/blog/random" className="underline decoration-2 underline-offset-2 hover:text-foreground transition-colors">read a random one</Link>!
        </p>
      </header>

      <BlogList
        initialPosts={posts}
        betweenPostsAd={<GoogleAd position="between-posts" />}
      />

      <div className="mt-12 pt-8 border-t border-border/60">
        <Link href="/blog/tags" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          View posts by tag →
        </Link>
      </div>
    </div>
  )
}
