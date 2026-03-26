import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hashReactionVoter } from '@/lib/reactions'
import { getClientIdentifier, rateLimit } from '@/lib/rate-limit'
import { getVisitorBookmarkSlugs, setVisitorBookmarkSlugs } from '@/lib/db/visitor-bookmarks'
import { hasSupabaseConfig } from '@/lib/supabase/server'
import { BOOKMARK_SYNC_MAX_SLUGS } from '@/lib/bookmarks-sync'
import { visitorUuidFromRequest, VISITOR_DEVICE_HEADER } from '@/lib/visitor-device-id'

const putBodySchema = z.object({
  slugs: z.array(z.string()).max(BOOKMARK_SYNC_MAX_SLUGS),
})

export async function GET(request: Request) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ enabled: false, slugs: [] as string[] })
  }

  const clientId = getClientIdentifier(request)
  const limit = rateLimit({
    key: `bookmarks:sync:get:${clientId}`,
    windowMs: 60 * 1000,
    maxRequests: 60,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests.' },
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

  const hash = hashReactionVoter(visitorId)
  const slugs = await getVisitorBookmarkSlugs(hash)
  if (slugs === null) {
    return NextResponse.json({ error: 'Bookmark sync unavailable.' }, { status: 503 })
  }

  return NextResponse.json({ enabled: true, slugs })
}

export async function PUT(request: Request) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: 'Bookmark sync unavailable.' }, { status: 503 })
  }

  const clientId = getClientIdentifier(request)
  const limit = rateLimit({
    key: `bookmarks:sync:put:${clientId}`,
    windowMs: 60 * 1000,
    maxRequests: 40,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests.' },
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

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = putBodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const hash = hashReactionVoter(visitorId)
  const slugs = parsed.data.slugs
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, BOOKMARK_SYNC_MAX_SLUGS)

  const ok = await setVisitorBookmarkSlugs(hash, slugs)
  if (!ok) {
    return NextResponse.json({ error: 'Failed to save bookmarks.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, slugs })
}
