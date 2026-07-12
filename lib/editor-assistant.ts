import { getRelatedPosts, isPostPubliclyVisible, scoreRelatedPost } from '@/lib/posts'
import type { Post, PostListItem } from '@/lib/types'

export type DraftAssistantAction =
  | 'title'
  | 'excerpt'
  | 'tags'
  | 'intro'
  | 'tone'
  | 'grammar'
  | 'humanize'
  | 'promotion'

export type InternalLinkSuggestion = {
  title: string
  href: string
  markdown: string
  reason: string
  score: number
}

export type PromotionCopy = {
  telegram?: string
  social?: string
  newsletter?: string
  hashtags?: string[]
}

export type DraftAssistantSuggestion = {
  title?: string
  excerpt?: string
  tags?: string[]
  contentPatch?: string
  promotionCopy?: PromotionCopy
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
    grammar: 'Fix grammar and spelling without changing the author voice',
    humanize: 'Humanize the draft and remove AI-sounding phrasing',
    promotion: 'Generate preview-only promotion copy for this post',
  }

  const extraGuidance: Partial<Record<DraftAssistantAction, string[]>> = {
    grammar: [
      'Preserve meaning, markdown structure, and first-person details.',
      'Return the corrected full body in contentPatch. Do not rewrite for style beyond grammar, spelling, punctuation, and clarity.',
    ],
    humanize: [
      'Remove em dash characters, duplicate opening markdown H1s, generic SEO phrases, and formulaic closers.',
      'Avoid AI phrases like "here is what", "more than you think", "actually matters", "makes all the difference", "in today\'s world", "underscores", "crucial", "delve", and "seamless".',
      'Vary sentence rhythm, keep concrete people/field details, and keep the author sounding like a real superintendent, not a corporate article.',
      'Return the humanized full body in contentPatch. Use ## headings only and keep useful markdown structure.',
    ],
    promotion: [
      'Return promotionCopy with telegram, social, newsletter, and hashtags.',
      'Do not auto-post anywhere. Write copy the admin can review and copy manually.',
      'Keep the tone personal, concrete, and non-corporate. Do not mention the employer name.',
      'Telegram should include the post URL. Social should be short. Newsletter should be a 2-3 sentence teaser.',
    ],
  }

  const postUrl = `https://www.maplehub.cloud/blog/${post.slug}`

  return [
    'You are an editorial assistant for a personal blog written by a Toronto building superintendent who also writes about code, AI, running, food, and life.',
    'Do not mention the employer name. Keep the voice first-person, specific, practical, and non-corporate.',
    'House style: no em dash characters, no opening markdown H1, no generic AI/SEO phrasing, no Conclusion/Final Thoughts/Practical Takeaway headings.',
    `Task: ${actionLabel[action]}.`,
    ...(extraGuidance[action] ?? []),
    'Return only JSON with any relevant keys: title, excerpt, tags, contentPatch, notes.',
    'Use tags as lowercase strings. Use notes as short editorial notes.',
    '',
    `Title: ${post.title}`,
    `Excerpt: ${post.excerpt}`,
    `Category: ${post.category}`,
    `Tags: ${post.tags.join(', ')}`,
    `Post URL: ${postUrl}`,
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

function normalizeHashtags(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const hashtags = value
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => `#${tag.replace(/^#/, '').replace(/\s+/g, '')}`)
  return hashtags.length ? [...new Set(hashtags)] : undefined
}

function normalizePromotionCopy(value: unknown): PromotionCopy | undefined {
  if (!value || typeof value !== 'object') return undefined
  const record = value as Record<string, unknown>
  const promotionCopy: PromotionCopy = {
    telegram: stringOrUndefined(record.telegram),
    social: stringOrUndefined(record.social),
    newsletter: stringOrUndefined(record.newsletter),
    hashtags: normalizeHashtags(record.hashtags),
  }

  return Object.values(promotionCopy).some(Boolean) ? promotionCopy : undefined
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
    promotionCopy: normalizePromotionCopy(record.promotionCopy),
    notes: normalizeNotes(record.notes),
  }
}
