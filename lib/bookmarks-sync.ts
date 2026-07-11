/**
 * Merge local and server bookmark slug lists. Preserves local order, then appends
 * server-only slugs (order stable for items in both).
 */
export function mergeBookmarkSlugs(local: string[], server: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const s of local) {
    const slug = s.trim()
    if (!slug || seen.has(slug)) continue
    seen.add(slug)
    out.push(slug)
  }
  for (const s of server) {
    const slug = s.trim()
    if (!slug || seen.has(slug)) continue
    seen.add(slug)
    out.push(slug)
  }
  return out
}

export const BOOKMARK_SYNC_MAX_SLUGS = 400

/** Browser may call bookmark sync APIs when server-side database sync is enabled. */
export function isBookmarkSyncClientConfigured(): boolean {
  return typeof window !== 'undefined'
}
