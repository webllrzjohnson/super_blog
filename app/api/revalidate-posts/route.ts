import { NextResponse } from 'next/server'
import { revalidatePostsCache } from '@/lib/revalidate-cache'
import { CACHE_TAG_POSTS } from '@/lib/cache-tags'

/**
 * Refresh cached post list (e.g. when scheduled posts become visible).
 * Auth: `Authorization: Bearer <CRON_SECRET>` (Vercel Cron) or `?secret=<REVALIDATE_SECRET>`.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const url = new URL(request.url)
  const urlSecret = url.searchParams.get('secret')
  const revalidateSecret = process.env.REVALIDATE_SECRET

  const okCron = cronSecret && authHeader === `Bearer ${cronSecret}`
  const okManual =
    revalidateSecret && urlSecret === revalidateSecret && revalidateSecret.length > 0

  if (!okCron && !okManual) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  revalidatePostsCache()
  return NextResponse.json({ revalidated: true, tag: CACHE_TAG_POSTS })
}
