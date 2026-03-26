import { revalidateTag } from 'next/cache'
import { CACHE_TAG_POSTS, CACHE_TAG_SETTINGS } from '@/lib/cache-tags'

/** Cache life profile for on-demand tag invalidation (Next.js 16). */
const TAG_PROFILE = 'max' as const

export function revalidatePostsCache() {
  revalidateTag(CACHE_TAG_POSTS, TAG_PROFILE)
}

export function revalidateSettingsCache() {
  revalidateTag(CACHE_TAG_SETTINGS, TAG_PROFILE)
}
