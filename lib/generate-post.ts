import { getPostsFromDb, savePostToDb } from '@/lib/db-posts'
import {
  buildGroqUserMessage,
  buildShortSystemPrompt,
  buildSystemPrompt,
  buildUserMessage,
} from '@/lib/generate-post-prompts'
import { buildPostImageAlt, buildPostImagePrompt } from '@/lib/generate-post-image-prompt'
import {
  applyAiPromptPresetToContext,
  type AiPromptPresetId,
} from '@/lib/ai-prompt-presets'
import { AI_PROVIDER_LABELS, type AiTextProvider } from '@/lib/ai-providers'
import {
  normalizeTags,
  parseAiPostResponse,
  resolvePostStatus,
  sanitizeSlug,
} from '@/lib/parse-ai-post-response'
import { evaluateGeneratedPostQuality } from '@/lib/generated-post-quality'
import { calculateReadTime, defaultAuthor, getPublishedPosts } from '@/lib/posts'
import { revalidatePostsCache } from '@/lib/revalidate-cache'
import { saveUploadedImageBuffer, saveUploadedImageFile } from '@/lib/save-uploaded-image'
import { getAvailableConfiguredAiTextProviders, getModelApiKey } from '@/lib/model-api-keys'
import { getSetting } from '@/lib/settings'
import type { AiSettings } from '@/lib/settings'
import type { Post } from '@/lib/types'

function resolveClaudeModel(ai: AiSettings): string {
  return (
    ai.claudeModel.trim() ||
    process.env.ANTHROPIC_MODEL?.trim() ||
    'claude-sonnet-4-6'
  )
}

function resolveOpenAiModel(ai: AiSettings): string {
  return (
    ai.openaiModel.trim() ||
    process.env.OPENAI_TEXT_MODEL?.trim() ||
    'gpt-4.1'
  )
}

export type GeneratePostParams = {
  topic: string
  context?: string
  schedule?: string
  featuredImage?: File | null
  promptPreset?: AiPromptPresetId
}

export type GeneratePostResult =
  | {
      ok: true
      post: Post
      model: AiTextProvider
      published: boolean
      warnings: string[]
      wordCount: number
      providerAttempts: string[]
    }
  | { ok: false; message: string }

export type GeneratePostPreviewResult =
  | {
      ok: true
      post: Post
      model: AiTextProvider
      warnings: string[]
      wordCount: number
      providerAttempts: string[]
    }
  | { ok: false; message: string }

async function fetchRecentPublishedPosts(): Promise<Array<{ title: string; excerpt: string }>> {
  const posts = await getPostsFromDb()
  return getPublishedPosts(posts)
    .slice(0, 3)
    .map((p) => ({ title: p.title, excerpt: p.excerpt }))
}

async function resolveFeaturedImage(
  topic: string,
  ai: AiSettings,
  featuredImage?: File | null
): Promise<{ url?: string; alt: string; error?: string }> {
  const alt = buildPostImageAlt(topic)

  if (featuredImage && featuredImage.size > 0) {
    const uploaded = await saveUploadedImageFile(featuredImage)
    return { url: uploaded.url, alt }
  }

  const apiKey = await getModelApiKey('openai')
  if (!apiKey) {
    return { alt, error: 'OpenAI API key not configured for featured image generation.' }
  }

  try {
    const imageRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: ai.imageModel.trim() || 'gpt-image-1',
        prompt: buildPostImagePrompt(topic, ai.imagePromptTemplate),
        size: '1536x1024',
      }),
    })

    if (!imageRes.ok) {
      const err = await imageRes.json().catch(() => ({}))
      return { alt, error: err.error?.message || 'OpenAI image generation failed.' }
    }

    const imageData = (await imageRes.json()) as { data?: Array<{ b64_json?: string }> }
    const b64 = imageData.data?.[0]?.b64_json
    if (!b64) return { alt, error: 'OpenAI returned no image data.' }

    const binary = Buffer.from(b64, 'base64')
    const uploaded = await saveUploadedImageBuffer(binary, 'image/png', 'dalle')
    return { url: uploaded.url, alt }
  } catch (error) {
    return {
      alt,
      error: error instanceof Error ? error.message : 'Featured image generation failed.',
    }
  }
}

async function callClaude(
  apiKey: string,
  model: string,
  system: string,
  user: string
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      model,
      max_tokens: 16000,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Claude ${response.status}: ${text.slice(0, 200)}`)
  }

  const data = (await response.json()) as { content?: Array<{ text?: string }> }
  return data.content?.[0]?.text ?? ''
}

async function callOpenAi(
  apiKey: string,
  model: string,
  system: string,
  user: string
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 12000,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
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

async function callGroq(
  apiKey: string,
  model: string,
  system: string,
  user: string
): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
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

async function generateRawPostText(
  ai: AiSettings,
  params: {
    topic: string
    context: string
    schedule: string
    recentPosts: Array<{ title: string; excerpt: string }>
  }
): Promise<{
  raw: string
  model: AiTextProvider
  warnings: string[]
  wordCount: number
  providerAttempts: string[]
}> {
  const availableProviders = await getAvailableConfiguredAiTextProviders()

  const providers = ai.providerOrder.filter((provider) => availableProviders.has(provider))

  if (providers.length === 0) {
    throw new Error(
      'No AI key configured. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, and/or GROQ_API_KEY.'
    )
  }

  const claudeModel = resolveClaudeModel(ai)
  const openaiModel = resolveOpenAiModel(ai)
  const groqModel = ai.groqModel.trim() || 'llama-3.3-70b-versatile'
  const systemPrompt = buildSystemPrompt(ai.claudeSystemPrompt)
  const userMessage = buildUserMessage(
    {
      topic: params.topic,
      context: params.context,
      schedule: params.schedule,
      recentPosts: params.recentPosts,
    },
    ai.userMessageTemplate
  )
  const groqSystemPrompt = buildShortSystemPrompt(ai.groqSystemPrompt)
  const groqUserMessage = buildGroqUserMessage(
    params.topic,
    params.context,
    ai.groqUserMessageTemplate
  )

  let lastError = 'AI generation failed'
  const providerAttempts: string[] = []

  for (const provider of providers) {
    const label = AI_PROVIDER_LABELS[provider]
    try {
      const raw =
        provider === 'claude'
          ? await callClaude((await getModelApiKey('anthropic'))!, claudeModel, systemPrompt, userMessage)
          : provider === 'openai'
            ? await callOpenAi((await getModelApiKey('openai'))!, openaiModel, systemPrompt, userMessage)
            : await callGroq((await getModelApiKey('groq'))!, groqModel, groqSystemPrompt, groqUserMessage)

      if (!raw.trim()) {
        lastError = `${label} returned an empty response`
        providerAttempts.push(`${label}: empty response`)
        continue
      }

      const parsed = parseAiPostResponse(raw)
      const quality = evaluateGeneratedPostQuality(parsed.meta, parsed.content)
      if (quality.errors.length > 0) {
        lastError = `${label} output failed quality checks: ${quality.errors.join(' ')}`
        providerAttempts.push(`${label}: failed quality checks`)
        continue
      }

      providerAttempts.push(`${label}: passed`)
      return {
        raw,
        model: provider,
        warnings: quality.warnings,
        wordCount: quality.wordCount,
        providerAttempts,
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'AI generation failed'
      providerAttempts.push(`${label}: ${lastError.slice(0, 120)}`)
      console.error(`generatePost: ${provider} failed`, error)
    }
  }

  const attemptedLabels = providers.map((provider) => AI_PROVIDER_LABELS[provider]).join(', ')
  throw new Error(
    providers.length > 1
      ? `AI generation failed (${attemptedLabels}). ${lastError}`
      : lastError
  )
}

async function buildGeneratedPostDraft(
  params: GeneratePostParams,
  options: { includeFeaturedImage: boolean }
): Promise<GeneratePostPreviewResult> {
  const topic = params.topic.trim()
  if (!topic) {
    return { ok: false, message: 'Topic is required' }
  }

  const context = applyAiPromptPresetToContext(
    params.promptPreset,
    params.context?.trim() || ''
  )
  const schedule = params.schedule?.trim() || 'Immediate'

  try {
    const ai = await getSetting('ai')
    const recentPosts = await fetchRecentPublishedPosts()
    const [image, generated] = await Promise.all([
      options.includeFeaturedImage
        ? resolveFeaturedImage(topic, ai, params.featuredImage)
        : Promise.resolve({ url: undefined, alt: buildPostImageAlt(topic), error: undefined }),
      generateRawPostText(ai, { topic, context, schedule, recentPosts }),
    ])

    if (options.includeFeaturedImage && !image.url && image.error) {
      return { ok: false, message: image.error }
    }

    const parsed = parseAiPostResponse(generated.raw)
    const slug = sanitizeSlug(parsed.meta.slug) || sanitizeSlug(parsed.meta.title)
    if (!slug) {
      return { ok: false, message: 'AI response did not include a valid slug' }
    }

    const allPosts = await getPostsFromDb()
    if (allPosts.some((p) => p.slug.trim().toLowerCase() === slug)) {
      return { ok: false, message: 'A post with this slug already exists. Try a different topic.' }
    }

    const { status, publishedAt } = resolvePostStatus(schedule)
    const today = new Date().toISOString().split('T')[0]
    const content = parsed.content.trim()
    const hasImage = Boolean(image.url)

    const post: Post = {
      id: crypto.randomUUID(),
      title: parsed.meta.title.trim(),
      slug,
      excerpt: parsed.meta.excerpt.trim(),
      content,
      category: parsed.meta.category,
      tags: normalizeTags(parsed.meta.tags),
      featuredImage: image.url,
      featuredImageAlt: hasImage ? image.alt : undefined,
      author: defaultAuthor,
      publishedAt,
      updatedAt: today,
      readTime: Math.max(1, calculateReadTime(content)),
      status,
    }

    return {
      ok: true,
      post,
      model: generated.model,
      warnings: generated.warnings,
      wordCount: generated.wordCount,
      providerAttempts: generated.providerAttempts,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Post generation failed',
    }
  }
}

export async function previewGeneratedPost(
  params: GeneratePostParams
): Promise<GeneratePostPreviewResult> {
  return buildGeneratedPostDraft(params, { includeFeaturedImage: true })
}

export async function generateAndSavePost(
  params: GeneratePostParams
): Promise<GeneratePostResult> {
  const draft = await buildGeneratedPostDraft(params, { includeFeaturedImage: true })
  if (!draft.ok) return draft

  const saved = await savePostToDb(draft.post)
  if (!saved) {
    return { ok: false, message: 'Failed to save post. Ensure the database is configured.' }
  }

  if (saved.status === 'published') {
    revalidatePostsCache()
  }

  return {
    ok: true,
    post: saved,
    model: draft.model,
    published: saved.status === 'published',
    warnings: draft.warnings,
    wordCount: draft.wordCount,
    providerAttempts: draft.providerAttempts,
  }
}
