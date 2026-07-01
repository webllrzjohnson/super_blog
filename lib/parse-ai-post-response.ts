import { z } from 'zod'

const POST_CATEGORIES = ['Life', 'Work', 'Hobbies', 'Experience'] as const

export const GeneratedPostMetaSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().min(1),
  category: z.enum(POST_CATEGORIES),
  tags: z.union([z.string(), z.array(z.string())]),
})

export type GeneratedPostMeta = z.infer<typeof GeneratedPostMetaSchema>

export type ParsedAiPostResponse = {
  meta: GeneratedPostMeta
  content: string
}

export function parseAiPostResponse(raw: string): ParsedAiPostResponse {
  const jsonMatch = raw.match(/---\s*JSON---[\r\n]+([\s\S]*?)[\r\n]+---CONTENT---/)
  if (!jsonMatch) {
    throw new Error('Missing ---JSON--- block in AI response')
  }

  let contentMatch = raw.match(/---\s*CONTENT---[\r\n]+([\s\S]*?)[\r\n]+---\s*END---/)
  if (!contentMatch) {
    contentMatch = raw.match(/---\s*CONTENT---[\r\n]+([\s\S]*)/)
  }
  if (!contentMatch) {
    throw new Error('Missing ---CONTENT--- block in AI response')
  }

  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(jsonMatch[1].trim())
  } catch (err) {
    throw new Error(
      `Invalid JSON block in AI response: ${err instanceof Error ? err.message : 'parse error'}`
    )
  }

  const result = GeneratedPostMetaSchema.safeParse(normalizeGeneratedPostMeta(parsedJson))
  if (!result.success) {
    throw new Error('AI response metadata did not match the expected post format')
  }

  return {
    meta: result.data,
    content: contentMatch[1].trim(),
  }
}

export function normalizeGeneratedPostMeta(input: unknown): unknown {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return input
  }

  const obj = { ...(input as Record<string, unknown>) }

  if (typeof obj.tags === 'string') {
    obj.tags = obj.tags
      .replace(/^\{|\}$/g, '')
      .split(',')
      .map((t) => t.trim().replace(/^"|"$/g, ''))
      .filter(Boolean)
  }

  if (typeof obj.category === 'string') {
    const trimmed = obj.category.trim()
    if (!POST_CATEGORIES.includes(trimmed as (typeof POST_CATEGORIES)[number])) {
      obj.category = 'Life'
    }
  }

  for (const key of ['title', 'slug', 'excerpt'] as const) {
    if (typeof obj[key] !== 'string' && obj[key] != null) {
      obj[key] = String(obj[key])
    }
  }

  return obj
}

export function normalizeTags(tags: string | string[]): string[] {
  if (Array.isArray(tags)) {
    return tags.map((t) => String(t).trim()).filter(Boolean)
  }
  return tags
    .split(',')
    .map((t) => t.trim().replace(/^"|"$/g, ''))
    .filter(Boolean)
}

export function sanitizeSlug(slug: string): string {
  return String(slug || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function resolvePostStatus(schedule: string): {
  status: 'draft' | 'scheduled' | 'published'
  publishedAt: string
} {
  const trimmed = String(schedule || 'Immediate').trim()
  const now = new Date()

  if (trimmed.toLowerCase() === 'immediate') {
    return { status: 'published', publishedAt: now.toISOString() }
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime()) && parsed.getTime() > now.getTime()) {
    return { status: 'scheduled', publishedAt: parsed.toISOString() }
  }

  return { status: 'published', publishedAt: now.toISOString() }
}
