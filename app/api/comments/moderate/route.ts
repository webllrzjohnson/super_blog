import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { isAdminSession } from '@/lib/auth-session'
import {
  listCommentsForModeration,
  setCommentStatus,
} from '@/lib/db/comments'
import { hasSupabaseConfig } from '@/lib/supabase/server'

async function checkAdmin(): Promise<boolean> {
  const headersList = await headers()
  return isAdminSession(headersList.get('cookie'))
}

const patchSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
})

export async function GET(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json({ configured: false, pending: [] })
  }

  const url = new URL(request.url)
  const status = url.searchParams.get('status') ?? 'pending'
  const normalized =
    status === 'approved' || status === 'rejected' || status === 'pending'
      ? status
      : 'pending'

  const rows =
    normalized === 'pending'
      ? await listCommentsForModeration('pending')
      : await listCommentsForModeration(normalized)

  return NextResponse.json({ configured: true, comments: rows })
}

export async function PATCH(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const nextStatus = parsed.data.action === 'approve' ? 'approved' : 'rejected'
  const ok = await setCommentStatus(parsed.data.id, nextStatus)
  if (!ok) {
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
