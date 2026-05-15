import { unstable_cache } from 'next/cache'
import sql from '@/lib/db'
import type { Post } from '@/lib/types'
import { samplePosts } from '@/lib/posts'
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
    if (!rows || rows.length === 0) return samplePosts
    return rows.map(mapRowToPost)
  } catch (err) {
    console.error('fetchPosts error:', err)
    return samplePosts
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