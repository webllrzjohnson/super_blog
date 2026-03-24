import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPostsFromDb } from '@/lib/db/posts'
import { savePostToDb } from '@/lib/db/posts'
import { getPublishedPosts } from '@/lib/posts'
import type { Post } from '@/lib/types'
import { calculateReadTime } from '@/lib/posts'
import { z } from 'zod'
import { isAdminSession } from '@/lib/auth-session'
import { getClientIdentifier, rateLimit } from '@/lib/rate-limit'

async function checkAdmin(): Promise<boolean> {
  const headersList = await headers()
  return isAdminSession(headersList.get('cookie'))
}

const postSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string(),
  content: z.string(),
  category: z.enum(['Life', 'Work', 'Hobbies', 'Experience']),
  tags: z.array(z.string()),
  featuredImage: z.string().optional(),
  author: z.object({
    name: z.string(),
    avatar: z.string().optional(),
    bio: z.string().optional(),
  }),
  publishedAt: z.string(),
  updatedAt: z.string().optional(),
  readTime: z.number(),
  status: z.enum(['draft', 'published']),
})

export async function GET() {
  const isAdmin = await checkAdmin()
  const posts = await getPostsFromDb()
  // Public gets only published posts; admin gets all
  const data = isAdmin ? posts : getPublishedPosts(posts)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const clientId = getClientIdentifier(request)
  const limit = rateLimit({
    key: `posts:write:${clientId}`,
    windowMs: 10 * 60 * 1000,
    maxRequests: 30,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many post updates. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds) },
      }
    )
  }

  const isAdmin = await checkAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = postSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid post data', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const normalizedSlug = parsed.data.slug.trim().toLowerCase()
  const allPosts = await getPostsFromDb()
  const duplicateSlug = allPosts.find(
    (existing) =>
      existing.id !== parsed.data.id &&
      existing.slug.trim().toLowerCase() === normalizedSlug
  )

  if (duplicateSlug) {
    return NextResponse.json(
      { error: 'A post with this slug already exists.' },
      { status: 409 }
    )
  }

  const post: Post = {
    ...parsed.data,
    slug: normalizedSlug,
    readTime: calculateReadTime(parsed.data.content),
    updatedAt: new Date().toISOString().split('T')[0],
  }

  const saved = await savePostToDb(post)
  if (!saved) {
    return NextResponse.json(
      { error: 'Failed to save post. Ensure Supabase is configured.' },
      { status: 500 }
    )
  }

  return NextResponse.json(saved)
}
