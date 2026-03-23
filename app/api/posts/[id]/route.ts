import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { deletePostFromDb } from '@/lib/db/posts'
import { isAdminSession } from '@/lib/auth-session'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
