import { describe, expect, it } from 'vitest'
import { mergeBookmarkSlugs } from '@/lib/bookmarks-sync'

describe('mergeBookmarkSlugs', () => {
  it('dedupes and preserves local order then server-only', () => {
    expect(mergeBookmarkSlugs(['b', 'a'], ['c', 'a'])).toEqual(['b', 'a', 'c'])
  })

  it('trims and skips empty', () => {
    expect(mergeBookmarkSlugs(['  x  ', ''], [' y '])).toEqual(['x', 'y'])
  })
})
