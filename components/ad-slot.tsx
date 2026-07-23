'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

interface AdSenseQueueTarget {
  adsbygoogle?: unknown[]
}

interface PushState {
  current: boolean
}

export function pushAdSenseOnce(target: AdSenseQueueTarget, state: PushState) {
  if (state.current) return false

  const queue = target.adsbygoogle || []
  target.adsbygoogle = queue
  queue.push({})
  state.current = true
  return true
}

interface AdSlotProps {
  position: 'top' | 'mid' | 'sidebar' | 'footer'
  adSlot?: string // Your AdSense ad slot ID
  clientId?: string
}

const AD_SLOTS: Record<string, string> = {
  top: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP || 'XXXXXXXXXX',
  mid: process.env.NEXT_PUBLIC_ADSENSE_SLOT_MID || 'XXXXXXXXXX',
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || 'XXXXXXXXXX',
  footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER || 'XXXXXXXXXX',
}

export function AdSlot({ position, adSlot, clientId }: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null)
  const adPushed = useRef(false)

  const slotId = adSlot || AD_SLOTS[position]
  const resolvedClientId =
    clientId || process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX'

  useEffect(() => {
    // Google CMP and AdSense apply the visitor's regional consent signal.
    if (adRef.current) {
      try {
        pushAdSenseOnce(window, adPushed)
      } catch (error) {
        console.error('AdSense error:', error)
      }
    }
  }, [])

  const adStyles = {
    top: 'min-h-24 mb-8',
    mid: 'min-h-24 my-8',
    sidebar: 'min-h-64 mt-8',
    footer: 'min-h-24 mt-8',
  }

  return (
    <div className={adStyles[position]}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={resolvedClientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
