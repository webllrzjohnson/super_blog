import { NextResponse } from 'next/server'
import { seedSamplePosts } from '@/lib/db/posts'
import { isAdminSession } from '@/lib/auth-session'
import { revalidatePostsCache } from '@/lib/revalidate-cache'

export async function POST(request: Request) {
  if (!(await isAdminSession(request.headers.get('cookie')))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await seedSamplePosts()
    revalidatePostsCache()
    return NextResponse.json({ success: true, message: 'Sample posts seeded' })
  } catch (err) {
    console.error('Seed error:', err)
    return NextResponse.json(
      { error: 'Failed to seed. Ensure Supabase is configured.' },
      { status: 500 }
    )
  }
}
