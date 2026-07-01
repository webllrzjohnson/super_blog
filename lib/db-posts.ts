import { unstable_cache } from 'next/cache'
import sql from '@/lib/db'
import type { Post, PostListItem } from '@/lib/types'
import {
  CACHE_TAG_POSTS,
  POSTS_CACHE_REVALIDATE_SECONDS,
} from '@/lib/cache-tags'

const POST_SUMMARY_SELECT = `
  id, title, slug, excerpt, category, tags,
  featured_image, featured_image_alt,
  author_name, author_avatar, author_bio,
  published_at, updated_at, read_time, status
`

function mapRowToPost(row: Record<string, unknown>): Post {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    excerpt: row.excerpt as string,
    content: row.content as string,
    category: row.category as Post['category'],
    tags: (row.tags as string[]) || [],
    featuredImage: (row.featured_image as string | null) ?? undefined,
    featuredImageAlt: (row.featured_image_alt as string | null)?.trim()
      ? (row.featured_image_alt as string).trim()
      : undefined,
    author: {
      name: row.author_name as string,
      avatar: (row.author_avatar as string | null) ?? undefined,
      bio: (row.author_bio as string | null) ?? undefined,
    },
    publishedAt: row.published_at as string,
    updatedAt: (row.updated_at as string | null) ?? undefined,
    readTime: row.read_time as number,
    status: row.status as Post['status'],
  }
}

function mapRowToPostSummary(row: Record<string, unknown>): PostListItem {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    excerpt: row.excerpt as string,
    category: row.category as Post['category'],
    tags: (row.tags as string[]) || [],
    featuredImage: (row.featured_image as string | null) ?? undefined,
    featuredImageAlt: (row.featured_image_alt as string | null)?.trim()
      ? (row.featured_image_alt as string).trim()
      : undefined,
    author: {
      name: row.author_name as string,
      avatar: (row.author_avatar as string | null) ?? undefined,
      bio: (row.author_bio as string | null) ?? undefined,
    },
    publishedAt: row.published_at as string,
    updatedAt: (row.updated_at as string | null) ?? undefined,
    readTime: row.read_time as number,
    status: row.status as Post['status'],
  }
}

async function fetchPosts(): Promise<Post[]> {
  try {
    const rows = await sql`SELECT * FROM posts ORDER BY published_at DESC`
    if (!rows || rows.length === 0) return []
    return rows.map((row) => mapRowToPost(row as Record<string, unknown>))
  } catch (err) {
    console.error('fetchPosts error:', err)
    return []
  }
}

async function fetchPostSummaries(): Promise<PostListItem[]> {
  try {
    const rows = await sql.unsafe(`
      SELECT ${POST_SUMMARY_SELECT}
      FROM posts
      ORDER BY published_at DESC
    `)
    if (!rows || rows.length === 0) return []
    return rows.map((row) => mapRowToPostSummary(row as Record<string, unknown>))
  } catch (err) {
    console.error('fetchPostSummaries error:', err)
    return []
  }
}

async function fetchPostBySlug(slug: string): Promise<Post | null> {
  try {
    const rows = await sql`SELECT * FROM posts WHERE slug = ${slug} LIMIT 1`
    return rows[0] ? mapRowToPost(rows[0] as Record<string, unknown>) : null
  } catch (err) {
    console.error('fetchPostBySlug error:', err)
    return null
  }
}

const getPostsCached = unstable_cache(fetchPosts, ['posts-all'], {
  tags: [CACHE_TAG_POSTS],
  revalidate: POSTS_CACHE_REVALIDATE_SECONDS,
})

const getPostSummariesCached = unstable_cache(fetchPostSummaries, ['posts-summaries'], {
  tags: [CACHE_TAG_POSTS],
  revalidate: POSTS_CACHE_REVALIDATE_SECONDS,
})

export async function getPostsFromDb(): Promise<Post[]> {
  return getPostsCached()
}

export async function getPostSummariesFromDb(): Promise<PostListItem[]> {
  return getPostSummariesCached()
}

export async function getPostBySlugFromDb(slug: string): Promise<Post | null> {
  const normalized = slug.trim().toLowerCase()
  return unstable_cache(
    () => fetchPostBySlug(normalized),
    [`post-slug-${normalized}`],
    {
      tags: [CACHE_TAG_POSTS],
      revalidate: POSTS_CACHE_REVALIDATE_SECONDS,
    }
  )()
}

export async function savePostToDb(post: Post): Promise<Post | null> {
  try {
    const row = {
      id: post.id, title: post.title, slug: post.slug, excerpt: post.excerpt,
      content: post.content, category: post.category, tags: post.tags,
      featured_image: post.featuredImage ?? null, featured_image_alt: post.featuredImageAlt?.trim() || null,
      author_name: post.author.name, author_avatar: post.author.avatar ?? null,
      author_bio: post.author.bio ?? null, published_at: post.publishedAt,
      updated_at: post.updatedAt ?? null, read_time: post.readTime, status: post.status,
    }
    const result = await sql`INSERT INTO posts ${sql(row)} ON CONFLICT (id) DO UPDATE SET ${sql(row)} RETURNING *`
    return result[0] ? mapRowToPost(result[0] as Record<string, unknown>) : null
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
