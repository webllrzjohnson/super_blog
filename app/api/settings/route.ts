import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { getSetting, getSettings } from '@/lib/settings'
import { isAdminSession } from '@/lib/auth-session'
import { revalidateSettingsCache } from '@/lib/revalidate-cache'

async function checkAdmin(): Promise<boolean> {
  const headersList = await headers()
  return isAdminSession(headersList.get('cookie'))
}

const linksSchema = z.object({
  github: z.string().trim().optional(),
  linkedin: z.string().trim().optional(),
  contactEmail: z.string().trim().optional(),
  twitter: z.string().trim().optional(),
})

const brandingSchema = z.object({
  logoUrl: z.string().trim().optional(),
  faviconUrl: z.string().trim().optional(),
  siteName: z.string().trim().min(1),
})

const appearanceSchema = z.object({
  fontPair: z.string().trim().min(1),
  colorPreset: z.string().trim().min(1),
  customPrimaryOklch: z.string().trim().optional(),
})

const adsSchema = z.object({
  clientId: z.string().trim().optional(),
  slots: z.array(
    z
      .object({
        slotId: z.string().trim(),
        position: z.string().trim().min(1),
        enabled: z.boolean(),
      })
      .refine((slot) => !slot.enabled || slot.slotId.length > 0, {
        message: 'Enabled ad slots require a slot ID',
        path: ['slotId'],
      })
  ),
})

const pagesSchema = z.object({
  about: z.string().optional(),
  privacy: z.string().optional(),
  contact: z.string().optional(),
  disclaimer: z.string().optional(),
})

const settingSchemas = {
  links: linksSchema,
  branding: brandingSchema,
  appearance: appearanceSchema,
  ads: adsSchema,
  pages: pagesSchema,
} as const

const bodySchema = z.object({
  key: z.enum(['links', 'branding', 'appearance', 'ads', 'pages']),
  value: z.unknown(),
})

export async function GET() {
  const isAdmin = await checkAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await getSettings()
  const { admin_password_hash: _adminPasswordHash, ...publicSettings } = settings
  return NextResponse.json(publicSettings)
}

export async function POST(request: Request) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsedBody = bodySchema.safeParse(body)

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsedBody.error.flatten() },
      { status: 400 }
    )
  }

  const { key, value } = parsedBody.data
  const parsedValue = settingSchemas[key].safeParse(value)

  if (!parsedValue.success) {
    return NextResponse.json(
      { error: `Invalid ${key} settings`, details: parsedValue.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = createServerClient()
  const { error } = await supabase
    .from('site_settings')
    .upsert(
      {
        key,
        value: parsedValue.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    )

  if (error) {
    Sentry.captureException(error, { extra: { settingsKey: key } })
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }

  revalidateSettingsCache()
  const savedSetting = await getSetting(key)
  return NextResponse.json({ key, value: savedSetting })
}
