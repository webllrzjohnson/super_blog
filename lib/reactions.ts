import { createHmac } from 'crypto'
import { z } from 'zod'
import {
  VISITOR_DEVICE_HEADER,
  VISITOR_DEVICE_STORAGE_KEY,
} from '@/lib/visitor-device-id'

export const REACTION_KINDS = ['helpful', 'thanks', 'insight'] as const

export type ReactionKind = (typeof REACTION_KINDS)[number]

export const reactionKindSchema = z.enum(REACTION_KINDS)

/** @deprecated use VISITOR_DEVICE_HEADER from `@/lib/visitor-device-id` */
export const REACTION_VISITOR_HEADER = VISITOR_DEVICE_HEADER

/** @deprecated use VISITOR_DEVICE_STORAGE_KEY from `@/lib/visitor-device-id` */
export const REACTION_VISITOR_STORAGE_KEY = VISITOR_DEVICE_STORAGE_KEY

/** Labels for reaction buttons (accessible name includes count in UI). */
export const REACTION_LABELS: Record<ReactionKind, string> = {
  helpful: 'Helpful',
  thanks: 'Thanks',
  insight: 'Insight',
}

export function isReactionKind(value: string): value is ReactionKind {
  return (REACTION_KINDS as readonly string[]).includes(value)
}

function voterSecret(): string {
  return (
    process.env.REACTION_VOTER_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    'dev-reaction-voter-secret'
  )
}

/** Stable opaque id for storage; never persist raw visitor UUID. */
export function hashReactionVoter(visitorUuid: string): string {
  return createHmac('sha256', voterSecret()).update(visitorUuid).digest('hex')
}

export function emptyReactionCounts(): Record<ReactionKind, number> {
  return {
    helpful: 0,
    thanks: 0,
    insight: 0,
  }
}
