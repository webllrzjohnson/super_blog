import type { Post } from '@/lib/types'

export type ContentQualitySeverity = 'blocker' | 'warning' | 'suggestion'

export interface ContentQualityAudit {
  post: Post
  score: number
  blockers: string[]
  warnings: string[]
  suggestions: string[]
}

export interface ContentQualityStats {
  total: number
  healthy: number
  needsWork: number
  blockers: number
  averageScore: number
}

const MIN_EXCERPT_LENGTH = 70
const MIN_BODY_WORDS = 250
const STALE_PUBLISHED_DAYS = 180

function countWords(content: string): number {
  return content.match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)?/g)?.length ?? 0
}

function hasInternalLink(content: string): boolean {
  return /\]\(\/blog\/[a-z0-9-]+\)/i.test(content) || /href=["']\/blog\//i.test(content)
}

function hasEmptyMarkdownImageAlt(content: string): boolean {
  return /!\[\s*\]\([^)]+\)/.test(content)
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24))
}

export function auditContentQuality(post: Post, now = new Date()): ContentQualityAudit {
  const blockers: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  const title = post.title.trim()
  const excerpt = post.excerpt.trim()
  const content = post.content.trim()

  if (!title) blockers.push('Title is missing.')
  if (!post.slug.trim()) blockers.push('Slug is missing.')
  if (!excerpt) blockers.push('Excerpt is missing.')
  else if (excerpt.length < MIN_EXCERPT_LENGTH) {
    warnings.push('Excerpt is short; expand it for search and social previews.')
  }

  if (post.featuredImage?.trim() && !post.featuredImageAlt?.trim()) {
    blockers.push('Featured image is missing alt text.')
  }

  if (hasEmptyMarkdownImageAlt(content)) {
    warnings.push('One or more inline markdown images have empty alt text.')
  }

  if (post.tags.length === 0) warnings.push('No tags are set.')
  if (!hasInternalLink(content)) suggestions.push('Add at least one internal link to a related post.')
  if (countWords(content) < MIN_BODY_WORDS && post.readTime <= 1) {
    suggestions.push('Post is thin; expand it with more detail before promoting it.')
  }

  const lastTouched = new Date(post.updatedAt || post.publishedAt)
  if (
    post.status === 'published' &&
    !Number.isNaN(lastTouched.getTime()) &&
    daysBetween(now, lastTouched) > STALE_PUBLISHED_DAYS
  ) {
    suggestions.push('Published post is over 180 days old; review for freshness.')
  }

  const penalty = blockers.length * 25 + warnings.length * 10 + suggestions.length * 5
  const score = Math.max(0, 100 - penalty)

  return { post, score, blockers, warnings, suggestions }
}

export function getContentQualityStats(audits: ContentQualityAudit[]): ContentQualityStats {
  const total = audits.length
  const healthy = audits.filter((audit) => audit.score >= 90 && audit.blockers.length === 0).length
  const blockers = audits.filter((audit) => audit.blockers.length > 0).length
  const averageScore = total
    ? Math.round(audits.reduce((sum, audit) => sum + audit.score, 0) / total)
    : 0

  return {
    total,
    healthy,
    needsWork: total - healthy,
    blockers,
    averageScore,
  }
}

export function getPostsNeedingAttention(
  audits: ContentQualityAudit[],
  limit = 8
): ContentQualityAudit[] {
  return [...audits]
    .filter((audit) => audit.score < 90 || audit.blockers.length > 0)
    .sort((a, b) => {
      const blockerDelta = b.blockers.length - a.blockers.length
      if (blockerDelta !== 0) return blockerDelta
      return a.score - b.score
    })
    .slice(0, limit)
}
