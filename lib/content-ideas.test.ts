import { describe, expect, it } from 'vitest'
import {
  buildIdeaGenerationSeed,
  getContentIdeaStats,
  normalizeContentIdeaInput,
  sortContentIdeas,
} from '@/lib/content-ideas'
import type { ContentIdea } from '@/lib/content-ideas'

function idea(overrides: Partial<ContentIdea>): ContentIdea {
  return {
    id: overrides.id ?? 'idea-1',
    title: overrides.title ?? 'Elevator outage communication lesson',
    notes: overrides.notes ?? 'What happened, what I sent, what I learned.',
    category: overrides.category ?? 'Work',
    priority: overrides.priority ?? 'medium',
    status: overrides.status ?? 'idea',
    targetPublishAt: overrides.targetPublishAt,
    generatedPostId: overrides.generatedPostId,
    createdAt: overrides.createdAt ?? '2026-07-01T12:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-07-01T12:00:00.000Z',
    archivedAt: overrides.archivedAt,
  }
}

describe('content ideas helpers', () => {
  it('normalizes create/update input with safe defaults', () => {
    expect(normalizeContentIdeaInput({ title: '  Hallway scooter issue  ' })).toEqual({
      title: 'Hallway scooter issue',
      notes: '',
      category: 'Work',
      priority: 'medium',
      status: 'idea',
      targetPublishAt: null,
    })
  })

  it('calculates idea board stats without counting archived as open', () => {
    const stats = getContentIdeaStats([
      idea({ id: 'a', status: 'idea' }),
      idea({ id: 'b', status: 'planned', priority: 'high' }),
      idea({ id: 'c', status: 'generated' }),
      idea({ id: 'd', status: 'published' }),
      idea({ id: 'e', status: 'archived', archivedAt: '2026-07-02T12:00:00.000Z' }),
    ])

    expect(stats).toEqual({
      total: 5,
      open: 3,
      idea: 1,
      planned: 1,
      generated: 1,
      published: 1,
      archived: 1,
      highPriorityOpen: 1,
    })
  })

  it('sorts open ideas before archived and high priority first', () => {
    const sorted = sortContentIdeas([
      idea({ id: 'archived', status: 'archived', priority: 'high', updatedAt: '2026-07-10T12:00:00.000Z' }),
      idea({ id: 'medium', priority: 'medium', updatedAt: '2026-07-11T12:00:00.000Z' }),
      idea({ id: 'high', priority: 'high', updatedAt: '2026-07-01T12:00:00.000Z' }),
    ])

    expect(sorted.map((item) => item.id)).toEqual(['high', 'medium', 'archived'])
  })

  it('builds an AI generation seed from an idea', () => {
    expect(buildIdeaGenerationSeed(idea({
      title: 'Basement flooding morning routine',
      notes: 'Rain, old townhomes, paperwork, technician follow-up.',
      category: 'Work',
      targetPublishAt: '2026-07-20T12:00:00.000Z',
    }))).toEqual({
      topic: 'Basement flooding morning routine',
      context: 'Rain, old townhomes, paperwork, technician follow-up.\n\nCategory: Work\nTarget publish date: Jul 20, 2026',
      schedule: 'Immediate',
    })
  })
})
