import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import {
  REACTION_KINDS,
  emptyReactionCounts,
  hashReactionVoter,
  isReactionKind,
  reactionKindSchema,
} from '@/lib/reactions'

describe('reactions', () => {
  const prevSecret = process.env.REACTION_VOTER_SECRET

  beforeEach(() => {
    process.env.REACTION_VOTER_SECRET = 'test-secret'
  })

  afterEach(() => {
    process.env.REACTION_VOTER_SECRET = prevSecret
  })

  it('has stable kind list', () => {
    expect(REACTION_KINDS.length).toBe(3)
    expect(reactionKindSchema.safeParse('helpful').success).toBe(true)
    expect(reactionKindSchema.safeParse('nope').success).toBe(false)
  })

  it('isReactionKind narrows', () => {
    expect(isReactionKind('insight')).toBe(true)
    expect(isReactionKind('spam')).toBe(false)
  })

  it('hashReactionVoter is deterministic for same uuid', () => {
    const uuid = '8f3d2c1a-4e5b-6c7d-8e9f-0a1b2c3d4e5f'
    expect(hashReactionVoter(uuid)).toBe(hashReactionVoter(uuid))
    expect(hashReactionVoter(uuid)).not.toBe(uuid)
  })

  it('emptyReactionCounts initializes zeros', () => {
    const c = emptyReactionCounts()
    expect(c.helpful + c.thanks + c.insight).toBe(0)
  })
})
