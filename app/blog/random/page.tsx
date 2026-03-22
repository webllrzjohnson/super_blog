import { redirect } from 'next/navigation'
import { getPostsFromDb } from '@/lib/db/posts'
import { getPublishedPosts } from '@/lib/posts'

export default async function RandomPostPage() {
  const allPosts = await getPostsFromDb()
  const posts = getPublishedPosts(allPosts)

  if (posts.length === 0) {
    redirect('/blog')
  }

  const randomIndex = Math.floor(Math.random() * posts.length)
  const randomPost = posts[randomIndex]

  redirect(`/blog/${randomPost.slug}`)
}
