import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { deletePostFromDb } from '@/lib/db/posts'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headersList = await headers()
  const authHeader = headersList.get('cookie')
  if (!authHeader?.includes('admin_session=')) {
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
