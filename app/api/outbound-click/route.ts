import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getClientIdentifier, rateLimit } from '@/lib/rate-limit'
import { isLikelyAffiliateUrl } from '@/lib/affiliate-url'
import { recordOutboundClickEvent } from '@/lib/db/outbound-clicks'

const bodySchema = z.object({
  slug: z.string().min(1).max(200),
  href: z.string().url().max(2000),
  type: z.enum(['affiliate', 'external']).optional(),
})

/**
 * Affiliate / outbound instrumentation. No cookies; events may be stored when Supabase
 * is configured; optional Sentry breadcrumb for affiliate clicks.
 */
export async function POST(request: Request) {
  const clientId = getClientIdentifier(request)
  const limit = rateLimit({
    key: `outbound:${clientId}`,
    windowMs: 60 * 1000,
    maxRequests: 40,
  })

  if (!limit.allowed) {
    return new NextResponse(null, {
      status: 429,
      headers: { 'Retry-After': String(limit.retryAfterSeconds) },
    })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { slug, href, type } = parsed.data
  const affiliate = type === 'affiliate' || isLikelyAffiliateUrl(href)

  if (process.env.NODE_ENV === 'development') {
    console.info('[outbound-click]', { slug, affiliate, href: href.slice(0, 80) })
  }

  await recordOutboundClickEvent({
    postSlug: slug,
    href,
    isAffiliate: affiliate,
  })

  if (affiliate) {
    Sentry.addBreadcrumb({
      category: 'affiliate.outbound',
      message: 'Affiliate link click',
      level: 'info',
      data: { slug },
    })
  }

  return new NextResponse(null, { status: 204 })
}
