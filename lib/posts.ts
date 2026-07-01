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

export function isPostPubliclyVisible(post: Post, now: Date = new Date()): boolean {
  if (post.status === 'published') return true
  if (post.status === 'draft') return false
  if (post.status === 'scheduled') {
    const publishDate = new Date(post.publishedAt)
    return !Number.isNaN(publishDate.getTime()) && publishDate.getTime() <= now.getTime()
  }
  return false
}

export function getPublishedPosts(posts: Post[], now: Date = new Date()): Post[] {
  return posts
    .filter((p) => isPostPubliclyVisible(p, now))
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
}

export function scoreRelatedPost(current: Post, candidate: Post): number {
  if (candidate.slug === current.slug) return 0

  let score = 0
  if (candidate.category === current.category) score += 2

  const currentTags = current.tags ?? []
  const candidateTags = candidate.tags ?? []
  score += candidateTags.filter((tag) => currentTags.includes(tag)).length * 3

  const currentTokens = new Set(
    current.title.toLowerCase().split(/\s+/).filter(Boolean)
  )
  for (const token of candidate.title.toLowerCase().split(/\s+/).filter(Boolean)) {
    if (currentTokens.has(token)) score += 1
  }

  return score
}

export function getRelatedPosts(post: Post, posts: Post[], limit = 3, now: Date = new Date()): Post[] {
  return posts
    .filter((p) => p.slug !== post.slug && isPostPubliclyVisible(p, now))
    .map((p) => ({ post: p, score: scoreRelatedPost(post, p) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post: p }) => p)
}

export function getAdjacentPosts(post: Post, posts: Post[], now: Date = new Date()): { prev: Post | null; next: Post | null } {
  const published = getPublishedPosts(posts, now)
    .slice()
    .sort(
      (a, b) =>
        new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    )
  const index = published.findIndex((p) => p.slug === post.slug)
  return {
    prev: index > 0 ? published[index - 1] : null,
    next: index >= 0 && index < published.length - 1 ? published[index + 1] : null,
  }
}

export function getAllTags(posts: Post[], now: Date = new Date()): string[] {
  const tags = posts
    .filter((p) => isPostPubliclyVisible(p, now))
    .flatMap((p) => p.tags ?? [])
    .map((tag) => tag.toLowerCase())
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
      p.content.toLowerCase().includes(q) ||
      (p.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
  )
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