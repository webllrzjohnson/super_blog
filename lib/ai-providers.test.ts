import { describe, expect, it } from 'vitest'
import {
  DEFAULT_AI_PROVIDER_ORDER,
  isAiTextProvider,
  normalizeAiProviderOrder,
} from '@/lib/ai-providers'

describe('AI provider order', () => {
  it('defaults to Claude, OpenAI, Groq', () => {
    expect(DEFAULT_AI_PROVIDER_ORDER).toEqual(['claude', 'openai', 'groq'])
    expect(normalizeAiProviderOrder(undefined)).toEqual(['claude', 'openai', 'groq'])
  })

  it('keeps a custom valid order and appends missing providers', () => {
    expect(normalizeAiProviderOrder(['openai', 'claude'])).toEqual([
      'openai',
      'claude',
      'groq',
    ])
  })

  it('drops duplicates and unknown providers', () => {
    expect(normalizeAiProviderOrder(['groq', 'groq', 'xai', 'openai'])).toEqual([
      'groq',
      'openai',
      'claude',
    ])
  })

  it('validates provider ids', () => {
    expect(isAiTextProvider('claude')).toBe(true)
    expect(isAiTextProvider('openai')).toBe(true)
    expect(isAiTextProvider('groq')).toBe(true)
    expect(isAiTextProvider('grok')).toBe(false)
  })
})
