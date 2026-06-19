import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import sql from '@/lib/db'

export const dynamic = 'force-dynamic'

interface SearchResult {
  id: string
  title: string
  slug: string
  excerpt: string
  published_at: string
  read_time: number
  featured_image?: string
  featured_image_alt?: string
  tags: string[]
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Search: ${q}` : 'Search',
  }
}

async function searchPosts(q: string): Promise<SearchResult[]> {
  if (!q || q.trim().length < 2) return []
  try {
    const rows = await sql<SearchResult[]>`
      SELECT
        id, title, slug, excerpt, published_at, read_time,
        featured_image, featured_image_alt, tags,
        ts_rank(
          to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, '')),
          plainto_tsquery('english', ${q.trim()})
        ) AS rank
      FROM posts
      WHERE
        status = 'published'
        AND to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, ''))
            @@ plainto_tsquery('english', ${q.trim()})
      ORDER BY rank DESC
      LIMIT 20
    `
    return rows
  } catch {
    return []
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  const results = await searchPosts(query)

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-medium text-foreground mb-8">Search</h1>

      {/* Search form */}
      <form action="/search" method="GET" className="mb-10">
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search posts..."
            autoFocus
            className="flex-1 h-10 px-4 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
          <button
            type="submit"
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {query.length >= 2 && (
        <div>
          {results.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No posts found for <strong className="text-foreground">"{query}"</strong>.
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-6">
                {results.length} result{results.length === 1 ? '' : 's'} for{' '}
                <strong className="text-foreground">"{query}"</strong>
              </p>
              <div className="space-y-8">
                {results.map((post) => (
                  <article key={post.id} className="flex gap-4 items-start group">
                    {post.featured_image && (
                      <Link href={`/blog/${post.slug}`} className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted border border-border/40">
                          <Image
                            src={post.featured_image}
                            alt={post.featured_image_alt || post.title}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="text-base font-medium text-foreground group-hover:text-muted-foreground transition-colors leading-snug mb-1">
                          {post.title}
                        </h2>
                        <div className="text-sm text-muted-foreground mb-2">
                          <time dateTime={post.published_at}>
                            {new Date(post.published_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })}
                          </time>
                          <span className="mx-2 opacity-60">·</span>
                          <span>{post.read_time} min read</span>
                        </div>
                        {post.excerpt && (
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                      </Link>
                      {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Link
                              key={tag}
                              href={`/blog?tag=${encodeURIComponent(tag.toLowerCase())}`}
                              className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              #{tag}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {query.length > 0 && query.length < 2 && (
        <p className="text-muted-foreground text-sm">Type at least 2 characters to search.</p>
      )}
    </div>
  )
}