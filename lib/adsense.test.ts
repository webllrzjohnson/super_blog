import { describe, expect, it } from 'vitest'
import {
  AD_POSITIONS,
  buildAdsTxt,
  createAdsTxtResponse,
  getAdSenseAccountMetadata,
  hasUniqueAdPositions,
  isAdPosition,
  normalizeAdSenseClientId,
  normalizeAdSenseSlotId,
} from '@/lib/adsense'

describe('normalizeAdSenseClientId', () => {
  it('returns a trimmed valid AdSense client ID', () => {
    expect(normalizeAdSenseClientId('  ca-pub-1234567890123456  ')).toBe(
      'ca-pub-1234567890123456',
    )
  })

  it('rejects missing or malformed values', () => {
    expect(normalizeAdSenseClientId(undefined)).toBeUndefined()
    expect(normalizeAdSenseClientId('pub-1234567890123456')).toBeUndefined()
    expect(normalizeAdSenseClientId('ca-pub-123')).toBeUndefined()
    expect(normalizeAdSenseClientId('ca-pub-1234567890123456<script>')).toBeUndefined()
  })
})

describe('getAdSenseAccountMetadata', () => {
  it('returns server-renderable account metadata for a valid client ID', () => {
    expect(getAdSenseAccountMetadata('ca-pub-1234567890123456')).toEqual({
      'google-adsense-account': 'ca-pub-1234567890123456',
    })
  })

  it('omits account metadata for an invalid client ID', () => {
    expect(getAdSenseAccountMetadata('ca-pub-invalid')).toBeUndefined()
  })
})

describe('buildAdsTxt', () => {
  it('builds the authorized Google seller record from a valid client ID', () => {
    expect(buildAdsTxt('ca-pub-1234567890123456')).toBe(
      'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n',
    )
  })

  it('omits ads.txt content until a valid publisher ID exists', () => {
    expect(buildAdsTxt(undefined)).toBeUndefined()
    expect(buildAdsTxt('ca-pub-invalid')).toBeUndefined()
  })
})

describe('AdSense slots', () => {
  it('accepts only supported ad positions', () => {
    for (const position of AD_POSITIONS) expect(isAdPosition(position)).toBe(true)
    expect(isAdPosition('sidebar')).toBe(false)
  })

  it('normalizes only 10-digit ad slot IDs', () => {
    expect(normalizeAdSenseSlotId(' 1234567890 ')).toBe('1234567890')
    expect(normalizeAdSenseSlotId('123')).toBeUndefined()
    expect(normalizeAdSenseSlotId('123456789a')).toBeUndefined()
  })

  it('detects duplicate ad positions', () => {
    expect(hasUniqueAdPositions([{ position: 'mid-content' }, { position: 'mid-content' }])).toBe(false)
    expect(hasUniqueAdPositions([{ position: 'mid-content' }, { position: 'end-of-article' }])).toBe(true)
  })
})

describe('createAdsTxtResponse', () => {
  it('returns a cacheable text response when a valid ID exists', async () => {
    const response = createAdsTxtResponse('ca-pub-1234567890123456')

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8')
    expect(response.headers.get('cache-control')).toBe('public, max-age=120')
    expect(await response.text()).toBe(
      'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n',
    )
  })

  it('returns a cacheable 404 until a valid ID exists', async () => {
    const response = createAdsTxtResponse(undefined)

    expect(response.status).toBe(404)
    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8')
    expect(response.headers.get('cache-control')).toBe('public, max-age=120')
    expect(await response.text()).toBe('Not found\n')
  })
})
