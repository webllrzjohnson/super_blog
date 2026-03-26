import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPostBySlugFromDb } from '@/lib/db/posts'
import { insertPendingComment, listApprovedCommentsForPost } from '@/lib/db/comments'
import { isPostPubliclyVisible } from '@/lib/posts'
import { getClientIdentifier, rateLimit } from '@/lib/rate-limit'
import { hashReactionVoter } from '@/lib/reactions'
import { hasSupabaseConfig } from '@/lib/supabase/server'
import { VISITOR_DEVICE_HEADER, visitorUuidFromRequest } from '@/lib/visitor-device-id'

const postBodySchema = z.object({
  authorName: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(8000),
})

async function resolvePublicPost(slug: string) {
  const post = await getPostBySlugFromDb(slug)
  if (!post || !isPostPubliclyVisible(post)) {
    return null
  }
  return post
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const clientId = getClientIdentifier(request)
  const limit = rateLimit({
    key: `comments:read:${clientId}`,
    windowMs: 60 * 1000,
    maxRequests: 120,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    )
  }

  const { slug } = await params
  const post = await resolvePublicPost(slug)
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json({ comments: [] })
  }

  const comments = await listApprovedCommentsForPost(post.id)
  return NextResponse.json({ comments })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      { error: 'Comments require database configuration.' },
      { status: 503 }
    )
  }

  const clientId = getClientIdentifier(request)
  const limit = rateLimit({
    key: `comments:write:${clientId}`,
    windowMs: 15 * 60 * 1000,
    maxRequests: 8,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many comments. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    )
  }

  const visitorId = visitorUuidFromRequest(request)
  if (!visitorId) {
    return NextResponse.json(
      { error: `Missing or invalid ${VISITOR_DEVICE_HEADER} header.` },
      { status: 400 }
    )
  }

  const { slug } = await params
  const post = await resolvePublicPost(slug)
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = postBodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const voterHash = hashReactionVoter(visitorId)
  const created = await insertPendingComment({
    postId: post.id,
    authorName: parsed.data.authorName,
    body: parsed.data.body,
    visitorHash: voterHash,
  })

  if (!created) {
    return NextResponse.json({ error: 'Failed to save comment.' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    message:
      'Thanks — your comment was submitted for review and will appear after approval.',
  })
}
