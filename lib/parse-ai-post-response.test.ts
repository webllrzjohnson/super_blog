import { describe, expect, it } from 'vitest'
import {
  normalizeGeneratedPostMeta,
  normalizeTags,
  parseAiPostResponse,
  resolvePostStatus,
  sanitizeSlug,
} from '@/lib/parse-ai-post-response'

const sampleRaw = `---JSON---
{
  "title": "When the compactor stops mid-shift",
  "slug": "compactor-stops-mid-shift",
  "excerpt": "The garbage room went quiet at the worst time.",
  "category": "Work",
  "tags": "maintenance, garbage room, tenants"
}
---CONTENT---
## This morning

The compactor died again.

---END---`

describe('parseAiPostResponse', () => {
  it('parses JSON and content blocks', () => {
    const parsed = parseAiPostResponse(sampleRaw)
    expect(parsed.meta.title).toContain('compactor')
    expect(parsed.content).toContain('This morning')
  })

  it('throws when JSON block is missing', () => {
    expect(() => parseAiPostResponse('no blocks here')).toThrow(/JSON/)
  })
})

describe('normalizeGeneratedPostMeta', () => {
  it('coerces string tags into an array', () => {
    const normalized = normalizeGeneratedPostMeta({
      title: 'Title',
      slug: 'title',
      excerpt: 'Excerpt',
      category: 'Work',
      tags: 'one, two',
    }) as { tags: string[] }

    expect(normalized.tags).toEqual(['one', 'two'])
  })

  it('defaults invalid categories to Life', () => {
    const normalized = normalizeGeneratedPostMeta({
      title: 'Title',
      slug: 'title',
      excerpt: 'Excerpt',
      category: 'Invalid',
      tags: 'one',
    }) as { category: string }

    expect(normalized.category).toBe('Life')
  })
})

describe('sanitizeSlug', () => {
  it('lowercases and strips invalid characters', () => {
    expect(sanitizeSlug(' Hello World! ')).toBe('hello-world')
  })
})

describe('normalizeTags', () => {
  it('splits comma-separated tags', () => {
    expect(normalizeTags('a, b, c')).toEqual(['a', 'b', 'c'])
  })
})

describe('resolvePostStatus', () => {
  it('publishes immediately by default', () => {
    const result = resolvePostStatus('Immediate')
    expect(result.status).toBe('published')
  })

  it('schedules valid future dates', () => {
    const future = new Date(Date.now() + 86_400_000).toISOString()
    const result = resolvePostStatus(future)
    expect(result.status).toBe('scheduled')
    expect(result.publishedAt).toBe(future)
  })

  it('treats Daily/Weekly/Monthly like immediate publish', () => {
    expect(resolvePostStatus('Daily').status).toBe('published')
    expect(resolvePostStatus('Weekly').status).toBe('published')
  })
})
