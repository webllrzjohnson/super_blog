import { describe, expect, it } from 'vitest'
import { parseTelegramIdeaCapture } from '@/lib/telegram-idea-capture'

describe('parseTelegramIdeaCapture', () => {
  it('parses a simple blog idea message with defaults', () => {
    expect(parseTelegramIdeaCapture('Blog idea: elevator outage communication lesson')).toEqual({
      title: 'elevator outage communication lesson',
      notes: '',
      category: 'Work',
      priority: 'medium',
      status: 'idea',
      targetPublishAt: null,
    })
  })

  it('parses category, priority, target date, and notes from labelled lines', () => {
    expect(parseTelegramIdeaCapture(`Blog idea: Basement flooding morning routine
Category: Work
Priority: high
Target: 2026-08-01
Notes: Rain, old townhomes, paperwork, technician follow-up.`)).toEqual({
      title: 'Basement flooding morning routine',
      notes: 'Rain, old townhomes, paperwork, technician follow-up.',
      category: 'Work',
      priority: 'high',
      status: 'idea',
      targetPublishAt: '2026-08-01T00:00:00.000Z',
    })
  })

  it('handles compact hashtag-like hints without keeping them in the title', () => {
    expect(parseTelegramIdeaCapture('idea: scooters in the hallway #life priority: low notes: weekend angle')).toEqual({
      title: 'scooters in the hallway',
      notes: 'weekend angle',
      category: 'Life',
      priority: 'low',
      status: 'idea',
      targetPublishAt: null,
    })
  })

  it('rejects messages without a usable title', () => {
    expect(() => parseTelegramIdeaCapture('Blog idea:   ')).toThrow('Idea title is required')
  })
})
