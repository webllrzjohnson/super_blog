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
    <div className="max-w-2xl mx-auto px-6 py-12 md:py-16">
      {/* Hero - cassidoo style */}
      <section className="mb-12">
        <h1 className="text-2xl font-medium text-foreground mb-4">
          Lester J.
        </h1>
        <p className="text-lg text-foreground leading-relaxed mb-6">
          Hi! I&apos;m Lester, and I like to make things and write about them.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          I&apos;m a software engineer based in Toronto who recently made the leap from big tech to startup life. 
          Outside of work, I bake bread, travel solo, and try to figure out this whole &quot;adulting&quot; thing. 
          This is where I share what I&apos;m learning along the way.
        </p>
        <p className="text-foreground mb-6">
          You should <Link href="/#newsletter" className="underline decoration-2 underline-offset-2 hover:text-muted-foreground transition-colors">subscribe to my newsletter</Link>!
        </p>
        <div id="newsletter" className="mb-16">
          <NewsletterForm />
        </div>
      </section>

      {/* Recent Posts - cassidoo style */}
      <section>
        <h2 className="text-lg font-medium text-foreground mb-8">
          Here&apos;s my most recent posts or <Link href="/blog/random" className="underline decoration-2 underline-offset-2 hover:text-muted-foreground transition-colors">read a random one</Link>!
        </h2>

        <div className="space-y-10">
          {recentPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        <div className="mt-10">
          <Link 
            href="/blog" 
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            View all posts →
          </Link>
        </div>
      </section>
    </div>
  )
}
