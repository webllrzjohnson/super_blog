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
        <div className="space-y-2">
          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
            <span className="text-border">·</span>
            <span>{post.readTime} min read</span>
          </div>

          {/* Title */}
          <h2 className={`${featured ? 'text-2xl' : 'text-lg'} font-semibold text-foreground group-hover:text-muted-foreground transition-colors leading-snug`}>
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-muted-foreground leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-1">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </article>
  )
}
