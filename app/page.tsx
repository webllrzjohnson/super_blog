import type { Metadata } from 'next'
import Link from 'next/link'
import { PostCard } from '@/components/post-card'
import { NewsletterForm } from '@/components/newsletter-form'
import { getPostsFromDb } from '@/lib/db-posts'
import { getPublishedPosts } from '@/lib/posts'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  alternates: {
    canonical: BASE_URL,
  },
}

export default async function HomePage() {
  const allPosts = await getPostsFromDb()
  const posts = getPublishedPosts(allPosts)
  const recentPosts = posts.slice(0, 5)

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">

      {/* Hero */}
      <section className="max-w-2xl mb-16">
        <p className="text-sm text-muted-foreground mb-3">
          Building superintendent · Toronto, ON
        </p>
        <h1 className="text-2xl font-medium text-foreground mb-4">
          Lester J.
        </h1>
        <p className="text-lg text-foreground leading-relaxed mb-4">
          Hi! I&apos;m Lester, and I like to make things and write about them.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Software engineer turned building superintendent, still coding on the side. Based in Toronto with my wife.
          I bake bread, cook, eat out too much, and travel whenever we can. This is where I write about all of it.
        </p>
      </section>

      {/* Recent Posts */}
      <section className="mb-16">
        <h2 className="text-lg font-medium text-foreground mb-8">
          Most recent posts or{' '}
          <Link
            href="/blog/random"
            className="underline decoration-2 underline-offset-2 hover:text-muted-foreground transition-colors"
          >
            read a random one
          </Link>
        </h2>

        <div className="space-y-10">
          {recentPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            View all posts →
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section id="newsletter" className="max-w-2xl">
        <h2 className="text-lg font-medium text-foreground mb-2">
          Stay in the loop
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          New posts in your inbox. No spam, unsubscribe anytime.
        </p>
        <NewsletterForm />
      </section>

    </div>
  )
}