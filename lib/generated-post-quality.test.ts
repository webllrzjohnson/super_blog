import { describe, expect, it } from 'vitest'
import { evaluateGeneratedPostQuality, MIN_GENERATED_WORDS } from '@/lib/generated-post-quality'
import type { GeneratedPostMeta } from '@/lib/parse-ai-post-response'

const meta: GeneratedPostMeta = {
  title: 'When the compactor jam tells you more than the alarm panel',
  slug: 'compactor-jam-alarm-panel',
  excerpt:
    'A practical look at what happens when a garbage compactor stops mid-shift and the first clue is not the alarm panel.',
  category: 'Work',
  tags: ['maintenance', 'operations'],
}

function longContent(extra = ''): string {
  const paragraph =
    "## This morning\n\nI was already in the garbage room when one tenant stopped at the door and asked why the compactor sounded different. My maintenance guy had noticed it too, so we treated it like a pattern instead of a one-off noise. We checked the chute, watched one cycle, talked through what changed from yesterday, and wrote down the pieces that did not fit yet. Our custodian kept the room clear while I called the vendor and kept residents moving. It was not dramatic, but it was the kind of small operational problem that can turn ugly if nobody owns it.\n\n## What I tried\n\n"
  return `${paragraph}${Array.from({ length: 45 }, (_, index) => `I checked step ${index + 1} against what we normally see, then compared it with what staff and tenants were reporting.`).join(' ')} ${extra}`
}

describe('evaluateGeneratedPostQuality', () => {
  it('blocks thin generated posts', () => {
    const result = evaluateGeneratedPostQuality(meta, '## Short\n\nToo short.')

    expect(result.wordCount).toBeLessThan(MIN_GENERATED_WORDS)
    expect(result.errors.some((error) => error.includes('too thin'))).toBe(true)
  })

  it('blocks AI disclaimers', () => {
    const result = evaluateGeneratedPostQuality(meta, `${longContent()} As an AI language model, I cannot provide real experience.`)

    expect(result.errors.some((error) => error.includes('AI disclaimer'))).toBe(true)
  })

  it('blocks public employer naming', () => {
    const result = evaluateGeneratedPostQuality(meta, `${longContent()} Toronto Community Housing was named in this draft.`)

    expect(result.errors.some((error) => error.includes('employer'))).toBe(true)
  })

  it('blocks em dashes before save', () => {
    const result = evaluateGeneratedPostQuality(
      meta,
      `${longContent()} The room was quiet — too quiet.`
    )

    expect(result.errors.some((error) => error.includes('em dashes'))).toBe(true)
  })

  it('blocks duplicate opening markdown H1s before save', () => {
    const result = evaluateGeneratedPostQuality(
      meta,
      `# ${meta.title}\n\n${longContent()}`
    )

    expect(result.errors.some((error) => error.includes('markdown H1'))).toBe(true)
  })

  it('warns on AI-ish style markers in title, excerpt, or body', () => {
    const result = evaluateGeneratedPostQuality(
      {
        ...meta,
        title: 'Why Compactor Rooms Matter More Than You Think',
        excerpt: 'Here is what a jam actually matters for in daily building operations.',
      },
      `${longContent()} In conclusion, it is important to note that teams should ensure the process is seamless.`
    )

    expect(result.errors).toHaveLength(0)
    expect(result.warnings.some((warning) => warning.includes('generic'))).toBe(true)
  })
})
