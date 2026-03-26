'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { generateSlug } from '@/lib/store'
import type { Post } from '@/lib/types'
import {
  evaluatePublishChecklist,
  RECOMMENDED_EXCERPT_LENGTH,
} from '@/lib/editorial-checklist'
import {
  insertAroundSelection,
  insertImageMarkdown,
  insertLinkMarkdown,
  insertSnippet,
} from '@/lib/markdown-content-helpers'
import { MarkdownContentToolbar } from '@/components/admin/markdown-content-toolbar'
import { calculateReadTime } from '@/lib/posts'
import { ArrowLeft, Eye, ImagePlus, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface PostEditorProps {
  post: Post
  isNew: boolean
  onSave: (post: Post) => void
  onAutoSave?: (post: Post) => Promise<void> | void
  onCancel: () => void
}

const categories = ['Life', 'Work', 'Hobbies', 'Experience'] as const

function toDateTimeLocalValue(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''

  const adjusted = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000)
  return adjusted.toISOString().slice(0, 16)
}

function fromDateTimeLocalValue(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString()
}

function countWords(text: string): number {
  const t = text.trim()
  if (!t) return 0
  return t.split(/\s+/).length
}

function PublishChecklistPanel({ formData }: { formData: Post }) {
  const { errors, warnings } = evaluatePublishChecklist(formData)
  const allClear = errors.length === 0 && warnings.length === 0
  const hasIssues = errors.length > 0 || warnings.length > 0

  return (
    <div
      id="admin-publish-checklist"
      tabIndex={-1}
      className="rounded-lg border border-border bg-muted/30 p-4 space-y-3 scroll-mt-24 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      role="region"
      aria-label="Publish checklist"
    >
      <p className="text-sm font-medium text-foreground">Publish checklist</p>
      <p className="text-xs text-muted-foreground">
        Publishing and scheduling run these checks. Saving a draft does not.
      </p>
      {hasIssues && (
        <p className="text-xs font-medium text-foreground">
          {errors.length} blocking · {warnings.length} warning{warnings.length === 1 ? '' : 's'}
        </p>
      )}
      <ul className="text-sm space-y-2 list-none m-0 p-0">
        {errors.map((e, i) => (
          <li key={`err-${i}-${e.slice(0, 40)}`} className="text-destructive flex gap-2">
            <span aria-hidden>✗</span>
            <span>{e}</span>
          </li>
        ))}
        {warnings.map((w, i) => (
          <li
            key={`warn-${i}-${w.slice(0, 40)}`}
            className="text-amber-700 dark:text-amber-500 flex gap-2"
          >
            <span aria-hidden>!</span>
            <span>{w}</span>
          </li>
        ))}
        {allClear && (
          <li className="text-green-700 dark:text-green-600 flex gap-2">
            <span aria-hidden>✓</span>
            <span>No blocking issues — ready to publish or schedule.</span>
          </li>
        )}
      </ul>
    </div>
  )
}

export function PostEditor({
  post,
  isNew,
  onSave,
  onAutoSave,
  onCancel,
}: PostEditorProps) {
  const [formData, setFormData] = useState<Post>(post)
  const [showPreview, setShowPreview] = useState(false)
  const [tagsInput, setTagsInput] = useState(post.tags.join(', '))
  const [uploading, setUploading] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<Date | null>(null)
  const [scheduleInput, setScheduleInput] = useState(
    toDateTimeLocalValue(post.publishedAt)
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const contentImageInputRef = useRef<HTMLInputElement>(null)
  const contentInsertSelectionRef = useRef<{ start: number; end: number }>({
    start: 0,
    end: 0,
  })
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)
  const initialSnapshotRef = useRef(JSON.stringify(post))

  const applyMarkdownEdit = (result: {
    text: string
    selStart: number
    selEnd: number
  }) => {
    setFormData((prev) => ({ ...prev, content: result.text }))
    requestAnimationFrame(() => {
      const ta = contentTextareaRef.current
      if (!ta) return
      ta.focus()
      ta.selectionStart = result.selStart
      ta.selectionEnd = result.selEnd
    })
  }

  useEffect(() => {
    setFormData(post)
    setTagsInput(post.tags.join(', '))
    setShowPreview(false)
    setScheduleInput(toDateTimeLocalValue(post.publishedAt))
    setLastAutoSavedAt(null)
    initialSnapshotRef.current = JSON.stringify(post)
  }, [post])

  const hasUnsavedChanges =
    JSON.stringify(formData) !== initialSnapshotRef.current

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  useEffect(() => {
    if (!onAutoSave || !hasUnsavedChanges || uploading || isAutoSaving) {
      return
    }

    if (!formData.title.trim() || !formData.slug.trim()) {
      return
    }

    if (formData.status === 'published') {
      return
    }

    const interval = window.setInterval(async () => {
      const autoSaveStatus: Post['status'] =
        formData.status === 'scheduled' ? 'scheduled' : 'draft'
      const payload: Post = {
        ...formData,
        status: autoSaveStatus,
      }

      if (autoSaveStatus === 'scheduled') {
        const scheduleDate = new Date(payload.publishedAt)
        if (
          Number.isNaN(scheduleDate.getTime()) ||
          scheduleDate.getTime() <= Date.now()
        ) {
          return
        }
      }

      setIsAutoSaving(true)
      try {
        await onAutoSave(payload)
        initialSnapshotRef.current = JSON.stringify(payload)
        setLastAutoSavedAt(new Date())
      } finally {
        setIsAutoSaving(false)
      }
    }, 20000)

    return () => {
      window.clearInterval(interval)
    }
  }, [formData, hasUnsavedChanges, isAutoSaving, onAutoSave, uploading])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from title
      ...(name === 'title' && { slug: generateSlug(value) }),
    }))
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value)
    const tags = e.target.value
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
    setFormData((prev) => ({ ...prev, tags }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Upload failed')
      }
      const { url } = await res.json()
      setFormData((prev) => ({ ...prev, featuredImage: url }))
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const openContentImagePicker = () => {
    const ta = contentTextareaRef.current
    if (ta) {
      contentInsertSelectionRef.current = {
        start: ta.selectionStart,
        end: ta.selectionEnd,
      }
    } else {
      contentInsertSelectionRef.current = {
        start: formData.content.length,
        end: formData.content.length,
      }
    }
    contentImageInputRef.current?.click()
  }

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Upload failed')
      }
      const { url } = await res.json()
      const ta = contentTextareaRef.current
      const { start, end } = contentInsertSelectionRef.current
      const value = ta?.value ?? formData.content
      const snippet = `\n\n![Describe this image](${url})\n\n`
      applyMarkdownEdit(insertSnippet(value, { start, end }, snippet))
      toast.success('Image inserted in post')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleScheduleInputChange = (value: string) => {
    setScheduleInput(value)
    const isoValue = fromDateTimeLocalValue(value)
    if (!isoValue) return
    setFormData((prev) => ({ ...prev, publishedAt: isoValue }))
  }

  const handleSave = (status: 'draft' | 'scheduled' | 'published') => {
    if (status !== 'draft') {
      const { errors, warnings } = evaluatePublishChecklist(formData)
      if (errors.length > 0) {
        toast.error('Fix checklist issues first', {
          description: errors.join(' · '),
        })
        requestAnimationFrame(() => {
          document.getElementById('admin-publish-checklist')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
          ;(document.getElementById('admin-publish-checklist') as HTMLElement | null)?.focus({
            preventScroll: true,
          })
        })
        return
      }
      if (warnings.length > 0) {
        const proceed = window.confirm(
          ['Warnings:', ...warnings.map((w) => `• ${w}`), '', 'Continue anyway?'].join('\n')
        )
        if (!proceed) return
      }
    }

    if (status === 'scheduled') {
      const scheduleDate = new Date(formData.publishedAt)
      if (Number.isNaN(scheduleDate.getTime())) {
        toast.error('Please choose a valid date and time to schedule.')
        return
      }

      if (scheduleDate.getTime() <= Date.now()) {
        toast.error('Scheduled publish time must be in the future.')
        return
      }
    }

    const publishedAt =
      status === 'published' && formData.status !== 'published'
        ? new Date().toISOString()
        : formData.publishedAt

    onSave({ ...formData, status, publishedAt })
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = confirm(
        'You have unsaved changes. Are you sure you want to leave this editor?'
      )
      if (!confirmed) {
        return
      }
    }
    onCancel()
  }

  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!e.ctrlKey && !e.metaKey) return
    const ta = e.currentTarget
    const key = e.key.toLowerCase()
    const sel = { start: ta.selectionStart, end: ta.selectionEnd }
    const value = ta.value

    if (key === 'b') {
      e.preventDefault()
      applyMarkdownEdit(insertAroundSelection(value, sel, '**', '**', 'bold'))
      return
    }
    if (key === 'i') {
      e.preventDefault()
      applyMarkdownEdit(insertAroundSelection(value, sel, '*', '*', 'italic'))
      return
    }
    if (key === 'k') {
      e.preventDefault()
      applyMarkdownEdit(insertLinkMarkdown(value, sel))
      return
    }
    if (key === '`') {
      e.preventDefault()
      applyMarkdownEdit(insertAroundSelection(value, sel, '`', '`', 'code'))
      return
    }
    if (e.shiftKey && key === 'i') {
      e.preventDefault()
      applyMarkdownEdit(insertImageMarkdown(value, sel))
    }
  }

  const featuredAltInvalid =
    Boolean(formData.featuredImage?.trim()) && !formData.featuredImageAlt?.trim()

  const bodyWords = countWords(formData.content)
  const bodyReadMinutes = calculateReadTime(formData.content)
  const excerptLen = formData.excerpt.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Back to posts list"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to posts
        </button>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          aria-pressed={showPreview}
          aria-label={showPreview ? 'Switch to edit mode' : 'Preview post'}
        >
          <Eye className="h-4 w-4 mr-2" />
          {showPreview ? 'Edit' : 'Preview'}
        </Button>
      </div>

      <h2 className="text-xl font-semibold text-foreground">
        {isNew ? 'Create New Post' : 'Edit Post'}
      </h2>
      <div className="text-sm text-muted-foreground">
        {isAutoSaving
          ? 'Autosaving...'
          : lastAutoSavedAt
            ? `Last autosaved at ${lastAutoSavedAt.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}`
            : 'Autosave runs every 20 seconds for draft/scheduled edits.'}
      </div>

      {showPreview ? (
        /* Preview Mode */
        <div className="border border-border rounded-lg p-6 bg-card">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {formData.title || 'Untitled'}
          </h1>
          <p className="text-muted-foreground mb-1">{formData.excerpt}</p>
          <p className="text-xs text-muted-foreground mb-6">
            {bodyWords > 0
              ? `${bodyWords.toLocaleString()} words · ${bodyReadMinutes} min read`
              : 'No body text yet'}
          </p>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown>{formData.content}</ReactMarkdown>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Post title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="post-url-slug"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Brief description of the post..."
              rows={2}
              aria-describedby="excerpt-length-hint"
            />
            <p id="excerpt-length-hint" className="text-xs text-muted-foreground">
              {excerptLen.toLocaleString()} characters
              {excerptLen > 0 && excerptLen < RECOMMENDED_EXCERPT_LENGTH ? (
                <span className="text-amber-700 dark:text-amber-500">
                  {' '}
                  · longer excerpts (around {RECOMMENDED_EXCERPT_LENGTH}+) read better in listings and
                  previews
                </span>
              ) : null}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={handleTagsChange}
                placeholder="career, productivity, life"
              />
            </div>
          </div>

          <div className="space-y-2 max-w-sm">
            <Label htmlFor="scheduleAt">Schedule Publish (optional)</Label>
            <Input
              id="scheduleAt"
              type="datetime-local"
              value={scheduleInput}
              onChange={(e) => handleScheduleInputChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Set a future date and use the Schedule button to queue this post.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="featuredImage">Featured Image (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="featuredImage"
                name="featuredImage"
                value={formData.featuredImage || ''}
                onChange={handleChange}
                placeholder="Paste URL or upload below"
                className="flex-1"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                className="hidden"
                aria-label="Upload image file for featured image"
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload featured image from file"
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            {formData.featuredImage && (
              <>
                <div className="space-y-2 mt-3">
                  <Label htmlFor="featuredImageAlt">Featured image alt text</Label>
                  <Input
                    id="featuredImageAlt"
                    name="featuredImageAlt"
                    value={formData.featuredImageAlt || ''}
                    onChange={handleChange}
                    placeholder="Describe the image for screen readers and SEO"
                    aria-describedby="featured-alt-hint"
                    aria-invalid={featuredAltInvalid || undefined}
                  />
                  <p id="featured-alt-hint" className="text-xs text-muted-foreground">
                    Required before publish when a hero image is set (see checklist).
                  </p>
                </div>
                <img
                  src={formData.featuredImage}
                  alt={formData.featuredImageAlt?.trim() || 'Featured preview'}
                  className="mt-2 h-24 w-auto rounded border border-border object-cover"
                />
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown)</Label>
            <p id="content-markdown-hint" className="text-xs text-muted-foreground">
              Toolbar or shortcuts: Ctrl+B bold, Ctrl+I italic, Ctrl+` code, Ctrl+K link, Ctrl+Shift+I
              image (⌘ on Mac). Upload inserts a figure at the cursor.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <MarkdownContentToolbar
                  textareaRef={contentTextareaRef}
                  disabled={showPreview}
                  onEdit={applyMarkdownEdit}
                />
              </div>
              <input
                ref={contentImageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                className="hidden"
                aria-label="Upload image into post body"
                onChange={handleContentImageUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                disabled={uploading}
                onClick={openContentImagePicker}
                aria-label="Upload image into post body at cursor"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload into post'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {bodyWords > 0
                ? `${bodyWords.toLocaleString()} words · ~${bodyReadMinutes} min read (same estimate as on the live site)`
                : 'Start writing to see word count and read time'}
            </p>
            <Textarea
              ref={contentTextareaRef}
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              onKeyDown={handleContentKeyDown}
              placeholder="Write your post content here...

Use ## for headings
Separate paragraphs with blank lines"
              rows={20}
              className="font-mono text-sm"
              aria-describedby="content-markdown-hint"
            />
          </div>

          <PublishChecklistPanel formData={formData} />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <Button type="button" onClick={() => handleSave('draft')} variant="outline">
          Save as Draft
        </Button>
        <Button type="button" onClick={() => handleSave('scheduled')} variant="outline">
          Schedule
        </Button>
        <Button type="button" onClick={() => handleSave('published')}>
          Publish
        </Button>
        <Button type="button" variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
