import { describe, expect, it } from 'vitest'
import {
  buildContentCalendar,
  getAdminActionItems,
  getAdminDashboardStats,
  getRecentDrafts,
  getUpcomingPosts,
} from '@/lib/admin-dashboard-insights'
import type { Post } from '@/lib/types'

function post(overrides: Partial<Post>): Post {
  return {
    id: overrides.id ?? 'post-1',
    title: overrides.title ?? 'Test post',
    slug: overrides.slug ?? 'test-post',
    excerpt: overrides.excerpt ?? 'Excerpt',
    content: overrides.content ?? 'Content',
    category: overrides.category ?? 'Life',
    tags: overrides.tags ?? [],
    author: overrides.author ?? { name: 'Admin' },
    publishedAt: overrides.publishedAt ?? '2026-07-11T12:00:00.000Z',
    updatedAt: overrides.updatedAt,
    readTime: overrides.readTime ?? 3,
    status: overrides.status ?? 'draft',
    featuredImage: overrides.featuredImage,
    featuredImageAlt: overrides.featuredImageAlt,
  }
}

describe('admin dashboard insights', () => {
  const now = new Date('2026-07-11T12:00:00.000Z')

  it('calculates publishing health stats', () => {
    const stats = getAdminDashboardStats(
      [
        post({ id: 'published', status: 'published', readTime: 4 }),
        post({ id: 'draft', status: 'draft', updatedAt: '2026-06-20T12:00:00.000Z', readTime: 2 }),
        post({ id: 'scheduled', status: 'scheduled', publishedAt: '2026-07-13T12:00:00.000Z', readTime: 6 }),
        post({ id: 'overdue', status: 'scheduled', publishedAt: '2026-07-10T12:00:00.000Z', readTime: 8 }),
      ],
      now
    )

    expect(stats).toMatchObject({
      total: 4,
      published: 1,
      drafts: 1,
      scheduled: 2,
      overdueScheduled: 1,
      publishingThisWeek: 1,
      staleDrafts: 1,
      averageReadTime: 5,
    })
  })

  it('sorts upcoming posts and recent drafts', () => {
    const posts = [
      post({ id: 'later', title: 'Later', status: 'scheduled', publishedAt: '2026-07-20T12:00:00.000Z' }),
      post({ id: 'soon', title: 'Soon', status: 'scheduled', publishedAt: '2026-07-12T12:00:00.000Z' }),
      post({ id: 'old-draft', title: 'Old draft', status: 'draft', updatedAt: '2026-07-01T12:00:00.000Z' }),
      post({ id: 'new-draft', title: 'New draft', status: 'draft', updatedAt: '2026-07-10T12:00:00.000Z' }),
    ]

    expect(getUpcomingPosts(posts, now).map((p) => p.id)).toEqual(['soon', 'later'])
    expect(getRecentDrafts(posts).map((p) => p.id)).toEqual(['new-draft', 'old-draft'])
  })

  it('builds a 14-day content calendar from post dates', () => {
    const calendar = buildContentCalendar(
      [
        post({ id: 'today', title: 'Today', status: 'published', publishedAt: '2026-07-11T18:00:00.000Z' }),
        post({ id: 'tomorrow', title: 'Tomorrow', status: 'scheduled', publishedAt: '2026-07-12T12:00:00.000Z' }),
      ],
      now,
      2
    )

    expect(calendar).toHaveLength(2)
    expect(calendar[0].isToday).toBe(true)
    expect(calendar[0].posts.map((p) => p.id)).toEqual(['today'])
    expect(calendar[1].posts.map((p) => p.id)).toEqual(['tomorrow'])
  })

  it('summarizes action items', () => {
    const stats = getAdminDashboardStats(
      [post({ id: 'stale', status: 'draft', updatedAt: '2026-06-01T12:00:00.000Z' })],
      now
    )

    expect(getAdminActionItems(stats, 2)).toEqual([
      '2 comments need moderation.',
      'No posts are scheduled. Add at least one future post to keep publishing consistent.',
      '1 draft has not changed in 14+ days.',
    ])
  })
})
