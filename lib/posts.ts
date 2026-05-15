import type { Post } from '@/lib/types'

export const samplePosts: Post[] = []

export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export const defaultAuthor = {
  name: 'Admin',
  avatar: undefined as string | undefined,
  bio: undefined as string | undefined,
}

export function getPublishedPosts(posts: Post[]): Post[] {
  return posts.filter((p) => p.status === 'published')
}

export function getRelatedPosts(post: Post, posts: Post[], limit = 3): Post[] {
  return posts
    .filter((p) => p.slug !== post.slug && p.status === 'published')
    .filter((p) => p.category === post.category || p.tags?.some((t) => post.tags?.includes(t)))
    .slice(0, limit)
}

export function getAdjacentPosts(post: Post, posts: Post[]): { prev: Post | null; next: Post | null } {
  const published = getPublishedPosts(posts)
  const index = published.findIndex((p) => p.slug === post.slug)
  return {
    prev: index > 0 ? published[index - 1] : null,
    next: index < published.length - 1 ? published[index + 1] : null,
  }
}

export function getAllTags(posts: Post[]): string[] {
  const tags = posts.flatMap((p) => p.tags || [])
  return [...new Set(tags)]
}

export function getPostsByTag(posts: Post[], tag: string): Post[] {
  return posts.filter((p) => p.tags?.includes(tag) && p.status === 'published')
}

export function searchPosts(posts: Post[], query: string): Post[] {
  const q = query.toLowerCase()
  return posts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q)
  )
}

export function isPostPubliclyVisible(post: Post): boolean {
  return post.status === 'published'
}

export function getPostsFromDb(): Promise<Post[]> {
  return import('@/lib/db-posts').then((m) => m.getPostsFromDb())
}

export function getPostBySlugFromDb(slug: string): Promise<Post | null> {
  return import('@/lib/db-posts').then((m) => m.getPostBySlugFromDb(slug))
}

export function savePostToDb(post: Post): Promise<Post | null> {
  return import('@/lib/db-posts').then((m) => m.savePostToDb(post))
}

export function deletePostFromDb(id: string): Promise<boolean> {
  return import('@/lib/db-posts').then((m) => m.deletePostFromDb(id))
}