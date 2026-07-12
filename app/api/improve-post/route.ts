import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { AI_PROVIDER_LABELS, type AiTextProvider } from '@/lib/ai-providers'
import { isAdminSession } from '@/lib/auth-session'
import {
  buildDraftAssistantPrompt,
  parseDraftAssistantResponse,
  type DraftAssistantAction,
} from '@/lib/editor-assistant'
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit'
import { getSetting } from '@/lib/settings'
import type { AiSettings } from '@/lib/settings'

const postSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  content: z.string(),
  category: z.enum(['Life', 'Work', 'Hobbies', 'Experience']),
  tags: z.array(z.string()),
  author: z.object({
    name: z.string(),
    avatar: z.string().optional(),
    bio: z.string().optional(),
  }),
  publishedAt: z.string(),
  updatedAt: z.string().optional(),
  readTime: z.number(),
  status: z.enum(['draft', 'scheduled', 'published']),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
})

const bodySchema = z.object({
  action: z.enum(['title', 'excerpt', 'tags', 'intro', 'tone', 'grammar', 'humanize', 'promotion']),
  post: postSchema,
})

function resolveClaudeModel(ai: AiSettings): string {
  return ai.claudeModel.trim() || process.env.ANTHROPIC_MODEL?.trim() || 'claude-sonnet-4-6'
}

function resolveOpenAiModel(ai: AiSettings): string {
  return ai.openaiModel.trim() || process.env.OPENAI_TEXT_MODEL?.trim() || 'gpt-4.1'
}

async function callClaude(model: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: 'You return concise editorial JSON only.',
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Claude ${response.status}: ${text.slice(0, 200)}`)
  }

  const data = (await response.json()) as { content?: Array<{ text?: string }> }
  return data.content?.[0]?.text ?? ''
}

async function callOpenAi(model: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      messages: [
        { role: 'system', content: 'You return concise editorial JSON only.' },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`OpenAI ${response.status}: ${text.slice(0, 200)}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  return data.choices?.[0]?.message?.content ?? ''
}

async function callGroq(model: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY ?? ''}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      messages: [
        { role: 'system', content: 'You return concise editorial JSON only.' },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Groq ${response.status}: ${text.slice(0, 200)}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  return data.choices?.[0]?.message?.content ?? ''
}

async function generateAssistantSuggestion(
  action: DraftAssistantAction,
  ai: AiSettings,
  post: z.infer<typeof postSchema>
) {
  const available = new Set<AiTextProvider>()
  if (process.env.ANTHROPIC_API_KEY) available.add('claude')
  if (process.env.OPENAI_API_KEY) available.add('openai')
  if (process.env.GROQ_API_KEY) available.add('groq')

  const providers = ai.providerOrder.filter((provider) => available.has(provider))
  if (providers.length === 0) {
    throw new Error('No AI key configured. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, and/or GROQ_API_KEY.')
  }

  const prompt = buildDraftAssistantPrompt(action, post)
  const attempts: string[] = []
  let lastError = 'Assistant failed'

  for (const provider of providers) {
    const label = AI_PROVIDER_LABELS[provider]
    try {
      const raw =
        provider === 'claude'
          ? await callClaude(resolveClaudeModel(ai), prompt)
          : provider === 'openai'
            ? await callOpenAi(resolveOpenAiModel(ai), prompt)
            : await callGroq(ai.groqModel.trim() || 'llama-3.3-70b-versatile', prompt)

      if (!raw.trim()) {
        lastError = `${label} returned an empty response`
        attempts.push(`${label}: empty response`)
        continue
      }

      attempts.push(`${label}: passed`)
      return {
        provider,
        attempts,
        suggestion: parseDraftAssistantResponse(raw),
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Assistant failed'
      attempts.push(`${label}: ${lastError.slice(0, 120)}`)
      console.error(`improve-post: ${provider} failed`, error)
    }
  }

  throw new Error(lastError)
}

export async function POST(request: Request) {
  const clientId = getClientIdentifier(request)
  const limit = rateLimit({
    key: `improve-post:${clientId}`,
    windowMs: 10 * 60 * 1000,
    maxRequests: 12,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many assistant requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    )
  }

  const headersList = await headers()
  if (!(await isAdminSession(headersList.get('cookie')))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const ai = await getSetting('ai')
    const result = await generateAssistantSuggestion(parsed.data.action, ai, parsed.data.post)
    return NextResponse.json({
      success: true,
      provider: result.provider,
      providerLabel: AI_PROVIDER_LABELS[result.provider],
      providerAttempts: result.attempts,
      suggestion: result.suggestion,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Assistant failed' },
      { status: 500 }
    )
  }
}
