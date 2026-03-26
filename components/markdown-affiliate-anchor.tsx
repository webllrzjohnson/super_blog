'use client'

import type { ComponentPropsWithoutRef, MouseEventHandler } from 'react'
import { isExternalHref, isLikelyAffiliateUrl } from '@/lib/affiliate-url'
import { cn } from '@/lib/utils'

export type MarkdownAffiliateAnchorProps = ComponentPropsWithoutRef<'a'> & {
  postSlug: string
}

export function MarkdownAffiliateAnchor({
  href,
  children,
  postSlug,
  className,
  onClick: userOnClick,
  ...rest
}: MarkdownAffiliateAnchorProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  if (!href) {
    return (
      <a className={className} {...rest}>
        {children}
      </a>
    )
  }

  const external = isExternalHref(href, siteUrl)
  const affiliate = external && isLikelyAffiliateUrl(href)

  const rel = affiliate
    ? 'nofollow sponsored noopener noreferrer'
    : external
      ? 'noopener noreferrer'
      : undefined
  const target = external ? '_blank' : undefined

  const onClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    userOnClick?.(e)
    if (!affiliate || !postSlug || e.defaultPrevented) return
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
      // ignore
    }
  }

  return (
    <a
      {...rest}
      href={href}
      className={cn(
        'text-primary underline underline-offset-2 decoration-2 hover:text-foreground transition-colors',
        className
      )}
      rel={rel}
      target={target}
      onClick={onClick}
    >
      {children}
    </a>
  )
}
