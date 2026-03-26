import { createServerClient, hasSupabaseConfig } from '@/lib/supabase/server'
import {
  aggregateOutboundClicks,
  type OutboundClickStatsSummary,
} from '@/lib/outbound-click-stats'

export function linkHostFromHref(href: string): string {
  try {
    return new URL(href).hostname.toLowerCase()
  } catch {
    return ''
  }
}

/**
 * Persist a single click event. Best-effort: failures are logged and do not throw.
 */
export async function recordOutboundClickEvent(input: {
  postSlug: string
  href: string
  isAffiliate: boolean
}): Promise<void> {
  if (!hasSupabaseConfig()) return

  try {
    const supabase = createServerClient()
    const link_host = linkHostFromHref(input.href) || '(invalid)'
    const { error } = await supabase.from('outbound_click_events').insert({
      post_slug: input.postSlug,
      href: input.href.slice(0, 2000),
      link_host,
      is_affiliate: input.isAffiliate,
    })

    if (error) {
      console.error('recordOutboundClickEvent:', error)
    }
  } catch (err) {
    console.error('recordOutboundClickEvent error:', err)
  }
}

export async function getOutboundClickStatsSummary(
  days: number
): Promise<OutboundClickStatsSummary | null> {
  if (!hasSupabaseConfig()) return null

  const safeDays = Math.min(Math.max(Math.floor(days), 1), 365)
  const since = new Date(Date.now() - safeDays * 86400000)
  const sinceIso = since.toISOString()

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('outbound_click_events')
      .select('created_at, post_slug, link_host, is_affiliate')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false })
      .limit(12_000)

    if (error) {
      console.error('getOutboundClickStatsSummary:', error)
      return null
    }

    const rows = (data ?? []).map((r) => ({
      created_at: r.created_at as string,
      post_slug: r.post_slug as string,
      link_host: r.link_host as string,
      is_affiliate: Boolean(r.is_affiliate),
    }))

    return aggregateOutboundClicks(rows, sinceIso, safeDays)
  } catch (err) {
    console.error('getOutboundClickStatsSummary error:', err)
    return null
  }
}
