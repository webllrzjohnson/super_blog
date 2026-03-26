import type { Post } from '@/lib/types'

/** Minimum body length (characters) before publish/schedule is allowed. */
export const MIN_PUBLISH_CONTENT_LENGTH = 80

/** Excerpt length below this triggers a warning only. */
export const RECOMMENDED_EXCERPT_LENGTH = 80

/** Title shorter than this triggers a warning (SEO / clarity). */
export const RECOMMENDED_TITLE_LENGTH = 12

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
 * Counts markdown images with empty or whitespace-only alt: `![](url)` — usually an a11y gap
 * unless the image is purely decorative (then empty alt is intentional).
 */
export function countMarkdownImagesWithEmptyAlt(content: string): number {
  const re = /!\[([^\]]*)\]\([^)]+\)/g
  let n = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    if (!m[1].trim()) n += 1
  }
  return n
}

/**
 * Validates content before publish or schedule. Draft saves skip this.
 */
export function evaluatePublishChecklist(post: Post): PublishChecklistResult {
  const errors: string[] = []
  const warnings: string[] = []

  const title = post.title.trim()
  if (!title) errors.push('Title is required.')
  else if (title.length < RECOMMENDED_TITLE_LENGTH) {
    warnings.push(
      `Title is under ${RECOMMENDED_TITLE_LENGTH} characters — longer titles often help clarity and search results.`
    )
  }
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
    errors.push(
      'Featured image requires alt text — add a short description for accessibility and SEO.'
    )
  }

  if (contentMayContainAffiliateLinks(post.content)) {
    warnings.push(
      'Body may reference affiliate or sponsored content — confirm disclaimer/disclosure is appropriate.'
    )
  }

  const emptyImgAlts = countMarkdownImagesWithEmptyAlt(post.content)
  if (emptyImgAlts > 0) {
    warnings.push(
      `${emptyImgAlts} markdown image(s) have empty alt text. Add a short description for meaningful images; use empty alt only when decorative.`
    )
  }

  return { errors, warnings }
}
