import { revalidatePath, revalidateTag } from 'next/cache'
import { CACHE_TAG_POSTS, CACHE_TAG_SETTINGS } from '@/lib/cache-tags'

/** Cache life profile for on-demand tag invalidation (Next.js 16). */
const TAG_PROFILE = 'max' as const

export function revalidatePostsCache() {
  revalidateTag(CACHE_TAG_POSTS, TAG_PROFILE)
  // Full Route Cache can keep a stale /blog shell when only the data tag was cleared
  // (blog uses a client list with useSearchParams). Bust listed pages on post changes.
  revalidatePath('/', 'layout')
}

export function revalidateSettingsCache() {
  revalidateTag(CACHE_TAG_SETTINGS, TAG_PROFILE)
}
