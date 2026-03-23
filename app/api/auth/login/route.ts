import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { compare } from 'bcryptjs'
import { getSetting } from '@/lib/settings'
import { createSessionToken } from '@/lib/auth-session'

const loginSchema = z.object({ password: z.string() })

export async function POST(request: Request) {
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
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

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
