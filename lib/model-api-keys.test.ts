import { describe, expect, it } from 'vitest'

import {
  MODEL_API_KEY_PROVIDERS,
  buildModelApiKeyPatch,
  getAvailableAiTextProviders,
  getEnvApiKeyName,
  isModelApiKeyProvider,
  maskApiKey,
} from './model-api-keys'

describe('model API key helpers', () => {
  it('supports the configured AI providers', () => {
    expect(MODEL_API_KEY_PROVIDERS).toEqual(['anthropic', 'openai', 'groq'])
    expect(isModelApiKeyProvider('openai')).toBe(true)
    expect(isModelApiKeyProvider('unknown')).toBe(false)
  })

  it('maps providers to environment variable names', () => {
    expect(getEnvApiKeyName('anthropic')).toBe('ANTHROPIC_API_KEY')
    expect(getEnvApiKeyName('openai')).toBe('OPENAI_API_KEY')
    expect(getEnvApiKeyName('groq')).toBe('GROQ_API_KEY')
  })

  it('maps configured API keys to text providers', () => {
    expect(getAvailableAiTextProviders({ anthropic: 'a', groq: 'g' })).toEqual(new Set(['claude', 'groq']))
  })

  it('masks keys without revealing the full value', () => {
    expect(maskApiKey('sk-1234567890abcdef')).toBe('configured ending cdef')
    expect(maskApiKey('')).toBe('not configured')
  })

  it('keeps existing keys unless a new key or explicit clear is submitted', () => {
    expect(
      buildModelApiKeyPatch(
        { openai: 'old-openai', anthropic: 'old-claude' },
        { openai: '  new-openai  ', anthropic: '', groq: '   ' },
        { groq: true }
      )
    ).toEqual({ openai: 'new-openai', anthropic: 'old-claude' })
  })
})
