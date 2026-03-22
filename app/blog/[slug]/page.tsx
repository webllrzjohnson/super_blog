import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlugFromDb, getPostsFromDb } from '@/lib/db/posts'
import { getRelatedPosts, getPublishedPosts } from '@/lib/posts'
import { ShareButtons } from '@/components/share-buttons'
import { PostCard } from '@/components/post-card'
import { TableOfContents } from '@/components/table-of-contents'
import { AffiliateDisclosure } from '@/components/affiliate-disclosure'
import { AdSlot } from '@/components/ad-slot'
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
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
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

      <article className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Affiliate Disclosure */}
        <AffiliateDisclosure />

        {/* Top Ad Slot */}
        <AdSlot position="top" />

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
            {post.updatedAt && (
              <>
                <span>·</span>
                <span>Updated {new Date(post.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}</span>
              </>
            )}
            <span>·</span>
            <span>{post.readTime} min read</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold text-foreground leading-tight mb-6 text-balance">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        </header>

        <div className="lg:flex lg:gap-12">
          {/* Main Content */}
          <div className="flex-1">
            {/* Content */}
            <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
              {contentParagraphs.map((paragraph, index) => {
                // Insert mid-content ad after 3rd paragraph
                const showMidAd = index === 3

                if (paragraph.startsWith('## ')) {
                  return (
                    <div key={index}>
                      {showMidAd && <AdSlot position="mid" />}
                      <h2 id={paragraph.replace('## ', '').toLowerCase().replace(/\s+/g, '-')} className="text-xl font-semibold text-foreground mt-8 mb-4">
                        {paragraph.replace('## ', '')}
                      </h2>
                    </div>
                  )
                }

                return (
                  <div key={index}>
                    {showMidAd && <AdSlot position="mid" />}
                    <p className="text-foreground/90 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Share Buttons */}
            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm font-medium text-foreground mb-4">Share this post</p>
              <ShareButtons title={post.title} slug={post.slug} />
            </div>
          </div>

          {/* Sidebar - Table of Contents (desktop only) */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <TableOfContents content={post.content} />
              <AdSlot position="sidebar" />
            </div>
          </aside>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-border">
            <h2 className="text-xl font-semibold text-foreground mb-8">
              Related posts
            </h2>
            <div className="space-y-8">
              {relatedPosts.map((relatedPost) => (
                <PostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </section>
        )}

        {/* Back to blog */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to all posts
          </Link>
        </div>
      </article>
    </>
  )
}
