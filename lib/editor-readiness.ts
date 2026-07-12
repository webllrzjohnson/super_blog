import type { Post } from '@/lib/types'

export type EditorReadinessStatus = 'complete' | 'missing'

export type EditorWorkflowState = {
  grammarChecked?: boolean
  humanized?: boolean
  promotionCopyGenerated?: boolean
}

export type EditorReadinessItem = {
  id: string
  label: string
  status: EditorReadinessStatus
  detail: string
}

export type EditorReadinessResult = {
  ready: boolean
  completedCount: number
  totalCount: number
  missingLabels: string[]
  items: EditorReadinessItem[]
}

function hasInternalBlogLink(content: string): boolean {
  return /\]\(\/blog\/[^)]+\)/i.test(content) || /https?:\/\/www\.maplehub\.cloud\/blog\//i.test(content)
}

function item(id: string, label: string, complete: boolean, detail: string): EditorReadinessItem {
  return {
    id,
    label,
    status: complete ? 'complete' : 'missing',
    detail,
  }
}

export function evaluateEditorReadiness(
  post: Post,
  workflow: EditorWorkflowState = {}
): EditorReadinessResult {
  const title = post.title.trim()
  const excerpt = post.excerpt.trim()
  const content = post.content.trim()
  const hasFeaturedImage = Boolean(post.featuredImage?.trim())
  const hasFeaturedAlt = !hasFeaturedImage || Boolean(post.featuredImageAlt?.trim())

  const items: EditorReadinessItem[] = [
    item('title', 'Title written', Boolean(title), 'Add a clear working title.'),
    item('excerpt', 'Excerpt written', Boolean(excerpt), 'Add a short summary for listings and sharing.'),
    item('content', 'Body draft written', content.length >= 80, 'Write enough body content before publishing.'),
    item('tags', 'Tags added', post.tags.length > 0, 'Add tags for discovery and related posts.'),
    item(
      'featured-image-alt',
      'Featured image alt text added',
      hasFeaturedAlt,
      'Add alt text when a featured image is set.'
    ),
    item(
      'internal-link',
      'Internal link added',
      hasInternalBlogLink(content),
      'Link to at least one related blog post when possible.'
    ),
    item(
      'grammar',
      'Grammar checked',
      Boolean(workflow.grammarChecked),
      'Run Fix grammar in this editor session.'
    ),
    item(
      'humanize',
      'Humanize pass completed',
      Boolean(workflow.humanized),
      'Run Humanize draft in this editor session.'
    ),
    item(
      'promotion',
      'Promotion copy generated',
      Boolean(workflow.promotionCopyGenerated),
      'Generate promotion copy before or after publishing.'
    ),
  ]

  const completedCount = items.filter((readinessItem) => readinessItem.status === 'complete').length
  const missingLabels = items
    .filter((readinessItem) => readinessItem.status === 'missing')
    .map((readinessItem) => readinessItem.label)

  return {
    ready: missingLabels.length === 0,
    completedCount,
    totalCount: items.length,
    missingLabels,
    items,
  }
}
