'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { AlertTriangle, CheckCircle2, Save, Sparkles, X } from 'lucide-react'
import { AI_PROMPT_PRESETS, DEFAULT_AI_PROMPT_PRESET_ID } from '@/lib/ai-prompt-presets'
import { AI_PROVIDER_LABELS, type AiTextProvider } from '@/lib/ai-providers'
import { evaluateGeneratedPostQuality } from '@/lib/generated-post-quality'
import { savePost } from '@/lib/store'
import type { Post } from '@/lib/types'

interface GeneratePostModalProps {
  onClose: () => void
  onGeneratedPost?: (post: Post) => void
}

type GenerateResponse = {
  message?: string
  slug?: string
  post?: Post
  model?: AiTextProvider
  wordCount?: number
  warnings?: string[]
  providerAttempts?: string[]
}

function QualityReviewPanel({ post, warnings, wordCount }: {
  post: Post
  warnings: string[]
  wordCount?: number
}) {
  const quality = useMemo(
    () => evaluateGeneratedPostQuality(
      {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        category: post.category,
        tags: post.tags.join(', '),
      },
      post.content
    ),
    [post]
  )
  const allWarnings = Array.from(new Set([...quality.warnings, ...warnings]))
  const blocking = quality.errors

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">AI draft review</p>
          <p className="text-xs text-muted-foreground">
            {wordCount ?? quality.wordCount} words · {blocking.length} blocking · {allWarnings.length} warning{allWarnings.length === 1 ? '' : 's'}
          </p>
        </div>
        {blocking.length === 0 ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden />
        ) : (
          <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden />
        )}
      </div>
      {blocking.length > 0 && (
        <ul className="space-y-1 text-sm text-destructive">
          {blocking.map((error) => <li key={error}>✗ {error}</li>)}
        </ul>
      )}
      {allWarnings.length > 0 && (
        <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-500">
          {allWarnings.slice(0, 5).map((warning) => <li key={warning}>! {warning}</li>)}
          {allWarnings.length > 5 && <li>+{allWarnings.length - 5} more warning(s)</li>}
        </ul>
      )}
      {blocking.length === 0 && allWarnings.length === 0 && (
        <p className="text-sm text-green-700 dark:text-green-600">No quality issues found in this draft.</p>
      )}
    </div>
  )
}

export function GeneratePostModal({ onClose, onGeneratedPost }: GeneratePostModalProps) {
  const [topic, setTopic] = useState('')
  const [context, setContext] = useState('')
  const [schedule, setSchedule] = useState('Immediate')
  const [promptPreset, setPromptPreset] = useState(DEFAULT_AI_PROMPT_PRESET_ID)
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [savingPreview, setSavingPreview] = useState(false)
  const [preview, setPreview] = useState<GenerateResponse | null>(null)

  const selectedPreset = AI_PROMPT_PRESETS.find((preset) => preset.id === promptPreset)

  const buildFormData = (mode: 'preview' | 'save') => {
    const formData = new FormData()
    formData.append('topic', topic)
    formData.append('context', context)
    formData.append('schedule', schedule)
    formData.append('promptPreset', promptPreset)
    formData.append('mode', mode)
    if (mode === 'save' && featuredImage) {
      formData.append('featured_image', featuredImage)
    }
    return formData
  }

  const generate = async (mode: 'preview' | 'save') => {
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/generate-post', {
        method: 'POST',
        credentials: 'include',
        body: buildFormData(mode),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to trigger generation')
      }

      const data = (await res.json()) as GenerateResponse
      const details = [
        data.post?.slug ?? data.slug ? `Slug: ${data.post?.slug ?? data.slug}` : null,
        data.wordCount ? `${data.wordCount} words` : null,
        data.providerAttempts?.length ? data.providerAttempts.join(' → ') : null,
        data.warnings?.length ? `${data.warnings.length} quality warning(s)` : null,
      ].filter(Boolean)

      if (mode === 'preview') {
        setPreview(data)
        toast.success(data.message || 'Preview generated', {
          description: details.length ? details.join(' · ') : undefined,
        })
        return
      }

      toast.success(data.message || 'Post generation complete', {
        description: details.length ? details.join(' · ') : undefined,
      })
      if (data.warnings?.length) {
        toast.warning('Generated draft needs review', {
          description: data.warnings.slice(0, 2).join(' '),
        })
      }
      onClose()
    } catch (err) {
      toast.error('Failed to generate post', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  const savePreview = async () => {
    if (!preview?.post) return

    setSavingPreview(true)
    try {
      const saved = await savePost({ ...preview.post, status: 'draft' })
      onGeneratedPost?.(saved)
      toast.success('AI preview saved as draft', {
        description: `${saved.title} · ${saved.readTime} min read`,
      })
      onClose()
    } catch (err) {
      toast.error('Failed to save AI preview', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setSavingPreview(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-border bg-background p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="h-5 w-5" />
              AI publishing workflow
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Generate a preview first, review quality warnings, then save it as a draft.
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" disabled={loading || savingPreview}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. How to handle tenant complaints professionally"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Prompt preset</label>
              <select
                value={promptPreset}
                onChange={(e) => setPromptPreset(e.target.value as typeof promptPreset)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {AI_PROMPT_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>{preset.label}</option>
                ))}
              </select>
              {selectedPreset && (
                <p className="mt-1 text-xs text-muted-foreground">{selectedPreset.description}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Context</label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Specific details, what happened, people involved, constraints, tone..."
                rows={5}
                className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Schedule</label>
              <select
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Immediate">Immediate</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Preview saves as draft; use the editor to publish or schedule after review.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Featured image for direct save</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFeaturedImage(e.target.files?.[0] ?? null)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Preview mode does not upload or generate images. Add one in the post editor after saving.
              </p>
              {featuredImage && <p className="mt-1 text-xs text-muted-foreground">{featuredImage.name}</p>}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={() => generate('preview')} disabled={loading || savingPreview}>
                {loading ? 'Generating...' : 'Generate preview'}
              </Button>
              <Button variant="outline" onClick={() => generate('save')} disabled={loading || savingPreview}>
                Generate and save immediately
              </Button>
              <Button variant="ghost" onClick={onClose} disabled={loading || savingPreview}>
                Cancel
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {!preview?.post ? (
              <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
                <div>
                  <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">No preview yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Generate a draft preview to inspect title, excerpt, tags, and quality warnings before saving.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <QualityReviewPanel
                  post={preview.post}
                  warnings={preview.warnings ?? []}
                  wordCount={preview.wordCount}
                />
                <article className="rounded-lg border border-border bg-background p-5 shadow-sm">
                  <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{preview.model ? AI_PROVIDER_LABELS[preview.model] : 'AI'}</span>
                    <span aria-hidden>·</span>
                    <span>{preview.post.category}</span>
                    <span aria-hidden>·</span>
                    <span>{preview.post.readTime} min read</span>
                  </div>
                  <h3 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">{preview.post.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{preview.post.excerpt}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {preview.post.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">#{tag}</span>
                    ))}
                  </div>
                  <div className="mt-5 max-h-80 overflow-y-auto rounded-md bg-muted/30 p-4 text-sm leading-6 text-foreground whitespace-pre-wrap">
                    {preview.post.content.slice(0, 3200)}
                    {preview.post.content.length > 3200 ? '\n\n…' : ''}
                  </div>
                </article>
                {preview.providerAttempts?.length ? (
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm font-medium text-foreground">Provider attempts</p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {preview.providerAttempts.map((attempt) => (
                        <li key={attempt}>• {attempt}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={savePreview} disabled={savingPreview || loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {savingPreview ? 'Saving...' : 'Save preview as draft'}
                  </Button>
                  <Button variant="outline" onClick={() => generate('preview')} disabled={loading || savingPreview}>
                    Regenerate preview
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
