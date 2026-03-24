import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { deletePostFromDb } from '@/lib/db/posts'
import { isAdminSession } from '@/lib/auth-session'
import { getClientIdentifier, rateLimit } from '@/lib/rate-limit'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const clientId = getClientIdentifier(request)
  const limit = rateLimit({
    key: `posts:delete:${clientId}`,
    windowMs: 10 * 60 * 1000,
    maxRequests: 20,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many delete requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds) },
      }
    )
  }

  const headersList = await headers()
  if (!(await isAdminSession(headersList.get('cookie')))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const ok = await deletePostFromDb(id)

  if (!ok) {
    return NextResponse.json(
      { error: 'Failed to delete post. Ensure Supabase is configured.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
