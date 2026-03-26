import { z } from 'zod'

/**
 * Shared per-browser anonymous id (localStorage). Used for reactions and bookmark sync.
 * Reuses the same key as the original reactions implementation.
 */
export const VISITOR_DEVICE_STORAGE_KEY = 'blog:reaction_visitor:v1'

export const VISITOR_DEVICE_HEADER = 'x-visitor-id'

/** @deprecated Use VISITOR_DEVICE_HEADER */
export const REACTION_VISITOR_HEADER = VISITOR_DEVICE_HEADER

/** @deprecated Use VISITOR_DEVICE_STORAGE_KEY */
export const REACTION_VISITOR_STORAGE_KEY = VISITOR_DEVICE_STORAGE_KEY

export function getOrCreateVisitorDeviceId(): string {
  if (typeof window === 'undefined') return ''
  try {
    const existing = window.localStorage.getItem(VISITOR_DEVICE_STORAGE_KEY)
    if (existing) {
      const trimmed = existing.trim()
      if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          trimmed
        )
      ) {
        return trimmed
      }
    }
    const id = crypto.randomUUID()
    window.localStorage.setItem(VISITOR_DEVICE_STORAGE_KEY, id)
    return id
  } catch {
    return ''
  }
}

export function visitorUuidFromRequest(request: Request): string | null {
  const raw = request.headers.get(VISITOR_DEVICE_HEADER)?.trim()
  const parsed = z.string().uuid().safeParse(raw)
  return parsed.success ? parsed.data : null
}
