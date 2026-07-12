import type { GeneratedPostMeta } from '@/lib/parse-ai-post-response'

export const MIN_GENERATED_WORDS = 500
export const RECOMMENDED_GENERATED_WORDS = 800

const AI_DISCLAIMER_PATTERNS = [
  /\bas an ai\b/i,
  /\bas a language model\b/i,
  /\bi cannot provide\b/i,
]

const GENERIC_PHRASES = [
  'in today\'s world',
  'when it comes to',
  'it is important to note',
  'it is worth mentioning',
  'in conclusion',
  'final thoughts',
  'practical takeaway',
  'the takeaway',
  'everything you need to know',
  'here\'s what',
  'here is what',
  'step-by-step guide',
  'more than you think',
  'actually matters',
  'makes all the difference',
  'not just',
  'more than just',
  'it\'s about',
  'ensure',
  'utilize',
  'leverage',
  'delve',
  'crucial',
  'pivotal',
  'underscores',
  'highlights',
  'showcases',
  'enhances',
  'fosters',
  'landscape',
  'seamlessly',
]

const PUBLIC_ORG_PATTERNS = [
  /\bTCHC\b/i,
  /\bToronto Community Housing\b/i,
]

export type GeneratedPostQualityResult = {
  errors: string[]
  warnings: string[]
  wordCount: number
}

function countWords(content: string): number {
  const words = content.match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)?/g)
  return words?.length ?? 0
}

function countMarkdownHeadings(content: string): number {
  return content.split('\n').filter((line) => /^#{2,3}\s+\S/.test(line.trim())).length
}

function hasOpeningMarkdownH1(content: string): boolean {
  return /^\s*#\s+\S/.test(content)
}

export function evaluateGeneratedPostQuality(
  meta: GeneratedPostMeta,
  content: string
): GeneratedPostQualityResult {
  const errors: string[] = []
  const warnings: string[] = []
  const title = meta.title.trim()
  const excerpt = meta.excerpt.trim()
  const body = content.trim()
  const fullText = `${title}\n${excerpt}\n${body}`
  const lowerFullText = fullText.toLowerCase()
  const wordCount = countWords(body)

  if (title.length < 18) warnings.push('Title is short. Make it more specific before publishing.')
  if (excerpt.length < 90) warnings.push('Excerpt is short. Add a clearer 2-3 sentence summary.')

  if (wordCount < MIN_GENERATED_WORDS) {
    errors.push(`Generated content is too thin (${wordCount} words). Minimum is ${MIN_GENERATED_WORDS}.`)
  } else if (wordCount < RECOMMENDED_GENERATED_WORDS) {
    warnings.push(`Generated content is ${wordCount} words. Aim for ${RECOMMENDED_GENERATED_WORDS}+ before publishing.`)
  }

  if (AI_DISCLAIMER_PATTERNS.some((pattern) => pattern.test(body))) {
    errors.push('Generated content contains an AI disclaimer. Regenerate or edit it out.')
  }

  if (PUBLIC_ORG_PATTERNS.some((pattern) => pattern.test(body) || pattern.test(title) || pattern.test(excerpt))) {
    errors.push('Generated content names the employer/public housing organization. Remove that before publishing.')
  }

  if (fullText.includes('—')) {
    errors.push('Generated content contains em dashes. Replace them with commas, periods, or parentheses.')
  }

  if (hasOpeningMarkdownH1(body)) {
    errors.push('Generated content starts with a markdown H1. Remove it because the page title is rendered separately.')
  }

  const genericHits = GENERIC_PHRASES.filter((phrase) => lowerFullText.includes(phrase))
  if (genericHits.length > 0) {
    warnings.push(`Generated content includes generic AI-sounding phrasing: ${genericHits.slice(0, 3).join(', ')}.`)
  }

  if (!/\b(I|I've|I'm|my|we|our)\b/.test(body)) {
    warnings.push('Generated content lacks first-person field experience. Add lived-in details before publishing.')
  }

  if (!/\btenant|resident|custodian|maintenance guy|staff|contractor|vendor\b/i.test(body)) {
    warnings.push('Generated content does not include people around the situation. Add tenants, staff, or vendor context.')
  }

  if (countMarkdownHeadings(body) < 2) {
    warnings.push('Generated content has fewer than two section headings. Add structure for readability.')
  }

  return { errors, warnings, wordCount }
}
