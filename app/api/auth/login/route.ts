import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { compare } from 'bcryptjs'
import { getSetting } from '@/lib/settings'
import { createSessionToken } from '@/lib/auth-session'
import { getClientIdentifier, rateLimit } from '@/lib/rate-limit'

const loginSchema = z.object({ password: z.string() })

const FAILED_LOGIN_WINDOW_MS = 15 * 60 * 1000
const MAX_FAILED_LOGINS = 5
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000

type FailedLoginState = {
  count: number
  resetAt: number
  lockedUntil?: number
}

const failedLoginStore = new Map<string, FailedLoginState>()

function getFailedState(clientId: string): FailedLoginState {
  const now = Date.now()
  const existing = failedLoginStore.get(clientId)

  if (!existing || existing.resetAt <= now) {
    const fresh: FailedLoginState = {
      count: 0,
      resetAt: now + FAILED_LOGIN_WINDOW_MS,
    }
    failedLoginStore.set(clientId, fresh)
    return fresh
  }

  if (existing.lockedUntil && existing.lockedUntil <= now) {
    existing.lockedUntil = undefined
    existing.count = 0
    existing.resetAt = now + FAILED_LOGIN_WINDOW_MS
    failedLoginStore.set(clientId, existing)
  }

  return existing
}

function registerFailedLogin(clientId: string): FailedLoginState {
  const state = getFailedState(clientId)
  const now = Date.now()
  state.count += 1

  if (state.count >= MAX_FAILED_LOGINS) {
    state.lockedUntil = now + LOGIN_LOCKOUT_MS
  }

  failedLoginStore.set(clientId, state)
  return state
}

export async function POST(request: Request) {
  const clientId = getClientIdentifier(request)
  const burstLimit = rateLimit({
    key: `auth:login:burst:${clientId}`,
    windowMs: 60 * 1000,
    maxRequests: 10,
  })

  if (!burstLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again shortly.' },
      {
        status: 429,
        headers: { 'Retry-After': String(burstLimit.retryAfterSeconds) },
      }
    )
  }

  const failedState = getFailedState(clientId)
  if (failedState.lockedUntil && failedState.lockedUntil > Date.now()) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((failedState.lockedUntil - Date.now()) / 1000)
    )
    return NextResponse.json(
      { error: 'Too many failed logins. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSeconds) },
      }
    )
  }

  const body = await request.json()
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const storedHash = await getSetting('admin_password_hash')
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!storedHash && !adminPassword) {
    return NextResponse.json(
      { error: 'Admin auth not configured. Set ADMIN_PASSWORD in .env.local' },
      { status: 500 }
    )
  }

  const passwordIsValid = storedHash
    ? await compare(parsed.data.password, storedHash)
    : parsed.data.password === adminPassword

  if (!passwordIsValid) {
    const state = registerFailedLogin(clientId)
    if (state.lockedUntil && state.lockedUntil > Date.now()) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((state.lockedUntil - Date.now()) / 1000)
      )
      return NextResponse.json(
        { error: 'Too many failed logins. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSeconds) },
        }
      )
    }

    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  failedLoginStore.delete(clientId)

  const token = await createSessionToken()
  const cookieStore = await cookies()
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })

  return NextResponse.json({ success: true })
}
