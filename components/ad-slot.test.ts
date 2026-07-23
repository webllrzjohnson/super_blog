import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AdSlot, pushAdSenseOnce } from '@/components/ad-slot'

describe('AdSlot with Google CMP', () => {
  it('renders without MapleHub custom consent context', () => {
    const html = renderToStaticMarkup(
      createElement(AdSlot, {
        position: 'mid',
        adSlot: '1234567890',
        clientId: 'ca-pub-1234567890123456',
      }),
    )

    expect(html).toContain('class="adsbygoogle"')
    expect(html).toContain('data-ad-client="ca-pub-1234567890123456"')
    expect(html).toContain('data-ad-slot="1234567890"')
  })

  it('queues each mounted slot only once', () => {
    const target: { adsbygoogle?: unknown[] } = {}
    const pushed = { current: false }

    expect(pushAdSenseOnce(target, pushed)).toBe(true)
    expect(pushAdSenseOnce(target, pushed)).toBe(false)
    expect(target.adsbygoogle).toHaveLength(1)
  })
})
