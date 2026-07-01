import { redirect } from 'next/navigation'
import { getPostSummariesFromDb } from '@/lib/db-posts'
import { getPublishedPosts } from '@/lib/posts'

export default async function RandomPostPage() {
  const allPosts = await getPostSummariesFromDb()
  const posts = getPublishedPosts(allPosts)

  if (posts.length === 0) {
    redirect('/blog')
  }

  const randomIndex = Math.floor(Math.random() * posts.length)
  const randomPost = posts[randomIndex]

  redirect(`/blog/${randomPost.slug}`)
}
