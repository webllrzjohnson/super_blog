import { describe, expect, it } from 'vitest'
import { aggregateOutboundClicks } from '@/lib/outbound-click-stats'

describe('aggregateOutboundClicks', () => {
  it('groups by post and host', () => {
    const since = '2026-01-01T00:00:00.000Z'
    const rows = [
      {
        created_at: '2026-01-02T00:00:00.000Z',
        post_slug: 'a',
        link_host: 'amazon.com',
        is_affiliate: true,
      },
      {
        created_at: '2026-01-02T01:00:00.000Z',
        post_slug: 'a',
        link_host: 'amazon.com',
        is_affiliate: true,
      },
      {
        created_at: '2026-01-02T02:00:00.000Z',
        post_slug: 'b',
        link_host: 'example.org',
        is_affiliate: false,
      },
    ]

    const s = aggregateOutboundClicks(rows, since, 30)
    expect(s.totalClicks).toBe(3)
    expect(s.affiliateClicks).toBe(2)
    expect(s.externalClicks).toBe(1)
    expect(s.byPost.find((p) => p.postSlug === 'a')).toEqual({
      postSlug: 'a',
      total: 2,
      affiliate: 2,
    })
    expect(s.byHost.find((h) => h.host === 'example.org')?.total).toBe(1)
  })
})
