import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
  honeypot: z.string().optional(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  if (parsed.data.honeypot) {
    return NextResponse.json({ success: true })
  }

  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  if (!apiKey || !toEmail) {
    return NextResponse.json(
      { error: 'Contact form not configured. Set RESEND_API_KEY and CONTACT_EMAIL in .env.local' },
      { status: 503 }
    )
  }

  try {
    const resend = new Resend(apiKey)
    const siteName = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'Blog'

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Contact form: ${parsed.data.name} - ${siteName}`,
      replyTo: parsed.data.email,
      html: `
        <p><strong>From:</strong> ${parsed.data.name} &lt;${parsed.data.email}&gt;</p>
        <p><strong>Message:</strong></p>
        <p>${parsed.data.message.replace(/\n/g, '<br>')}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}
