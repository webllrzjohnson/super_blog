import Link from 'next/link'
import Image from 'next/image'
import type { PostListItem } from '@/lib/types'
import { getSafeImageAltText } from '@/lib/image-alt'

interface PostCardProps {
  post: PostListItem
  featured?: boolean
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const visibleTags = post.tags.slice(0, 2)

  return (
    <article className={`group surface-card overflow-hidden transition-transform duration-300 hover:-translate-y-1 ${featured ? 'mb-8' : ''}`}>
      <Link href={`/blog/${post.slug}`} className="grid h-full gap-0 sm:grid-cols-[112px_1fr]">
        {post.featuredImage ? (
          <div className="relative min-h-36 overflow-hidden bg-muted sm:min-h-full">
            <Image
              src={post.featuredImage}
              alt={getSafeImageAltText(post.featuredImageAlt, post.title)}
              width={224}
              height={224}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="hidden bg-gradient-to-br from-primary/15 via-secondary/60 to-background sm:block" />
        )}

        <div className="flex min-w-0 flex-col p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              {post.updatedAt && ' (updated)'}
            </time>
            <span className="opacity-60" aria-hidden>·</span>
            <span>{post.readTime} min read</span>
          </div>

          <h2 className={`${featured ? 'text-2xl' : 'text-lg'} mb-2 font-semibold leading-snug tracking-[-0.02em] text-foreground transition-colors group-hover:text-primary`}>
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="mb-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {post.excerpt}
            </p>
          )}

          <div className="mt-auto flex flex-wrap gap-1.5">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary/70 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 2 && (
              <span className="rounded-full bg-secondary/50 px-2.5 py-1 text-xs text-muted-foreground/70">
                +{post.tags.length - 2} more
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}