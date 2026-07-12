import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CLAUDE_SYSTEM_PROMPT,
  DEFAULT_GROQ_SYSTEM_PROMPT,
  DEFAULT_USER_MESSAGE_TEMPLATE,
  buildUserMessage,
} from '@/lib/generate-post-prompts'

describe('generate post prompts', () => {
  it('keeps the default system prompts concise while preserving house style', () => {
    expect(DEFAULT_CLAUDE_SYSTEM_PROMPT.length).toBeLessThan(5_000)
    expect(DEFAULT_GROQ_SYSTEM_PROMPT.length).toBeLessThan(1_600)

    for (const prompt of [DEFAULT_CLAUDE_SYSTEM_PROMPT, DEFAULT_GROQ_SYSTEM_PROMPT]) {
      expect(prompt.toLowerCase()).toContain('em dash')
      expect(prompt.toLowerCase()).toContain('# h1')
      expect(prompt.toLowerCase()).toContain('employer')
      expect(prompt).toContain('tenant')
      expect(prompt).toContain('maintenance')
      expect(prompt).not.toContain('—')
    }
  })

  it('keeps the user template compact and explicit about live-site cleanup rules', () => {
    expect(DEFAULT_USER_MESSAGE_TEMPLATE.length).toBeLessThan(700)
    expect(DEFAULT_USER_MESSAGE_TEMPLATE).toContain('no em dashes')
    expect(DEFAULT_USER_MESSAGE_TEMPLATE).toContain('no opening # H1')
  })

  it('builds user messages with recent posts for continuity only', () => {
    const message = buildUserMessage({
      topic: 'Compactor room cleanup',
      context: 'Tenant left furniture near the chute.',
      schedule: 'Immediate',
      recentPosts: [{ title: 'This Isn’t a Landfill', excerpt: 'A compactor room story.' }],
    })

    expect(message).toContain('Compactor room cleanup')
    expect(message).toContain('This Isn’t a Landfill')
    expect(message).toContain('for continuity only')
  })
})
