import { getPostsFromDb, savePostToDb } from '@/lib/db-posts'
import {
  buildFeaturedImagePrompt,
  buildGroqUserMessage,
  buildShortSystemPrompt,
  buildSystemPrompt,
  buildUserMessage,
} from '@/lib/generate-post-prompts'
import {
  normalizeTags,
  parseAiPostResponse,
  resolvePostStatus,
  sanitizeSlug,
} from '@/lib/parse-ai-post-response'
import { calculateReadTime, defaultAuthor, getPublishedPosts } from '@/lib/posts'
import { revalidatePostsCache } from '@/lib/revalidate-cache'
import { saveUploadedImageBuffer, saveUploadedImageFile } from '@/lib/save-uploaded-image'
import type { Post } from '@/lib/types'

const CLAUDE_MODEL =
  process.env.ANTHROPIC_MODEL?.trim() || 'claude-sonnet-4-6'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

export type GeneratePostParams = {
  topic: string
  context?: string
  schedule?: string
  featuredImage?: File | null
}

export type GeneratePostResult =
  | { ok: true; post: Post; model: 'claude' | 'groq'; published: boolean }
  | { ok: false; message: string }

async function fetchRecentPublishedPosts(): Promise<Array<{ title: string; excerpt: string }>> {
  const posts = await getPostsFromDb()
  return getPublishedPosts(posts)
    .slice(0, 3)
    .map((p) => ({ title: p.title, excerpt: p.excerpt }))
}

async function resolveFeaturedImage(
  topic: string,
  featuredImage?: File | null
): Promise<{ url?: string; alt: string }> {
  const alt = topic
    ? `Comic illustration for a blog post about ${topic}`
    : 'Comic illustration of a residential apartment building interior'

  if (featuredImage && featuredImage.size > 0) {
    const uploaded = await saveUploadedImageFile(featuredImage)
    return { url: uploaded.url, alt }
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return { alt }
  }

  try {
    const imageRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: buildFeaturedImagePrompt(topic),
        size: '1536x1024',
      }),
    })

    if (!imageRes.ok) {
      return { alt }
    }

    const imageData = (await imageRes.json()) as { data?: Array<{ b64_json?: string }> }
    const b64 = imageData.data?.[0]?.b64_json
    if (!b64) return { alt }

    const binary = Buffer.from(b64, 'base64')
    const uploaded = await saveUploadedImageBuffer(binary, 'image/png', 'dalle')
    return { url: uploaded.url, alt }
  } catch {
    return { alt }
  }
}

async function callClaude(system: string, user: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
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

async function callGroq(system: string, user: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY ?? ''}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
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

async function generateRawPostText(params: {
  topic: string
  context: string
  schedule: string
  recentPosts: Array<{ title: string; excerpt: string }>
}): Promise<{ raw: string; model: 'claude' | 'groq' }> {
  const hasClaude = Boolean(process.env.ANTHROPIC_API_KEY)
  const hasGroq = Boolean(process.env.GROQ_API_KEY)

  if (!hasClaude && !hasGroq) {
    throw new Error(
      'No AI key configured. Set ANTHROPIC_API_KEY (primary) and/or GROQ_API_KEY (fallback).'
    )
  }

  const systemPrompt = buildSystemPrompt()
  const userMessage = buildUserMessage({
    topic: params.topic,
    context: params.context,
    schedule: params.schedule,
    recentPosts: params.recentPosts,
  })

  const providers: Array<'claude' | 'groq'> = []
  if (hasClaude) providers.push('claude')
  if (hasGroq) providers.push('groq')

  let lastError = 'AI generation failed'

  for (const provider of providers) {
    try {
      const raw =
        provider === 'claude'
          ? await callClaude(systemPrompt, userMessage)
          : await callGroq(
              buildShortSystemPrompt(),
              buildGroqUserMessage(params.topic, params.context)
            )

      if (!raw.trim()) {
        lastError = 'AI returned an empty response'
        continue
      }

      parseAiPostResponse(raw)
      return { raw, model: provider }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'AI generation failed'
      console.error(`generatePost: ${provider} failed`, error)
    }
  }

  throw new Error(
    providers.length > 1
      ? `AI generation failed (Claude and Groq). ${lastError}`
      : lastError
  )
}

export async function generateAndSavePost(
  params: GeneratePostParams
): Promise<GeneratePostResult> {
  const topic = params.topic.trim()
  if (!topic) {
    return { ok: false, message: 'Topic is required' }
  }

  const context = params.context?.trim() || ''
  const schedule = params.schedule?.trim() || 'Immediate'

  try {
    const recentPosts = await fetchRecentPublishedPosts()
    const [image, ai] = await Promise.all([
      resolveFeaturedImage(topic, params.featuredImage),
      generateRawPostText({ topic, context, schedule, recentPosts }),
    ])

    const parsed = parseAiPostResponse(ai.raw)
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

    const post: Post = {
      id: crypto.randomUUID(),
      title: parsed.meta.title.trim(),
      slug,
      excerpt: parsed.meta.excerpt.trim(),
      content,
      category: parsed.meta.category,
      tags: normalizeTags(parsed.meta.tags),
      featuredImage: image.url,
      featuredImageAlt: image.url ? image.alt : undefined,
      author: defaultAuthor,
      publishedAt,
      updatedAt: today,
      readTime: Math.max(1, calculateReadTime(content)),
      status,
    }

    const saved = await savePostToDb(post)
    if (!saved) {
      return { ok: false, message: 'Failed to save post. Ensure the database is configured.' }
    }

    if (status === 'published') {
      revalidatePostsCache()
    }

    return {
      ok: true,
      post: saved,
      model: ai.model,
      published: status === 'published',
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Post generation failed',
    }
  }
}
