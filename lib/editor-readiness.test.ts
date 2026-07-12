import { describe, expect, it } from 'vitest'
import { evaluateEditorReadiness } from '@/lib/editor-readiness'
import type { Post } from '@/lib/types'

function post(overrides: Partial<Post> = {}): Post {
  return {
    id: overrides.id ?? 'post-1',
    title: overrides.title ?? 'Sump Pump Down on a Friday Afternoon',
    slug: overrides.slug ?? 'sump-pump-down-on-a-friday-afternoon',
    excerpt:
      overrides.excerpt ?? 'What a Friday pump alarm taught me about timing, calm, and building operations.',
    content:
      overrides.content ??
      'A full draft with practical field notes.\n\nRelated: [another post](/blog/another-post).',
    category: overrides.category ?? 'Work',
    tags: overrides.tags ?? ['building operations', 'sump pump'],
    featuredImage: overrides.featuredImage ?? '/uploads/pump.webp',
    featuredImageAlt: overrides.featuredImageAlt ?? 'Sump pump equipment in a building mechanical room',
    author: overrides.author ?? { name: 'Admin' },
    publishedAt: overrides.publishedAt ?? '2026-07-12T12:00:00.000Z',
    updatedAt: overrides.updatedAt,
    readTime: overrides.readTime ?? 5,
    status: overrides.status ?? 'draft',
  }
}

describe('evaluateEditorReadiness', () => {
  it('marks a finished post as ready when session workflow actions are complete', () => {
    const result = evaluateEditorReadiness(post(), {
      grammarChecked: true,
      humanized: true,
      promotionCopyGenerated: true,
    })

    expect(result.ready).toBe(true)
    expect(result.completedCount).toBe(result.totalCount)
    expect(result.items.every((item) => item.status === 'complete')).toBe(true)
  })

  it('reports missing workflow actions separately from content-derived checks', () => {
    const result = evaluateEditorReadiness(post(), {
      grammarChecked: false,
      humanized: false,
      promotionCopyGenerated: false,
    })

    expect(result.ready).toBe(false)
    expect(result.missingLabels).toEqual([
      'Grammar checked',
      'Humanize pass completed',
      'Promotion copy generated',
    ])
  })

  it('flags missing content requirements using the current draft state', () => {
    const result = evaluateEditorReadiness(
      post({
        excerpt: '',
        tags: [],
        featuredImage: '/uploads/pump.webp',
        featuredImageAlt: '',
        content: `${'A draft paragraph with enough substance for the editor readiness panel. '.repeat(4)}No internal blog links yet.`, 
      }),
      {
        grammarChecked: true,
        humanized: true,
        promotionCopyGenerated: true,
      }
    )

    expect(result.ready).toBe(false)
    expect(result.missingLabels).toEqual([
      'Excerpt written',
      'Tags added',
      'Featured image alt text added',
      'Internal link added',
    ])
  })

  it('treats placeholder featured image alt text as missing', () => {
    const result = evaluateEditorReadiness(
      post({ featuredImageAlt: 'Describe this image' }),
      {
        grammarChecked: true,
        humanized: true,
        promotionCopyGenerated: true,
      }
    )

    expect(result.missingLabels).toContain('Featured image alt text added')
  })
})
