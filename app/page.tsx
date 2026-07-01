import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { PostCard } from '@/components/post-card'
import { NewsletterForm } from '@/components/newsletter-form'
import { getPostSummariesFromDb } from '@/lib/db-posts'
import { getPublishedPosts } from '@/lib/posts'
import { getSettings } from '@/lib/settings'

/** Must be a literal for Next.js segment config (see POSTS_CACHE_REVALIDATE_SECONDS). */
export const revalidate = 120

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  alternates: {
    canonical: BASE_URL,
  },
}

export default async function HomePage() {
  const [allPosts, settings] = await Promise.all([
    getPostSummariesFromDb(),
    getSettings(),
  ])
  const posts = getPublishedPosts(allPosts)
  const [featured, ...recentPosts] = posts.slice(0, 5)
  const avatarUrl = settings.branding.avatarUrl

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">

      {/* Hero */}
      <section className="max-w-2xl mb-16 flex flex-col sm:flex-row gap-6 items-start">
        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Lester J."
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-medium text-primary">LJ</span>
            </div>
          )}
        </div>
        <div>
        <p className="text-sm text-muted-foreground mb-1">
            {settings.branding.roleLocation || 'Building superintendent · Toronto, ON'}
          </p>
          <h1 className="text-2xl font-medium text-foreground mb-3">
            {settings.branding.displayName || 'Lester J.'}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {settings.branding.shortBio || 'Software engineer turned building superintendent, still coding on the side. I write about building management, AI experiments, running, food, and life in Toronto.'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {posts.length}+ posts published
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/blog" className="text-sm text-foreground hover:text-muted-foreground transition-colors">
              Read the blog →
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About me
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featured && (
        <section className="mb-16">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Featured post</p>
          <Link href={`/blog/${featured.slug}`} className="group block">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start p-6 rounded-xl border border-border/60 hover:border-border transition-colors bg-secondary/20 hover:bg-secondary/40">
              <div>
                <h2 className="text-xl font-medium text-foreground group-hover:text-muted-foreground transition-colors leading-snug mb-2">
                  {featured.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm mb-3 line-clamp-2">
                  {featured.excerpt}
                </p>
                <div className="text-xs text-muted-foreground">
                  {new Date(featured.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  <span className="mx-2 opacity-60">·</span>
                  {featured.readTime} min read
                </div>
              </div>
              {featured.featuredImage && (
                <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={featured.featuredImage}
                    alt={featured.featuredImageAlt || featured.title}
                    width={128}
                    height={128}
                    priority
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
            </div>
          </Link>
        </section>
      )}

      {/* Recent Posts */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-medium text-foreground">
            Recent posts
          </h2>
          <Link
            href="/blog/random"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Read a random one →
          </Link>
        </div>

        <div className="space-y-8">
          {recentPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all posts →
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section id="newsletter" className="max-w-lg">
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