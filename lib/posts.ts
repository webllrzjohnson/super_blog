import { unstable_cache } from 'next/cache'
import sql from '@/lib/db'
import type { Post } from '@/lib/types'
import {
  CACHE_TAG_POSTS,
  POSTS_CACHE_REVALIDATE_SECONDS,
} from '@/lib/cache-tags'

function mapRowToPost(row: {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  featured_image: string | null
  featured_image_alt?: string | null
  author_name: string
  author_avatar: string | null
  author_bio: string | null
  published_at: string
  updated_at: string | null
  read_time: number
  status: string
}): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category as Post['category'],
    tags: row.tags || [],
    featuredImage: row.featured_image ?? undefined,
    featuredImageAlt: row.featured_image_alt?.trim()
      ? row.featured_image_alt.trim()
      : undefined,
    author: {
      name: row.author_name,
      avatar: row.author_avatar ?? undefined,
      bio: row.author_bio ?? undefined,
    },
    publishedAt: row.published_at,
    updatedAt: row.updated_at ?? undefined,
    readTime: row.read_time,
    status: row.status as Post['status'],
  }
}

function mapPostToRow(post: Post) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    tags: post.tags,
    featured_image: post.featuredImage ?? null,
    featured_image_alt: post.featuredImageAlt?.trim() || null,
    author_name: post.author.name,
    author_avatar: post.author.avatar ?? null,
    author_bio: post.author.bio ?? null,
    published_at: post.publishedAt,
    updated_at: post.updatedAt ?? null,
    read_time: post.readTime,
    status: post.status,
  }
}

async function fetchPosts(): Promise<Post[]> {
  try {
    const rows = await sql`
      SELECT * FROM posts 
      ORDER BY published_at DESC
    `
    if (!rows || rows.length === 0) return []
    return rows.map(mapRowToPost)
  } catch (err) {
    console.error('fetchPosts error:', err)
    return []
  }
}

const getPostsCached = unstable_cache(fetchPosts, ['posts-all'], {
  tags: [CACHE_TAG_POSTS],
  revalidate: POSTS_CACHE_REVALIDATE_SECONDS,
})

export async function getPostsFromDb(): Promise<Post[]> {
  return getPostsCached()
}

export async function getPostBySlugFromDb(slug: string): Promise<Post | null> {
  const posts = await getPostsFromDb()
  return posts.find((p) => p.slug === slug) ?? null
}

export async function savePostToDb(post: Post): Promise<Post | null> {
  try {
    const row = mapPostToRow(post)
    const result = await sql`
      INSERT INTO posts ${sql(row)}
      ON CONFLICT (id) DO UPDATE SET ${sql(row)}
      RETURNING *
    `
    return result[0] ? mapRowToPost(result[0]) : null
  } catch (err) {
    console.error('savePostToDb error:', err)
    return null
  }
}

export async function deletePostFromDb(id: string): Promise<boolean> {
  try {
    await sql`DELETE FROM posts WHERE id = ${id}`
    return true
  } catch (err) {
    console.error('deletePostFromDb error:', err)
    return false
  }
}

// Helper exports used throughout the app
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