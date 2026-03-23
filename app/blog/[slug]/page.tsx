import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlugFromDb, getPostsFromDb } from '@/lib/db/posts'
import { getRelatedPosts, getPublishedPosts, getAdjacentPosts } from '@/lib/posts'
import { PostCard } from '@/components/post-card'
import { AffiliateDisclosure } from '@/components/affiliate-disclosure'
import { GoogleAd } from '@/components/google-ad'
import { ReadingProgressBar } from '@/components/reading-progress-bar'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlugFromDb(slug)
  
  if (!post) {
    return { title: 'Post Not Found' }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const ogImage = post.featuredImage?.startsWith('/')
    ? `${baseUrl}${post.featuredImage}`
    : post.featuredImage

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags,
      ...(ogImage && { images: [ogImage] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      ...(ogImage && { images: [ogImage] }),
    },
  }
}

export async function generateStaticParams() {
  const posts = await getPostsFromDb()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlugFromDb(slug)

  if (!post) {
    notFound()
  }

  const allPosts = await getPostsFromDb()
  const relatedPosts = getRelatedPosts(getPublishedPosts(allPosts), post)
  const { newer, older } = getAdjacentPosts(allPosts, slug)

  // Convert markdown-style content to HTML paragraphs
  const contentParagraphs = post.content
    .split('\n\n')
    .filter(p => p.trim())

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    keywords: post.tags.join(', '),
  }

  return (
    <>
      <ReadingProgressBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-2xl mx-auto px-6 py-12 md:py-16">
        <AffiliateDisclosure />
        <GoogleAd position="top-of-content" />

        <header className="mb-10">
          {post.featuredImage && (
            <div className="relative w-full aspect-[21/9] mb-6 rounded-lg overflow-hidden bg-muted">
              <Image
                src={post.featuredImage}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
                priority
              />
            </div>
          )}
          <h1 className="text-2xl font-medium text-foreground leading-tight mb-4">
            {post.title}
          </h1>
          <div className="text-sm text-muted-foreground mb-4">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              {post.updatedAt && ' (updated)'}
            </time>
          </div>
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag.toLowerCase())}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {contentParagraphs.map((paragraph, index) => {
            const showMidAd = index === 3
            if (paragraph.startsWith('## ')) {
              return (
                <div key={index}>
                  {showMidAd && <GoogleAd position="mid-content" />}
                  <h2 id={paragraph.replace('## ', '').toLowerCase().replace(/\s+/g, '-')} className="text-lg font-medium text-foreground mt-8 mb-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                </div>
              )
            }
            return (
              <div key={index}>
                {showMidAd && <GoogleAd position="mid-content" />}
                <p className="text-foreground/90 leading-relaxed mb-4">
                  {paragraph}
                </p>
              </div>
            )
          })}
        </div>

        <GoogleAd position="end-of-article" />

        <hr className="my-10 border-border/60" />

        {/* Cassidoo-style post nav */}
        <nav className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground mb-10">
          {newer ? (
            <Link href={`/blog/${newer.slug}`} className="hover:text-foreground transition-colors">
              ← Newer post
            </Link>
          ) : (
            <span className="opacity-50">← Newer post</span>
          )}
          <span>•</span>
          <Link href="/blog/random" className="hover:text-foreground transition-colors">
            Random post
          </Link>
          <span>•</span>
          {older ? (
            <Link href={`/blog/${older.slug}`} className="hover:text-foreground transition-colors">
              Older post →
            </Link>
          ) : (
            <span className="opacity-50">Older post →</span>
          )}
        </nav>

        <div className="mt-10 pt-8 border-t border-border/60">
          <Link href="/blog/tags" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View posts by tag →
          </Link>
        </div>

        {relatedPosts.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border/60">
            <h2 className="text-lg font-medium text-foreground mb-6">
              Related posts
            </h2>
            <div className="space-y-8">
              {relatedPosts.map((relatedPost) => (
                <PostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-10">
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to all posts
          </Link>
        </div>
      </article>
    </>
  )
}
