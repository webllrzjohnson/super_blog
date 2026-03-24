type RateLimitOptions = {
  key: string
  windowMs: number
  maxRequests: number
}

type RateLimitState = {
  count: number
  resetAt: number
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

const rateLimitStore = new Map<string, RateLimitState>()
const MAX_TRACKED_KEYS = 10_000

function nowMs(): number {
  return Date.now()
}

function trimStoreIfNeeded() {
  if (rateLimitStore.size < MAX_TRACKED_KEYS) {
    return
  }

  const now = nowMs()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key)
    }
  }
}

export function rateLimit(options: RateLimitOptions): RateLimitResult {
  trimStoreIfNeeded()

  const now = nowMs()
  const existing = rateLimitStore.get(options.key)

  if (!existing || existing.resetAt <= now) {
    const fresh: RateLimitState = {
      count: 1,
      resetAt: now + options.windowMs,
    }
    rateLimitStore.set(options.key, fresh)
    return {
      allowed: true,
      remaining: Math.max(0, options.maxRequests - fresh.count),
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    }
  }

  existing.count += 1
  rateLimitStore.set(options.key, existing)

  const allowed = existing.count <= options.maxRequests
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((existing.resetAt - now) / 1000)
  )

  return {
    allowed,
    remaining: Math.max(0, options.maxRequests - existing.count),
    retryAfterSeconds,
  }
}

export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim()
    if (firstIp) return firstIp
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  return 'unknown'
}
