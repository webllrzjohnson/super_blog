import { isExternalHref, isLikelyAffiliateUrl } from '@/lib/affiliate-url'

const LINK_CLASS =
  'text-primary underline underline-offset-2 decoration-2 hover:text-foreground transition-colors'

export function getMarkdownAnchorProps(href: string | undefined, siteUrl: string) {
  if (!href) {
    return { className: LINK_CLASS }
  }

  const external = isExternalHref(href, siteUrl)
  const affiliate = external && isLikelyAffiliateUrl(href)

  return {
    className: LINK_CLASS,
    href,
    rel: affiliate
      ? 'nofollow sponsored noopener noreferrer'
      : external
        ? 'noopener noreferrer'
        : undefined,
    target: external ? '_blank' : undefined,
    ...(affiliate ? { 'data-affiliate': 'true' as const } : {}),
  }
}
