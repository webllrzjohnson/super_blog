/** Next.js `revalidateTag` / `unstable_cache` tag names */
export const CACHE_TAG_POSTS = "posts";
export const CACHE_TAG_SETTINGS = "settings";

/** Default TTL (seconds) for cached database reads; backs scheduled post visibility. */
export const POSTS_CACHE_REVALIDATE_SECONDS = 120;
export const SETTINGS_CACHE_REVALIDATE_SECONDS = 120;
