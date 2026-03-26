/**
 * Detect outbound URLs that are commonly affiliate / partner links.
 * Used for rel="sponsored", analytics beacons, and checklist hints.
 */
export function isLikelyAffiliateUrl(href: string): boolean {
  const s = href.trim().toLowerCase()
  if (!s || s.startsWith('#') || s.startsWith('mailto:') || s.startsWith('tel:')) {
    return false
  }

  try {
    const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(s)
    const u = new URL(hasScheme ? s : `https://${s}`)
    const host = u.hostname.replace(/^www\./, '')

    if (host === 'amzn.to' || host.endsWith('.amzn.to')) return true
    if (host.startsWith('amazon.') || host.endsWith('.amazon.com')) return true
    if (host.includes('amazon.')) return true
    if (host.includes('awin1.com')) return true
    if (host.includes('shareasale.com')) return true
    if (host.includes('click.linksynergy.com')) return true
    if (host.includes('partners.shopify.com')) return true
    if (host.includes('anrdoezrs.net')) return true // CJ / Commission Junction redirects
    if (host.includes('ojrq.net')) return true

    return false
  } catch {
    return /\bamazon\.[a-z.]{2,}\b/i.test(href) || /\bamzn\.to\b/i.test(href)
  }
}

/**
 * True if `href` is http(s) and host differs from the configured site (or path-only internal).
 */
export function isExternalHref(href: string, siteUrl: string): boolean {
  const t = href.trim()
  if (!t || t.startsWith('#') || t.startsWith('/') || t.startsWith('mailto:') || t.startsWith('tel:')) {
    return false
  }

  if (!/^[a-z][a-z0-9+.-]*:/i.test(t)) {
    return false
  }

  try {
    const u = new URL(t)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
    let siteHost = ''
    try {
      siteHost = new URL(siteUrl || 'http://localhost').hostname.replace(/^www\./, '')
    } catch {
      siteHost = ''
    }
    const linkHost = u.hostname.replace(/^www\./, '')
    if (!siteHost) return true
    return linkHost !== siteHost && linkHost.length > 0
  } catch {
    return false
  }
}
