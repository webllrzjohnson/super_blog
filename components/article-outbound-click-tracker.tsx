'use client'

import type { MouseEvent, ReactNode } from 'react'

interface ArticleOutboundClickTrackerProps {
  postSlug: string
  children: ReactNode
}

export function ArticleOutboundClickTracker({
  postSlug,
  children,
}: ArticleOutboundClickTrackerProps) {
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target
    if (!(target instanceof Element)) return

    const anchor = target.closest('a[data-affiliate="true"]')
    if (!(anchor instanceof HTMLAnchorElement) || event.defaultPrevented) return

    const href = anchor.getAttribute('href')
    if (!href || !postSlug) return

    try {
      const body = JSON.stringify({
        slug: postSlug,
        href,
        type: 'affiliate' as const,
      })
      const blob = new Blob([body], { type: 'application/json' })
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon('/api/outbound-click', blob)
      }
    } catch {
      // best-effort analytics
    }
  }

  return <div onClick={handleClick}>{children}</div>
}
