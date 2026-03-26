import Link from 'next/link'
import type { Post } from '@/lib/types'

interface PostCardProps {
  post: Post
  featured?: boolean
}

export function PostCard({ post, featured = false }: PostCardProps) {
  return (
    <article className={`group ${featured ? 'mb-8' : ''}`}>
      <Link href={`/blog/${post.slug}`} className="block">
        <h2 className={`${featured ? 'text-xl' : 'text-base'} font-medium text-foreground group-hover:text-muted-foreground transition-colors leading-snug mb-1`}>
          {post.title}
        </h2>
        <div className="text-sm text-muted-foreground mb-2">
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            {post.updatedAt && ' (updated)'}
          </time>
          <span className="mx-2 opacity-60" aria-hidden>
            ·
          </span>
          <span>{post.readTime} min read</span>
        </div>
        <p className="text-muted-foreground leading-relaxed text-sm mb-2">
          {post.excerpt}
        </p>
      </Link>
      {/* Tags as links - cassidoo style */}
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
    </article>
  )
}
