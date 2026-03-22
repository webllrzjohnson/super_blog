import type { Metadata } from 'next'
import Link from 'next/link'
import { samplePosts, getPublishedPosts } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'Sitemap',
  description: 'A complete list of all pages on this website.',
}

export default function SitemapPage() {
  const posts = getPublishedPosts(samplePosts)

  const pages = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Disclaimer', href: '/disclaimer' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
      <header className="mb-12">
        <h1 className="text-3xl font-semibold text-foreground mb-4">
          Sitemap
        </h1>
        <p className="text-muted-foreground">
          A complete list of all pages on this website.
        </p>
      </header>

      <div className="space-y-12">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Pages</h2>
          <ul className="space-y-2">
            {pages.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {page.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Blog Posts</h2>
          <ul className="space-y-2">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {post.title}
                </Link>
                <span className="text-sm text-muted-foreground ml-2">
                  ({new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })})
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
