import { NextResponse } from 'next/server'
import { seedSamplePosts } from '@/lib/db/posts'

export async function POST(request: Request) {
  const authHeader = request.headers.get('cookie')
  if (!authHeader?.includes('admin_session=authenticated')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await seedSamplePosts()
    return NextResponse.json({ success: true, message: 'Sample posts seeded' })
  } catch (err) {
    console.error('Seed error:', err)
    return NextResponse.json(
      { error: 'Failed to seed. Ensure Supabase is configured.' },
      { status: 500 }
    )
  }
}
