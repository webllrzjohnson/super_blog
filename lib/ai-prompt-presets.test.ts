import { describe, expect, it } from 'vitest'
import {
  AI_PROMPT_PRESETS,
  applyAiPromptPresetToContext,
  getAiPromptPreset,
  isAiPromptPresetId,
} from '@/lib/ai-prompt-presets'

describe('AI prompt presets', () => {
  it('exposes selectable presets for different content types', () => {
    expect(AI_PROMPT_PRESETS.length).toBeGreaterThanOrEqual(6)
    expect(AI_PROMPT_PRESETS.map((preset) => preset.id)).toContain('maintenance-incident-breakdown')
    expect(AI_PROMPT_PRESETS.map((preset) => preset.id)).toContain('ai-coding-experiment')
  })

  it('validates preset ids', () => {
    expect(isAiPromptPresetId('tenant-communication-lesson')).toBe(true)
    expect(isAiPromptPresetId('unknown')).toBe(false)
  })

  it('falls back to the default preset for unknown values', () => {
    expect(getAiPromptPreset('unknown').id).toBe('building-operations-story')
  })

  it('adds preset guidance ahead of user context', () => {
    const result = applyAiPromptPresetToContext(
      'maintenance-incident-breakdown',
      'Compactor failed after a cardboard box jam.'
    )

    expect(result).toContain('Content type preset: Maintenance incident breakdown.')
    expect(result).toContain('symptoms')
    expect(result).toContain('Additional context:')
    expect(result).toContain('Compactor failed')
  })
})
