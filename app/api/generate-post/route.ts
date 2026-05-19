import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { isAdminSession } from '@/lib/auth-session'

export async function POST(request: Request) {
  const headersList = await headers()
  const isAdmin = isAdminSession(headersList.get('cookie'))
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()

  // Forward as FormData directly to n8n
  const n8nForm = new FormData()
  n8nForm.append('topic', formData.get('topic') as string)
  n8nForm.append('context', formData.get('context') as string)
  n8nForm.append('schedule', formData.get('schedule') as string)

  const image = formData.get('featured_image') as File | null
  if (image && image.size > 0) {
    n8nForm.append('featured_image', image)
  }

  const response = await fetch('https://n8n.maplehub.cloud/webhook/a32e0cfc-7e10-47f1-8827-f53c9abf9cfa', {
    method: 'POST',
    body: n8nForm,
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to trigger generation' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Post generation started' })
}