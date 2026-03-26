import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPostBySlugFromDb } from '@/lib/db/posts'
import { getReactionSummaryForPost, setPostReaction } from '@/lib/db/reactions'
import { isPostPubliclyVisible } from '@/lib/posts'
import { getClientIdentifier, rateLimit } from '@/lib/rate-limit'
import { hashReactionVoter, reactionKindSchema } from '@/lib/reactions'
import { hasSupabaseConfig } from '@/lib/supabase/server'
import {
  VISITOR_DEVICE_HEADER,
  visitorUuidFromRequest,
} from '@/lib/visitor-device-id'

const postBodySchema = z.object({
  kind: reactionKindSchema.nullable(),
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
    key: `reactions:read:${clientId}`,
    windowMs: 60 * 1000,
    maxRequests: 120,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds) },
      }
    )
  }

  const { slug } = await params
  const post = await resolvePublicPost(slug)
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json({
      counts: { helpful: 0, thanks: 0, insight: 0 },
      mine: null,
    })
  }

  const visitorId = visitorUuidFromRequest(request)
  const voterHash = visitorId ? hashReactionVoter(visitorId) : null
  const summary = await getReactionSummaryForPost(post.id, voterHash)

  return NextResponse.json(summary)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const clientId = getClientIdentifier(request)
  const limit = rateLimit({
    key: `reactions:write:${clientId}`,
    windowMs: 10 * 60 * 1000,
    maxRequests: 40,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many reaction updates. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds) },
      }
    )
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      { error: 'Reactions require database configuration.' },
      { status: 503 }
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
  const ok = await setPostReaction(post.id, voterHash, parsed.data.kind)

  if (!ok) {
    return NextResponse.json({ error: 'Failed to save reaction.' }, { status: 500 })
  }

  const summary = await getReactionSummaryForPost(post.id, voterHash)
  return NextResponse.json(summary)
}
