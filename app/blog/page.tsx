import type { Metadata } from 'next'
import { BlogList } from '@/components/blog-list'
import { getPostsFromDb } from '@/lib/db/posts'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Thoughts on work, life, hobbies, and experiences. Read all my blog posts here.',
}

export default async function BlogPage() {
  const posts = await getPostsFromDb()

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
      <header className="mb-12">
        <h1 className="text-3xl font-semibold text-foreground mb-4">
          Blog
        </h1>
        <p className="text-muted-foreground">
          Thoughts on work, life, and the things that make me curious.
        </p>
      </header>

      <BlogList initialPosts={posts} />
    </div>
  )
}
