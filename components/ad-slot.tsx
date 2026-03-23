'use client'

import { useConsent } from '@/lib/consent-context'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
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
  const { hasConsented, isLoaded } = useConsent()
  const adRef = useRef<HTMLModElement>(null)
  const adPushed = useRef(false)

  const slotId = adSlot || AD_SLOTS[position]
  const resolvedClientId =
    clientId || process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX'

  useEffect(() => {
    // Only push ad if consent given and not already pushed
    if (hasConsented && !adPushed.current && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
        adPushed.current = true
      } catch (error) {
        console.error('AdSense error:', error)
      }
    }
  }, [hasConsented])

  const adStyles = {
    top: 'h-24 mb-8',
    mid: 'h-24 my-8',
    sidebar: 'h-64 mt-8',
    footer: 'h-24 mt-8',
  }

  // Show placeholder while loading consent status
  if (!isLoaded) {
    return (
      <div className={`${adStyles[position]} bg-secondary/20 rounded animate-pulse`} />
    )
  }

  // If user declined cookies, show non-personalized ad placeholder
  if (!hasConsented) {
    return (
      <div 
        className={`${adStyles[position]} bg-secondary/30 rounded border border-dashed border-border flex items-center justify-center`}
      >
        <span className="text-xs text-muted-foreground text-center px-4">
          Enable cookies to see personalized content
        </span>
      </div>
    )
  }

  // User consented - show actual AdSense ad
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
