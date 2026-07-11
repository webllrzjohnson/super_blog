import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getClientIdentifier, rateLimit } from '@/lib/rate-limit'
import { createContentIdeaInDb } from '@/lib/db-content-ideas'
import { parseTelegramIdeaCapture } from '@/lib/telegram-idea-capture'

const captureSchema = z.object({
  message: z.string().min(1).max(5000),
  source: z.string().max(120).optional(),
})

function hasCaptureAccess(request: Request): boolean {
  const secret = process.env.CONTENT_IDEA_CAPTURE_SECRET?.trim()
  if (!secret) return false
  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function POST(request: Request) {
  const clientId = getClientIdentifier(request)
  const limit = rateLimit({
    key: `content-ideas:capture:${clientId}`,
    windowMs: 10 * 60 * 1000,
    maxRequests: 20,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many idea capture requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    )
  }

  if (!hasCaptureAccess(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const json = await request.json().catch(() => null)
  const parsed = captureSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid capture payload', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  let input
  try {
    input = parseTelegramIdeaCapture(parsed.data.message)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not parse idea message' },
      { status: 400 }
    )
  }

  const sourceNote = parsed.data.source?.trim()
  const idea = await createContentIdeaInDb({
    ...input,
    notes: [input.notes, sourceNote ? `Captured from ${sourceNote}` : null].filter(Boolean).join('\n\n'),
  })

  if (!idea) {
    return NextResponse.json(
      { error: 'Failed to save idea. Ensure the database migration has been applied.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ idea })
}
