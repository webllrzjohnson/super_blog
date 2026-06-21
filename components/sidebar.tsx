import Link from 'next/link'
import Image from 'next/image'
import { NewsletterForm } from '@/components/newsletter-form'
import type { Post } from '@/lib/types'



interface SidebarProps {
  recentPosts?: Post[]
  tags?: string[]
  avatarUrl?: string
  shortBio?: string
  displayName?: string
}

export function Sidebar({ recentPosts = [], tags = [], avatarUrl, shortBio, displayName }: SidebarProps) {

  const visibleTags = tags.slice(0, 20)

  return (
    <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">

      {/* About */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">About</h3>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Lester J."
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-xs font-medium text-primary">LJ</span>
            )}
          </div>
          <span className="text-sm font-medium text-foreground">{displayName || 'Lester J.'}</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {shortBio || 'Building superintendent in Toronto, coding on the side. I write about building management, running, food, and everyday life.'}
        </p>
        <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-2 inline-block">
          More about me →
        </Link>
      </div>

      <div className="border-t border-border/50" />

      {/* Newsletter */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-1">Newsletter</h3>
        <p className="text-sm text-muted-foreground mb-4">New posts in your inbox.</p>
        <NewsletterForm />
      </div>

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <>
          <div className="border-t border-border/50" />
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Recent Posts</h3>
            <ul className="space-y-3">
              {recentPosts.map((post) => (
                <li key={post.id} className="flex gap-2 items-start">
                  <span className="text-muted-foreground/40 mt-0.5 text-xs">→</span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors leading-snug"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Tags */}
      {visibleTags.length > 0 && (
        <>
          <div className="border-t border-border/50" />
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {visibleTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag.toLowerCase())}`}
                  className="text-xs px-2.5 py-0.5 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
            {tags.length > 20 && (
              <Link href="/blog/tags" className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-3 inline-block">
                View all {tags.length} tags →
              </Link>
            )}
          </div>
        </>
      )}

    </aside>
  )
}