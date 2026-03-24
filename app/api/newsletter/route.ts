import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'
import { getClientIdentifier, rateLimit } from '@/lib/rate-limit'

const schema = z.object({ email: z.string().email() })

export async function POST(request: Request) {
  const clientId = getClientIdentifier(request)
  const limit = rateLimit({
    key: `newsletter:${clientId}`,
    windowMs: 10 * 60 * 1000,
    maxRequests: 5,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds) },
      }
    )
  }

  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Newsletter not configured. Set RESEND_API_KEY in .env.local' },
      { status: 503 }
    )
  }

  try {
    const resend = new Resend(apiKey)
    await resend.contacts.create({
      email: parsed.data.email,
      unsubscribed: false,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Newsletter signup error:', err)
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    )
  }
}
