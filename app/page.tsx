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
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <section className="mb-16 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs text-muted-foreground shadow-sm">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
            {settings.branding.roleLocation || 'Building superintendent · Toronto, ON'}
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl md:text-6xl md:leading-[0.98]">
            Field notes from building work, code, and life in Toronto.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
            {settings.branding.shortBio || 'Software engineer turned building superintendent, still coding on the side. I write about building management, AI experiments, running, food, and life in Toronto.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
            >
              Read the blog
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-border/70 bg-card/70 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/70"
            >
              About me
            </Link>
          </div>
        </div>

        <div className="surface-card p-5 md:p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-primary/10 ring-1 ring-border/60">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Lester J."
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-primary">
                  LJ
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {settings.branding.displayName || 'Lester J.'}
              </p>
              <p className="text-sm text-muted-foreground">{posts.length}+ posts published</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[
              ['Work', 'field notes'],
              ['Tech', 'AI + code'],
              ['Life', 'Toronto'],
            ].map(([label, detail]) => (
              <div key={label} className="rounded-xl bg-secondary/45 px-3 py-4">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featured && (
        <section className="mb-16">
          <p className="eyebrow mb-4">Featured post</p>
          <Link href={`/blog/${featured.slug}`} className="group block">
            <article className="surface-card grid gap-6 overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-1 md:grid-cols-[1fr_260px] md:p-7">
              <div className="flex flex-col justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-semibold leading-tight tracking-[-0.02em] text-foreground transition-colors group-hover:text-primary md:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground md:text-base">
                    {featured.excerpt}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
                  <time dateTime={featured.publishedAt}>
                    {new Date(featured.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                  <span aria-hidden>·</span>
                  <span>{featured.readTime} min read</span>
                  <span aria-hidden>·</span>
                  <span>Read now →</span>
                </div>
              </div>
              {featured.featuredImage && (
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted md:aspect-auto">
                  <Image
                    src={featured.featuredImage}
                    alt={featured.featuredImageAlt || featured.title}
                    width={520}
                    height={390}
                    priority
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
            </article>
          </Link>
        </section>
      )}

      <section className="mb-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Latest notes</p>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">Recent posts</h2>
          </div>
          <Link
            href="/blog/random"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Read a random one →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {recentPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/blog"
            className="rounded-full border border-border/70 bg-card/70 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/70"
          >
            View all posts →
          </Link>
        </div>
      </section>

      <section id="newsletter" className="surface-card max-w-2xl p-6 md:p-8">
        <p className="eyebrow mb-2">Newsletter</p>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
          Stay in the loop
        </h2>
        <p className="mb-6 mt-2 text-sm leading-6 text-muted-foreground">
          New posts in your inbox. No spam, unsubscribe anytime.
        </p>
        <NewsletterForm />
      </section>
    </div>
  )
}