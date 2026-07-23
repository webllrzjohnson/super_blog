import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { isAdminSession } from '@/lib/auth-session'
import { getModelApiKeyStatus, upsertModelApiKeys } from '@/lib/model-api-keys'

async function checkAdmin(): Promise<boolean> {
  const headersList = await headers()
  return isAdminSession(headersList.get('cookie'))
}

const apiKeyPatchSchema = z.object({
  anthropic: z.string().optional(),
  openai: z.string().optional(),
  groq: z.string().optional(),
})

const apiKeyClearSchema = z.object({
  anthropic: z.boolean().optional(),
  openai: z.boolean().optional(),
  groq: z.boolean().optional(),
})

const bodySchema = z.object({
  keys: apiKeyPatchSchema.default({}),
  clear: apiKeyClearSchema.default({}),
})

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ providers: await getModelApiKeyStatus() })
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    await upsertModelApiKeys(parsed.data.keys, parsed.data.clear)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save API keys' },
      { status: 500 }
    )
  }

  return NextResponse.json({ providers: await getModelApiKeyStatus() })
}
