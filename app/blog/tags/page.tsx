import type { Metadata } from 'next'
import Link from 'next/link'
import { getPostsFromDb } from '@/lib/db/posts'
import { getPublishedPosts, getAllTags, getPostsByTag } from '@/lib/posts'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  title: 'Posts by Tag',
  description: 'Browse blog posts by tag.',
  alternates: {
    canonical: `${BASE_URL}/blog/tags`,
  },
}

export default async function TagsPage() {
  const allPosts = await getPostsFromDb()
  const tags = getAllTags(allPosts)

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 md:py-16">
      <h1 className="text-2xl font-medium text-foreground mb-8">
        View posts by tag
      </h1>

      {tags.length === 0 ? (
        <p className="text-muted-foreground mb-8">No tags yet.</p>
      ) : (
      <div className="space-y-8">
        {tags.map((tag) => {
          const posts = getPostsByTag(getPublishedPosts(allPosts), tag)
          return (
            <div key={tag} className="space-y-2">
              <div>
                <Link
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="text-foreground font-medium hover:text-muted-foreground transition-colors"
                >
                  #{tag}
                </Link>
                <span className="text-muted-foreground text-sm ml-2">
                  ({posts.length} {posts.length === 1 ? 'post' : 'posts'})
                </span>
              </div>
              <div className="space-y-1">
                {posts.slice(0, 2).map((post) => (
                  <div key={post.id}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {post.title}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      )}

      <Link
        href="/blog"
        className="inline-block mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to all posts
      </Link>
    </div>
  )
}
