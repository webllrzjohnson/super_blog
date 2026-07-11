import { getRelatedPosts, isPostPubliclyVisible, scoreRelatedPost } from '@/lib/posts'
import type { Post, PostListItem } from '@/lib/types'

export type DraftAssistantAction = 'title' | 'excerpt' | 'tags' | 'intro' | 'tone'

export type InternalLinkSuggestion = {
  title: string
  href: string
  markdown: string
  reason: string
  score: number
}

export type DraftAssistantSuggestion = {
  title?: string
  excerpt?: string
  tags?: string[]
  contentPatch?: string
  notes: string[]
}

function countSharedTags(a: string[] = [], b: string[] = []): number {
  const set = new Set(a.map((tag) => tag.toLowerCase()))
  return b.filter((tag) => set.has(tag.toLowerCase())).length
}

function reasonForRelatedPost(current: Post, candidate: Post | PostListItem): string {
  const reasons: string[] = []
  if (candidate.category === current.category) reasons.push('Same category')

  const sharedTags = countSharedTags(current.tags, candidate.tags)
  if (sharedTags > 0) {
    reasons.push(`${sharedTags} shared tag${sharedTags === 1 ? '' : 's'}`)
  }

  return reasons.length > 0 ? reasons.join(', ') : 'Related title/topic'
}

export function buildInternalLinkSuggestions(
  current: Post,
  posts: Post[],
  limit = 5,
  now: Date = new Date()
): InternalLinkSuggestion[] {
  const existingContent = current.content.toLowerCase()
  const related = getRelatedPosts(current, posts, posts.length, now)

  return related
    .filter((post) => !existingContent.includes(`/blog/${post.slug.toLowerCase()}`))
    .filter((post) => isPostPubliclyVisible(post, now))
    .map((post) => ({
      title: post.title,
      href: `/blog/${post.slug}`,
      markdown: `[${post.title}](/blog/${post.slug})`,
      reason: reasonForRelatedPost(current, post),
      score: scoreRelatedPost(current, post),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function buildDraftAssistantPrompt(action: DraftAssistantAction, post: Post): string {
  const actionLabel: Record<DraftAssistantAction, string> = {
    title: 'Improve the title',
    excerpt: 'Improve the excerpt',
    tags: 'Suggest stronger tags',
    intro: 'Rewrite the opening paragraph',
    tone: 'Review the draft for generic AI tone and suggest fixes',
  }

  return [
    'You are an editorial assistant for a personal blog written by a Toronto building superintendent who also writes about code, AI, running, food, and life.',
    'Do not mention the employer name. Keep the voice first-person, specific, practical, and non-corporate.',
    `Task: ${actionLabel[action]}.`,
    'Return only JSON with any relevant keys: title, excerpt, tags, contentPatch, notes.',
    'Use tags as lowercase strings. Use notes as short editorial notes.',
    '',
    `Title: ${post.title}`,
    `Excerpt: ${post.excerpt}`,
    `Category: ${post.category}`,
    `Tags: ${post.tags.join(', ')}`,
    `Content preview: ${post.content.slice(0, 2400)}`,
  ].join('\n')
}

function extractJsonObject(raw: string): string {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return '{}'
  return raw.slice(start, end + 1)
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function normalizeTags(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const tags = value
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
  return tags.length ? [...new Set(tags)] : undefined
}

function normalizeNotes(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((note): note is string => typeof note === 'string')
    .map((note) => note.trim())
    .filter(Boolean)
}

export function parseDraftAssistantResponse(raw: string): DraftAssistantSuggestion {
  let parsed: unknown = {}
  try {
    parsed = JSON.parse(extractJsonObject(raw))
  } catch {
    parsed = {}
  }

  const record = parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {}

  return {
    title: stringOrUndefined(record.title),
    excerpt: stringOrUndefined(record.excerpt),
    tags: normalizeTags(record.tags),
    contentPatch: stringOrUndefined(record.contentPatch),
    notes: normalizeNotes(record.notes),
  }
}
