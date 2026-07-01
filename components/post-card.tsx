import Link from 'next/link'
import Image from 'next/image'
import type { PostListItem } from '@/lib/types'

interface PostCardProps {
  post: PostListItem
  featured?: boolean
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const visibleTags = post.tags.slice(0, 2)

  return (
    <article className={`group flex gap-4 items-start ${featured ? 'mb-8' : ''}`}>
      {/* Thumbnail */}
      {post.featuredImage && (
        <Link href={`/blog/${post.slug}`} className="flex-shrink-0 block">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted border border-border/40">
            <Image
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              width={80}
              height={80}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
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
            <span className="mx-2 opacity-60" aria-hidden>·</span>
            <span>{post.readTime} min read</span>
          </div>
          {post.excerpt && (
            <p className="text-muted-foreground leading-relaxed text-sm mb-2 line-clamp-2">
              {post.excerpt}
            </p>
          )}
        </Link>
        <div className="flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${encodeURIComponent(tag.toLowerCase())}`}
              className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              #{tag}
            </Link>
          ))}
          {post.tags.length > 2 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground opacity-60">
              +{post.tags.length - 2} more
            </span>
          )}
        </div>
      </div>
    </article>
  )
}