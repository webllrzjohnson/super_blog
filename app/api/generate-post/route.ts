import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { isAdminSession } from '@/lib/auth-session'
import { generateAndSavePost } from '@/lib/generate-post'
import { getClientIdentifier, rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const clientId = getClientIdentifier(request)
  const limit = rateLimit({
    key: `generate-post:${clientId}`,
    windowMs: 10 * 60 * 1000,
    maxRequests: 5,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many generation requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds) },
      }
    )
  }

  const headersList = await headers()
  if (!isAdminSession(headersList.get('cookie'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const topic = String(formData.get('topic') ?? '').trim()
  const context = String(formData.get('context') ?? '').trim()
  const schedule = String(formData.get('schedule') ?? 'Immediate').trim()
  const featuredImage = formData.get('featured_image')

  const result = await generateAndSavePost({
    topic,
    context,
    schedule,
    featuredImage: featuredImage instanceof File ? featuredImage : null,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: result.published
      ? `Post published with ${result.model === 'claude' ? 'Claude' : 'Groq'}.`
      : `Draft saved with ${result.model === 'claude' ? 'Claude' : 'Groq'}. Review it in the admin dashboard.`,
    slug: result.post.slug,
    status: result.post.status,
  })
}
