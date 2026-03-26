/** localStorage key for saved post slugs (order = add order, newest at end). */
export const BOOKMARKS_STORAGE_KEY = 'blog:bookmarked_slugs:v1'

export function parseBookmarkSlugs(raw: string | null): string[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    const slugs = data.filter(
      (x): x is string => typeof x === 'string' && x.trim().length > 0
    )
    const seen = new Set<string>()
    const deduped: string[] = []
    for (const s of slugs) {
      const slug = s.trim()
      if (seen.has(slug)) continue
      seen.add(slug)
      deduped.push(slug)
    }
    return deduped
  } catch {
    return []
  }
}

export function serializeBookmarkSlugs(slugs: string[]): string {
  return JSON.stringify(slugs)
}
