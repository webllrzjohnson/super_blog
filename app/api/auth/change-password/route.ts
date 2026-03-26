import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Resend } from 'resend'
import { compare, hash } from 'bcryptjs'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { getSetting } from '@/lib/settings'
import { isAdminSession } from '@/lib/auth-session'
import { revalidateSettingsCache } from '@/lib/revalidate-cache'

async function checkAdmin(): Promise<boolean> {
  const headersList = await headers()
  return isAdminSession(headersList.get('cookie'))
}

const schema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  })

export async function POST(request: Request) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const storedHash = await getSetting('admin_password_hash')
  const envPassword = process.env.ADMIN_PASSWORD

  if (!storedHash && !envPassword) {
    return NextResponse.json(
      { error: 'Admin auth not configured. Set ADMIN_PASSWORD in .env.local' },
      { status: 500 }
    )
  }

  const currentPasswordMatches = storedHash
    ? await compare(parsed.data.currentPassword, storedHash)
    : parsed.data.currentPassword === envPassword

  if (!currentPasswordMatches) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
  }

  const newPasswordHash = await hash(parsed.data.newPassword, 10)
  const supabase = createServerClient()
  const { error } = await supabase
    .from('site_settings')
    .upsert(
      {
        key: 'admin_password_hash',
        value: newPasswordHash,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    )

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }

  revalidateSettingsCache()

  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  const toEmail = process.env.CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL

  if (apiKey && toEmail) {
    try {
      const resend = new Resend(apiKey)
      const siteName = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'Blog'

      await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: `Admin password changed - ${siteName}`,
        html: `
          <p>The admin password was updated successfully.</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        `,
      })
    } catch (emailError) {
      console.error('Password change email error:', emailError)
    }
  }

  return NextResponse.json({ success: true })
}
