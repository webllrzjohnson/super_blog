import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { isAdminSession } from '@/lib/auth-session'
import { getClientIdentifier, rateLimit } from '@/lib/rate-limit'
import {
  deleteContentIdeaFromDb,
  updateContentIdeaInDb,
} from '@/lib/db-content-ideas'

async function checkAdmin(): Promise<boolean> {
  const headersList = await headers()
  return isAdminSession(headersList.get('cookie'))
}

const ideaSchema = z.object({
  title: z.string().min(1).max(180),
  notes: z.string().max(5000).optional(),
  category: z.enum(['Life', 'Work', 'Hobbies', 'Experience']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['idea', 'planned', 'generated', 'published', 'archived']).optional(),
  targetPublishAt: z.string().nullable().optional(),
  generatedPostId: z.string().nullable().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const clientId = getClientIdentifier(request)
  const limit = rateLimit({
    key: `content-ideas:update:${clientId}`,
    windowMs: 10 * 60 * 1000,
    maxRequests: 40,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many idea updates. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    )
  }

  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const json = await request.json().catch(() => null)
  const parsed = ideaSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid idea data', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { id } = await params
  const idea = await updateContentIdeaInDb(id, parsed.data)
  if (!idea) {
    return NextResponse.json(
      { error: 'Failed to update idea. Ensure the database migration has been applied.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ idea })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const clientId = getClientIdentifier(request)
  const limit = rateLimit({
    key: `content-ideas:delete:${clientId}`,
    windowMs: 10 * 60 * 1000,
    maxRequests: 20,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many delete requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    )
  }

  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const ok = await deleteContentIdeaFromDb(id)
  if (!ok) {
    return NextResponse.json(
      { error: 'Failed to delete idea. Ensure the database migration has been applied.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
