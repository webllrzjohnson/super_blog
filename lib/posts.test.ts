import { describe, expect, it } from 'vitest'
import type { Post } from '@/lib/types'
import {
  calculateReadTime,
  defaultAuthor,
  getAdjacentPosts,
  getAllTags,
  getPublishedPosts,
  getRelatedPosts,
  isPostPubliclyVisible,
  scoreRelatedPost,
  searchPosts,
} from '@/lib/posts'

function mockPost(overrides: Partial<Post>): Post {
  return {
    id: 'id',
    title: 'Title',
    slug: 'slug',
    excerpt: 'Excerpt',
    content: 'Content',
    category: 'Life',
    tags: ['alpha'],
    author: defaultAuthor,
    publishedAt: '2026-01-15',
    readTime: 1,
    status: 'published',
    ...overrides,
  }
}

describe('isPostPubliclyVisible', () => {
  it('treats published posts as visible', () => {
    expect(isPostPubliclyVisible(mockPost({ status: 'published' }))).toBe(true)
  })

  it('hides drafts', () => {
    expect(isPostPubliclyVisible(mockPost({ status: 'draft' }))).toBe(false)
  })

  it('hides scheduled posts before publish time', () => {
    const now = new Date('2026-01-01T12:00:00Z')
    expect(
      isPostPubliclyVisible(
        mockPost({
          status: 'scheduled',
          publishedAt: '2026-06-01T12:00:00.000Z',
        }),
        now
      )
    ).toBe(false)
  })

  it('shows scheduled posts at or after publish time', () => {
    const now = new Date('2026-06-02T12:00:00Z')
    expect(
      isPostPubliclyVisible(
        mockPost({
          status: 'scheduled',
          publishedAt: '2026-06-01T12:00:00.000Z',
        }),
        now
      )
    ).toBe(true)
  })
})

describe('getPublishedPosts', () => {
  it('returns only visible posts sorted by publishedAt descending', () => {
    const posts = [
      mockPost({
        id: '1',
        slug: 'a',
        publishedAt: '2026-01-01',
        status: 'draft',
      }),
      mockPost({
        id: '2',
        slug: 'b',
        publishedAt: '2026-03-01',
        status: 'published',
      }),
      mockPost({
        id: '3',
        slug: 'c',
        publishedAt: '2026-02-01',
        status: 'published',
      }),
    ]
    expect(getPublishedPosts(posts).map((p) => p.slug)).toEqual(['b', 'c'])
  })
})

describe('getAdjacentPosts', () => {
  it('returns newer and older in published chronological order', () => {
    const pNew = mockPost({
      id: '1',
      slug: 'new',
      publishedAt: '2026-03-01',
    })
    const pMid = mockPost({
      id: '2',
      slug: 'mid',
      publishedAt: '2026-02-01',
    })
    const pOld = mockPost({
      id: '3',
      slug: 'old',
      publishedAt: '2026-01-01',
    })
    const { newer, older } = getAdjacentPosts([pNew, pMid, pOld], 'mid')
    expect(newer?.slug).toBe('new')
    expect(older?.slug).toBe('old')
  })
})

describe('getRelatedPosts', () => {
  it('excludes current post and respects limit', () => {
    const current = mockPost({
      id: '1',
      slug: 'cur',
      category: 'Work',
      tags: ['x'],
    })
    const related = mockPost({
      id: '2',
      slug: 'rel',
      category: 'Work',
      tags: ['y'],
    })
    const other = mockPost({
      id: '3',
      slug: 'oth',
      category: 'Life',
      tags: ['z'],
    })
    const out = getRelatedPosts([current, related, other], current, 1)
    expect(out).toHaveLength(1)
    expect(out[0].slug).toBe('rel')
  })

  it('prefers candidates with stronger tag overlap', () => {
    const current = mockPost({
      id: 'c',
      slug: 'c',
      category: 'Work',
      tags: ['a', 'b'],
      title: 'Topic Foo',
    })
    const weaker = mockPost({
      id: '1',
      slug: 'w',
      category: 'Life',
      tags: ['a'],
      title: 'Other',
    })
    const stronger = mockPost({
      id: '2',
      slug: 's',
      category: 'Life',
      tags: ['a', 'b'],
      title: 'Other two',
    })
    const out = getRelatedPosts([current, weaker, stronger], current, 1)
    expect(out[0].id).toBe('2')
  })
})

describe('scoreRelatedPost', () => {
  it('is zero when category, tags, and title tokens do not connect', () => {
    const a = mockPost({
      id: '1',
      title: 'Alpha Unique',
      tags: ['z'],
      category: 'Life',
    })
    const b = mockPost({
      id: '2',
      title: 'Beta Gamma',
      tags: ['q'],
      category: 'Work',
    })
    expect(scoreRelatedPost(a, b)).toBe(0)
  })

  it('is positive when tags overlap', () => {
    const a = mockPost({ id: '1', title: 'Aa', tags: ['x'], category: 'Life' })
    const b = mockPost({ id: '2', title: 'Bb', tags: ['x', 'y'], category: 'Work' })
    expect(scoreRelatedPost(a, b)).toBeGreaterThan(0)
  })
})

describe('getAllTags', () => {
  it('collects unique lowercase tags from published posts only', () => {
    const posts = [
      mockPost({ id: '1', tags: ['Rust'], status: 'draft' }),
      mockPost({ id: '2', tags: ['Go', 'rust'], status: 'published' }),
    ]
    expect(getAllTags(posts)).toEqual(['go', 'rust'])
  })
})

describe('searchPosts', () => {
  it('matches title excerpt and tags case-insensitively', () => {
    const posts = [
      mockPost({ id: '1', title: 'Hello', excerpt: 'x', tags: [] }),
      mockPost({ id: '2', title: 'Y', excerpt: 'World news', tags: [] }),
      mockPost({ id: '3', title: 'Z', excerpt: 'x', tags: ['Hello'] }),
    ]
    const found = searchPosts(posts, 'hello')
    expect(found.map((p) => p.id).sort()).toEqual(['1', '3'])
  })
})

describe('calculateReadTime', () => {
  it('estimates minutes from word count', () => {
    const words = Array.from({ length: 400 }, () => 'word').join(' ')
    expect(calculateReadTime(words)).toBe(2)
  })
})
