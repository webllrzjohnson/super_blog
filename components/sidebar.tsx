import Link from 'next/link'
import { NewsletterForm } from '@/components/newsletter-form'
import type { Post } from '@/lib/types'

interface SidebarProps {
  recentPosts?: Post[]
  tags?: string[]
}

export function Sidebar({ recentPosts = [], tags = [] }: SidebarProps) {
  return (
    <aside className="space-y-10">

      {/* About */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">About</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          I&apos;m Lester — building superintendent in Toronto, coding on the side. 
          I write about building management, running, food, and everyday life.
        </p>
        <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-2 inline-block">
          More about me →
        </Link>
      </div>

      {/* Newsletter */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-1">Newsletter</h3>
        <p className="text-sm text-muted-foreground mb-4">New posts in your inbox.</p>
        <NewsletterForm />
      </div>

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Recent Posts</h3>
          <ul className="space-y-3">
            {recentPosts.map((post) => (
              <li key={post.id}>
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
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag.toLowerCase())}`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

    </aside>
  )
}