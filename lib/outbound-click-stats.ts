/** Row shape from `outbound_click_events` selects (subset). */
export type OutboundClickEventRow = {
  created_at: string
  post_slug: string
  link_host: string
  is_affiliate: boolean
}

export type OutboundClickStatsSummary = {
  sinceIso: string
  days: number
  totalClicks: number
  affiliateClicks: number
  externalClicks: number
  byPost: { postSlug: string; total: number; affiliate: number }[]
  byHost: { host: string; total: number; affiliate: number }[]
  recent: {
    createdAt: string
    postSlug: string
    host: string
    isAffiliate: boolean
  }[]
}

export function aggregateOutboundClicks(
  rows: OutboundClickEventRow[],
  sinceIso: string,
  days: number
): OutboundClickStatsSummary {
  const postMap = new Map<string, { total: number; affiliate: number }>()
  const hostMap = new Map<string, { total: number; affiliate: number }>()

  let affiliateClicks = 0
  for (const row of rows) {
    if (row.is_affiliate) affiliateClicks += 1

    const p = postMap.get(row.post_slug) ?? { total: 0, affiliate: 0 }
    p.total += 1
    if (row.is_affiliate) p.affiliate += 1
    postMap.set(row.post_slug, p)

    const h = hostMap.get(row.link_host) ?? { total: 0, affiliate: 0 }
    h.total += 1
    if (row.is_affiliate) h.affiliate += 1
    hostMap.set(row.link_host, h)
  }

  const byPost = [...postMap.entries()]
    .map(([postSlug, v]) => ({ postSlug, total: v.total, affiliate: v.affiliate }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 25)

  const byHost = [...hostMap.entries()]
    .map(([host, v]) => ({ host, total: v.total, affiliate: v.affiliate }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 20)

  const recent = rows.slice(0, 40).map((r) => ({
    createdAt: r.created_at,
    postSlug: r.post_slug,
    host: r.link_host,
    isAffiliate: r.is_affiliate,
  }))

  return {
    sinceIso,
    days,
    totalClicks: rows.length,
    affiliateClicks,
    externalClicks: rows.length - affiliateClicks,
    byPost,
    byHost,
    recent,
  }
}
