import Link from 'next/link'
import { PostCard } from '@/components/post-card'
import { NewsletterForm } from '@/components/newsletter-form'
import { getPostsFromDb } from '@/lib/db/posts'
import { getPublishedPosts } from '@/lib/posts'

export default async function HomePage() {
  const allPosts = await getPostsFromDb()
  const posts = getPublishedPosts(allPosts)
  const recentPosts = posts.slice(0, 5)

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
      {/* Hero Section */}
      <section className="mb-16">
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground leading-tight mb-6 text-balance">
          Hi! I&apos;m Alex, and I write about work, life, and the things that make me curious.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          I&apos;m a software engineer who recently made the leap from big tech to startup life. 
          Outside of work, I bake bread, travel solo, and try to figure out this whole &quot;adulting&quot; thing. 
          This is where I share what I&apos;m learning along the way.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/blog" 
            className="inline-flex items-center text-foreground font-medium hover:text-muted-foreground transition-colors"
          >
            Read the blog
            <span className="ml-2">→</span>
          </Link>
          <Link 
            href="/about" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            About me
          </Link>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="mb-16 p-6 md:p-8 bg-secondary/50 rounded-lg">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Subscribe to my newsletter
        </h2>
        <p className="text-muted-foreground mb-4">
          Occasional thoughts on work, life, and making things. Delivered to your inbox.
        </p>
        <NewsletterForm />
      </section>

      {/* Recent Posts */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-foreground">
            Recent posts
          </h2>
          <Link 
            href="/blog" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="space-y-10">
          {recentPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}
