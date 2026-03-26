import { describe, expect, it } from 'vitest'
import { isExternalHref, isLikelyAffiliateUrl } from '@/lib/affiliate-url'

describe('isLikelyAffiliateUrl', () => {
  it('detects Amazon and short links', () => {
    expect(isLikelyAffiliateUrl('https://amazon.com/dp/B00')).toBe(true)
    expect(isLikelyAffiliateUrl('https://www.amazon.ca/gp/product/x')).toBe(true)
    expect(isLikelyAffiliateUrl('https://amzn.to/abc123')).toBe(true)
  })

  it('returns false for internal and generic links', () => {
    expect(isLikelyAffiliateUrl('/blog/foo')).toBe(false)
    expect(isLikelyAffiliateUrl('#intro')).toBe(false)
    expect(isLikelyAffiliateUrl('https://example.com/page')).toBe(false)
  })
})

describe('isExternalHref', () => {
  it('treats same host as internal when site URL matches', () => {
    expect(isExternalHref('/blog', 'https://mysite.com')).toBe(false)
    expect(isExternalHref('https://mysite.com/x', 'https://mysite.com')).toBe(false)
  })

  it('treats other hosts as external', () => {
    expect(isExternalHref('https://other.com', 'https://mysite.com')).toBe(true)
  })
})
