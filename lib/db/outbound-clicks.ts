import sql from '@/lib/db'
import { hasDatabaseConfig } from '@/lib/db-config'
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
  if (!hasDatabaseConfig()) return

  try {
    await sql`
      INSERT INTO outbound_click_events (post_slug, href, link_host, is_affiliate)
      VALUES (
        ${input.postSlug},
        ${input.href.slice(0, 2000)},
        ${linkHostFromHref(input.href) || '(invalid)'},
        ${input.isAffiliate}
      )
    `
  } catch (err) {
    console.error('recordOutboundClickEvent error:', err)
  }
}

export async function getOutboundClickStatsSummary(
  days: number
): Promise<OutboundClickStatsSummary | null> {
  if (!hasDatabaseConfig()) return null

  const safeDays = Math.min(Math.max(Math.floor(days), 1), 365)
  const since = new Date(Date.now() - safeDays * 86400000)
  const sinceIso = since.toISOString()

  try {
    const rows = await sql<
      Array<{
        created_at: string
        post_slug: string
        link_host: string
        is_affiliate: boolean
      }>
    >`
      SELECT created_at, post_slug, link_host, is_affiliate
      FROM outbound_click_events
      WHERE created_at >= ${sinceIso}
      ORDER BY created_at DESC
      LIMIT 12000
    `

    return aggregateOutboundClicks(rows, sinceIso, safeDays)
  } catch (err) {
    console.error('getOutboundClickStatsSummary error:', err)
    return null
  }
}
