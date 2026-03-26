import type { Post } from '@/lib/types'

/** Minimum body length (characters) before publish/schedule is allowed. */
export const MIN_PUBLISH_CONTENT_LENGTH = 80

/** Excerpt length below this triggers a warning only. */
export const RECOMMENDED_EXCERPT_LENGTH = 80

export interface PublishChecklistResult {
  errors: string[]
  warnings: string[]
}

export function contentMayContainAffiliateLinks(content: string): boolean {
  const c = content.toLowerCase()
  if (/\bamazon\.[a-z.]{2,}\//i.test(content)) return true
  if (/\bamzn\.to\//i.test(content)) return true
  if (/\([^)]*amazon\.[^)]+\)/i.test(content)) return true
  if (c.includes('affiliate link') || c.includes('affiliate links')) return true
  if (c.includes('sponsored by') || c.includes('#ad')) return true
  return false
}

/**
 * Validates content before publish or schedule. Draft saves skip this.
 */
export function evaluatePublishChecklist(post: Post): PublishChecklistResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!post.title.trim()) errors.push('Title is required.')
  if (!post.slug.trim()) errors.push('Slug is required.')
  if (!post.excerpt.trim()) errors.push('Excerpt is required for listings and social previews.')
  const content = post.content.trim()
  if (!content) errors.push('Content cannot be empty.')
  else if (content.length < MIN_PUBLISH_CONTENT_LENGTH) {
    errors.push(
      `Content should be at least ${MIN_PUBLISH_CONTENT_LENGTH} characters before going live.`
    )
  }

  const excerpt = post.excerpt.trim()
  if (excerpt.length > 0 && excerpt.length < RECOMMENDED_EXCERPT_LENGTH) {
    warnings.push(
      `Excerpt is under ${RECOMMENDED_EXCERPT_LENGTH} characters — a longer summary helps SEO and previews.`
    )
  }

  if (post.tags.length === 0) {
    warnings.push('No tags — add tags to improve discovery and related posts.')
  }

  if (post.featuredImage?.trim() && !post.featuredImageAlt?.trim()) {
    warnings.push('Featured image is set but alt text is empty — add a short description.')
  }

  if (contentMayContainAffiliateLinks(post.content)) {
    warnings.push(
      'Body may reference affiliate or sponsored content — confirm disclaimer/disclosure is appropriate.'
    )
  }

  return { errors, warnings }
}
