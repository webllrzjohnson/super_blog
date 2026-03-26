import { createServerClient, hasSupabaseConfig } from '@/lib/supabase/server'
import { BOOKMARK_SYNC_MAX_SLUGS } from '@/lib/bookmarks-sync'

function normalizeSlugs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const x of raw) {
    if (typeof x !== 'string') continue
    const s = x.trim()
    if (!s || seen.has(s)) continue
    if (out.length >= BOOKMARK_SYNC_MAX_SLUGS) break
    seen.add(s)
    out.push(s)
  }
  return out
}

export async function getVisitorBookmarkSlugs(visitorHash: string): Promise<string[] | null> {
  if (!hasSupabaseConfig()) return null

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('visitor_bookmarks')
      .select('slugs')
      .eq('visitor_hash', visitorHash)
      .maybeSingle()

    if (error) {
      console.error('getVisitorBookmarkSlugs:', error)
      return null
    }
    return normalizeSlugs(data?.slugs)
  } catch (err) {
    console.error('getVisitorBookmarkSlugs error:', err)
    return null
  }
}

export async function setVisitorBookmarkSlugs(
  visitorHash: string,
  slugs: string[]
): Promise<boolean> {
  if (!hasSupabaseConfig()) return false

  const normalized = normalizeSlugs(slugs)
  try {
    const supabase = createServerClient()
    const { error } = await supabase.from('visitor_bookmarks').upsert(
      {
        visitor_hash: visitorHash,
        slugs: normalized,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'visitor_hash' }
    )

    if (error) {
      console.error('setVisitorBookmarkSlugs:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('setVisitorBookmarkSlugs error:', err)
    return false
  }
}
