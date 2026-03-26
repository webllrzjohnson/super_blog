import { describe, expect, it } from 'vitest'
import { parseBookmarkSlugs, serializeBookmarkSlugs } from '@/lib/bookmarks'

describe('parseBookmarkSlugs', () => {
  it('returns empty for invalid json', () => {
    expect(parseBookmarkSlugs('not-json')).toEqual([])
  })

  it('dedupes preserving first occurrence order', () => {
    const raw = serializeBookmarkSlugs(['a', 'b', 'a', 'c'])
    expect(parseBookmarkSlugs(raw)).toEqual(['a', 'b', 'c'])
  })

  it('trims and filters empty strings', () => {
    expect(parseBookmarkSlugs(serializeBookmarkSlugs(['  x ', '', 'y']))).toEqual(['x', 'y'])
  })
})
