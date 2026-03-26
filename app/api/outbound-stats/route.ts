import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { isAdminSession } from '@/lib/auth-session'
import { getOutboundClickStatsSummary } from '@/lib/db/outbound-clicks'

async function checkAdmin(): Promise<boolean> {
  const headersList = await headers()
  return isAdminSession(headersList.get('cookie'))
}

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional(),
})

export async function GET(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const parsed = querySchema.safeParse({
    days: url.searchParams.get('days') ?? undefined,
  })
  const days = parsed.success ? (parsed.data.days ?? 30) : 30

  const summary = await getOutboundClickStatsSummary(days)

  if (!summary) {
    return NextResponse.json({
      configured: false,
      message:
        'Outbound click storage is unavailable. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, and apply migration 00004_outbound_click_events.sql.',
      summary: null,
    })
  }

  return NextResponse.json({
    configured: true,
    summary,
  })
}
