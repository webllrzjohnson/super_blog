import { describe, expect, it } from 'vitest'
import type { Post } from '@/lib/types'
import {
  contentMayContainAffiliateLinks,
  evaluatePublishChecklist,
  MIN_PUBLISH_CONTENT_LENGTH,
} from '@/lib/editorial-checklist'
import { defaultAuthor } from '@/lib/posts'

function basePost(overrides: Partial<Post>): Post {
  return {
    id: '1',
    title: 'Title',
    slug: 'slug',
    excerpt: 'A reasonable excerpt for the post that is long enough to avoid warnings.',
    content: 'x'.repeat(MIN_PUBLISH_CONTENT_LENGTH),
    category: 'Life',
    tags: ['one'],
    author: defaultAuthor,
    publishedAt: '2026-01-01',
    readTime: 2,
    status: 'draft',
    ...overrides,
  }
}

describe('evaluatePublishChecklist', () => {
  it('returns errors for empty title', () => {
    const r = evaluatePublishChecklist(basePost({ title: '' }))
    expect(r.errors.some((e) => e.includes('Title'))).toBe(true)
  })

  it('returns error when body is too short', () => {
    const r = evaluatePublishChecklist(basePost({ content: 'short' }))
    expect(r.errors.some((e) => e.includes(`${MIN_PUBLISH_CONTENT_LENGTH}`))).toBe(true)
  })

  it('warns when excerpt is short', () => {
    const r = evaluatePublishChecklist(basePost({ excerpt: 'tiny' }))
    expect(r.warnings.some((w) => w.toLowerCase().includes('excerpt'))).toBe(true)
  })

  it('warns when featured image has no alt', () => {
    const r = evaluatePublishChecklist(
      basePost({ featuredImage: '/img.jpg', featuredImageAlt: '' })
    )
    expect(r.warnings.some((w) => w.toLowerCase().includes('alt'))).toBe(true)
  })

  it('warns when tags are empty', () => {
    const r = evaluatePublishChecklist(basePost({ tags: [] }))
    expect(r.warnings.some((w) => w.toLowerCase().includes('tag'))).toBe(true)
  })
})

describe('contentMayContainAffiliateLinks', () => {
  it('detects amazon URLs', () => {
    expect(contentMayContainAffiliateLinks('See https://amazon.com/dp/foo')).toBe(true)
    expect(contentMayContainAffiliateLinks('[buy](https://amzn.to/abc)')).toBe(true)
  })

  it('returns false for plain prose', () => {
    expect(contentMayContainAffiliateLinks('Just thoughts about nature and code.')).toBe(
      false
    )
  })
})
