// Server-side post operations using Supabase
// Falls back to sample posts when Supabase is not configured

import { createServerClient } from '@/lib/supabase/server'
import type { Post, Author } from '@/lib/types'
import { samplePosts } from '@/lib/posts'

function mapRowToPost(row: {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  featured_image: string | null
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
    author_name: post.author.name,
    author_avatar: post.author.avatar ?? null,
    author_bio: post.author.bio ?? null,
    published_at: post.publishedAt,
    updated_at: post.updatedAt ?? null,
    read_time: post.readTime,
    status: post.status,
  }
}

export async function getPostsFromDb(): Promise<Post[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return samplePosts
  }

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Supabase getPosts error:', error)
      return samplePosts
    }

    if (!data || data.length === 0) {
      return samplePosts
    }

    return data.map(mapRowToPost)
  } catch (err) {
    console.error('getPostsFromDb error:', err)
    return samplePosts
  }
}

export async function getPostBySlugFromDb(slug: string): Promise<Post | null> {
  const posts = await getPostsFromDb()
  return posts.find((p) => p.slug === slug) ?? null
}

export async function savePostToDb(post: Post): Promise<Post | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }

  try {
    const supabase = createServerClient()
    const row = mapPostToRow(post)
    const { data, error } = await supabase.from('posts').upsert(row, {
      onConflict: 'id',
    }).select().single()

    if (error) {
      console.error('Supabase savePost error:', error)
      return null
    }

    return data ? mapRowToPost(data) : null
  } catch (err) {
    console.error('savePostToDb error:', err)
    return null
  }
}

export async function deletePostFromDb(id: string): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return false
  }

  try {
    const supabase = createServerClient()
    const { error } = await supabase.from('posts').delete().eq('id', id)

    if (error) {
      console.error('Supabase deletePost error:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('deletePostFromDb error:', err)
    return false
  }
}

// Seed sample posts into database (run once when setting up Supabase)
export async function seedSamplePosts(): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return
  }

  const supabase = createServerClient()
  for (const post of samplePosts) {
    await supabase.from('posts').upsert(mapPostToRow(post), { onConflict: 'id' })
  }
}
